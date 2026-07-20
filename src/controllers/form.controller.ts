import { Request, Response } from "express";
import {
  createFieldSchema,
  createFormSchema,
  updateFieldSchema,
  updateFormSchema,
} from "../utils/validators/form.validator";
import { FormService } from "../services/form.services";
import { ERRORS } from "../utils/errors";
import { parsePaginationQuery } from "../utils/pagination";

const formService = new FormService();

export class FormController {
  async createForm(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json(ERRORS.UNAUTHORIZED);
      }

      const result = createFormSchema.safeParse(req.body);

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

      const data = result.data;

      const response = await formService.createForm(userId, {
        title: data.title,
        description: data.description ?? null,
        expiresAt: data.expiresAt ?? null,
        maxResponses: data.maxResponses ?? null,
        oneResponsePerEmail: data.oneResponsePerEmail,
        captchaEnabled: data.captchaEnabled,
        fields: data.fields.map((field) => ({
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options ?? null,
          gridX: field.gridX,
          gridY: field.gridY,
          gridW: field.gridW,
          gridH: field.gridH,
        })),
      });
      res.status(201).json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async updateForm(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const formId = req.params.formId as string;

      if (!userId) {
        return res.status(401).json(ERRORS.UNAUTHORIZED);
      }

      const result = updateFormSchema.safeParse(req.body);

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

      const data = result.data;

      const response = await formService.updateForm(userId, formId, {
        title: data.title,
        description: data.description ?? null,
        expiresAt: data.expiresAt ?? null,
        maxResponses: data.maxResponses ?? null,
        oneResponsePerEmail: data.oneResponsePerEmail,
        captchaEnabled: data.captchaEnabled,
      });

      res.json(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERRORS.NO_DATA_TO_UPDATE.code) {
          return res.status(400).json(ERRORS.NO_DATA_TO_UPDATE);
        }
        if (error.message === ERRORS.FORM_NOT_FOUND.code) {
          return res.status(404).json(ERRORS.FORM_NOT_FOUND);
        }
      }
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteForm(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const formId = req.params.formId as string;

      if (!userId) {
        return res.status(401).json(ERRORS.UNAUTHORIZED);
      }

      await formService.deleteForm(userId, formId);

      res.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === ERRORS.FORM_NOT_FOUND.code
      ) {
        return res.status(404).json(ERRORS.FORM_NOT_FOUND);
      }
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllFormsByUser(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json(ERRORS.UNAUTHORIZED);
      }

      const pagination = parsePaginationQuery(
        req.query,
        ["title", "createdAt", "updatedAt", "isPublished", "currentResponseCount"],
        "createdAt",
      );

      const response = await formService.getAllFormsByUser(userId, pagination);

      res.json(response);
    } catch (error) {
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async getFormById(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const formId = req.params.formId as string;

      if (!userId) {
        return res.status(401).json(ERRORS.UNAUTHORIZED);
      }

      const response = await formService.getFormById(userId, formId);

      res.json(response);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === ERRORS.FORM_NOT_FOUND.code
      ) {
        return res.status(404).json(ERRORS.FORM_NOT_FOUND);
      }
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async addField(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const formId = req.params.formId as string;

      if (!userId) {
        return res.status(401).json(ERRORS.UNAUTHORIZED);
      }

      const result = createFieldSchema.safeParse(req.body);

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

      const response = await formService.addField(userId, formId, {
        label: result.data.label,
        type: result.data.type,
        required: result.data.required,
        options: result.data.options ?? null,
        gridX: result.data.gridX,
        gridY: result.data.gridY,
        gridW: result.data.gridW,
        gridH: result.data.gridH,
      });

      res.status(201).json(response);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === ERRORS.FORM_NOT_FOUND.code
      ) {
        return res.status(404).json(ERRORS.FORM_NOT_FOUND);
      }
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async removeField(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const formId = req.params.formId as string;
      const fieldId = req.params.fieldId as string;

      if (!userId) {
        return res.status(401).json(ERRORS.UNAUTHORIZED);
      }

      await formService.removeField(userId, formId, fieldId);

      res.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === ERRORS.FORM_NOT_FOUND.code
      ) {
        return res.status(404).json(ERRORS.FORM_NOT_FOUND);
      }
      if (
        error instanceof Error &&
        error.message === ERRORS.FIELD_NOT_FOUND.code
      ) {
        return res.status(404).json(ERRORS.FIELD_NOT_FOUND);
      }
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async updateField(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const formId = req.params.formId as string;
      const fieldId = req.params.fieldId as string;

      if (!userId) {
        return res.status(401).json(ERRORS.UNAUTHORIZED);
      }

      const result = updateFieldSchema.safeParse(req.body);

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

      const response = await formService.updateField(userId, formId, fieldId, {
        label: result.data.label,
        type: result.data.type,
        required: result.data.required,
        options: result.data.options ?? null,
        gridX: result.data.gridX,
        gridY: result.data.gridY,
        gridW: result.data.gridW,
        gridH: result.data.gridH,
      });

      res.json(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERRORS.FORM_NOT_FOUND.code) {
          return res.status(404).json(ERRORS.FORM_NOT_FOUND);
        }
        if (error.message === ERRORS.FIELD_NOT_FOUND.code) {
          return res.status(404).json(ERRORS.FIELD_NOT_FOUND);
        }
        if (error.message === ERRORS.NO_DATA_TO_UPDATE.code) {
          return res.status(400).json(ERRORS.NO_DATA_TO_UPDATE);
        }
      }
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async togglePublish(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const formId = req.params.formId as string;

      if (!userId) {
        return res.status(401).json(ERRORS.UNAUTHORIZED);
      }

      const response = await formService.togglePublish(userId, formId);

      res.json(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERRORS.FORM_NOT_FOUND.code) {
          return res.status(404).json(ERRORS.FORM_NOT_FOUND);
        }
        if (error.message === ERRORS.FORM_EXPIRED.code) {
          return res.status(400).json(ERRORS.FORM_EXPIRED);
        }
      }
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }
}
