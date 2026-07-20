import { Request, Response } from "express";
import { FormResponseService } from "../services/form-response.services";
import { ERRORS } from "../utils/errors";
import { AppBusinessError } from "../utils/custom-error";
import { parsePaginationQuery } from "../utils/pagination";
import { createResponseSchema } from "../utils/validators/form.validator";

const formResponseService = new FormResponseService();

export class FormResponseController {
  async submitResponse(req: Request, res: Response) {
    try {
      const formId = req.params.formId as string;
      const ipAddress = req.ip || null;

      const result = createResponseSchema.safeParse(req.body);

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

      const response = await formResponseService.submitResponse(
        formId,
        result.data,
        ipAddress,
      );
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof AppBusinessError) {
        const errorDef = ERRORS[error.code as keyof typeof ERRORS];
        return res.status(400).json({
          code: errorDef.code,
          message: errorDef.message,
          details: error.details,
        });
      }
      if (error instanceof Error) {
        const errorMap: Record<string, number> = {
          [ERRORS.FORM_NOT_FOUND.code]: 404,
          [ERRORS.FORM_NOT_PUBLISHED.code]: 400,
          [ERRORS.FORM_EXPIRED.code]: 400,
          [ERRORS.FORM_MAX_RESPONSES_REACHED.code]: 400,
          [ERRORS.EMAIL_ALREADY_RESPONDED.code]: 409,
          [ERRORS.CAPTCHA_REQUIRED.code]: 400,
          [ERRORS.CAPTCHA_INVALID.code]: 400,
        };
        const status = errorMap[error.message];
        if (status) {
          return res.status(status).json(ERRORS[error.message as keyof typeof ERRORS]);
        }
      }
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async getResponsesByForm(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const formId = req.params.formId as string;

      if (!userId) {
        return res.status(401).json(ERRORS.UNAUTHORIZED);
      }

      const pagination = parsePaginationQuery(
        req.query,
        ["email", "submittedAt"],
        "submittedAt",
      );

      const response = await formResponseService.getResponsesByForm(
        userId,
        formId,
        pagination,
      );
      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.message === ERRORS.FORM_NOT_FOUND.code) {
        return res.status(404).json(ERRORS.FORM_NOT_FOUND);
      }
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async getResponseById(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const formId = req.params.formId as string;
      const responseId = req.params.responseId as string;

      if (!userId) {
        return res.status(401).json(ERRORS.UNAUTHORIZED);
      }

      const response = await formResponseService.getResponseById(
        userId,
        formId,
        responseId,
      );
      res.json(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERRORS.FORM_NOT_FOUND.code) {
          return res.status(404).json(ERRORS.FORM_NOT_FOUND);
        }
        if (error.message === ERRORS.RESPONSE_NOT_FOUND.code) {
          return res.status(404).json(ERRORS.RESPONSE_NOT_FOUND);
        }
      }
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteResponse(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const formId = req.params.formId as string;
      const responseId = req.params.responseId as string;

      if (!userId) {
        return res.status(401).json(ERRORS.UNAUTHORIZED);
      }

      await formResponseService.deleteResponse(userId, formId, responseId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERRORS.FORM_NOT_FOUND.code) {
          return res.status(404).json(ERRORS.FORM_NOT_FOUND);
        }
        if (error.message === ERRORS.RESPONSE_NOT_FOUND.code) {
          return res.status(404).json(ERRORS.RESPONSE_NOT_FOUND);
        }
      }
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }
}
