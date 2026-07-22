import { Request, Response } from "express";
import { AuthService } from "../services/auth.services";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../utils/validators/auth.validator";
import prisma from "../config/database";
import type { UserResponse } from "../types/auth.types";
import { ERRORS } from "../utils/errors";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = registerSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          code: ERRORS.INVALID_DATA.code,
          message: ERRORS.INVALID_DATA.message,
          details: result.error.issues.map((issue) => ({
            field: issue.path.join(".") || "root",
            code: issue.message,
          })),
        });
      }

      const data = await authService.register(result.data);
      res.status(201).json(data);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === ERRORS.EMAIL_ALREADY_REGISTERED.code
      ) {
        return res.status(409).json(ERRORS.EMAIL_ALREADY_REGISTERED);
      }

      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json(ERRORS.TOKEN_REQUIRED);
      }

      const data = await authService.verifyEmail(token);
      res.json(data);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERRORS.TOKEN_INVALID.code) {
          return res.status(400).json(ERRORS.TOKEN_INVALID);
        }
        if (error.message === ERRORS.TOKEN_EXPIRED.code) {
          return res.status(410).json(ERRORS.TOKEN_EXPIRED);
        }
      }

      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = loginSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          code: ERRORS.INVALID_DATA.code,
          message: ERRORS.INVALID_DATA.message,
          details: result.error.issues.map((issue) => ({
            field: issue.path.join(".") || "root",
            code: issue.message,
          })),
        });
      }

      const data = await authService.login(
        result.data.email,
        result.data.password,
      );

      res.cookie('token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      res.json({ user: data.user });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERRORS.INVALID_CREDENTIALS.code) {
          return res.status(401).json(ERRORS.INVALID_CREDENTIALS);
        }
        if (error.message === ERRORS.EMAIL_NOT_VERIFIED.code) {
          return res.status(401).json(ERRORS.EMAIL_NOT_VERIFIED);
        }
      }

      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const result = forgotPasswordSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          code: ERRORS.INVALID_DATA.code,
          message: ERRORS.INVALID_DATA.message,
          details: result.error.issues.map((issue) => ({
            field: issue.path.join(".") || "root",
            code: issue.message,
          })),
        });
      }

      const data = await authService.forgotPassword(result.data);
      res.json(data);
    } catch (error) {
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const result = resetPasswordSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          code: ERRORS.INVALID_DATA.code,
          message: ERRORS.INVALID_DATA.message,
          details: result.error.issues.map((issue) => ({
            field: issue.path.join(".") || "root",
            code: issue.message,
          })),
        });
      }

      const data = await authService.resetPassword({
        token: result.data.token,
        password: result.data.password,
      });
      res.json(data);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERRORS.TOKEN_INVALID.code) {
          return res.status(400).json(ERRORS.TOKEN_INVALID);
        }
        if (error.message === ERRORS.TOKEN_EXPIRED.code) {
          return res.status(410).json(ERRORS.TOKEN_EXPIRED);
        }
      }

      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          email: true,
          name: true,
          lastName: true,
          photoUrl: true,
        },
      });

      if (!user) {
        return res.status(404).json(ERRORS.USER_NOT_FOUND);
      }

      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
      };

      res.json(userResponse);
    } catch (error) {
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }
}
