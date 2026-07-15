import { Request, Response } from "express";
import { AuthService } from "../services/auth.services";
import {
  registerSchema,
  loginSchema,
} from "../utils/validators/auth.validator";
import prisma from "../config/database";
import type { UserResponse } from "../types/auth.types";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = registerSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          error: "Datos inválidos",
          details: result.error.issues,
        });
      }

      const data = await authService.register(result.data);
      res.status(201).json(data);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "EMAIL_ALREADY_REGISTERED"
      ) {
        return res.status(409).json({ error: error.message });
      }

      res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: "TOKEN_REQUIRED" });
      }

      const data = await authService.verifyEmail(token);
      res.json(data);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "TOKEN_INVALID") {
          return res.status(400).json({ error: error.message });
        }
        if (error.message === "TOKEN_EXPIRED") {
          return res.status(410).json({ error: error.message });
        }
      }

      res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = loginSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          error: "IVALID_DATA",
          details: result.error.issues,
        });
      }

      const data = await authService.login(
        result.data.email,
        result.data.password,
      );
      res.json(data);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === "INVALID_CREDENTIALS" ||
          error.message === "EMAIL_NOT_VERIFIED"
        ) {
          return res.status(401).json({ error: error.message });
        }
      }

      res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
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
        return res.status(404).json({ error: "USER_NOT_FOUND" });
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
      res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  }
}
