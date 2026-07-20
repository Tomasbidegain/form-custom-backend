import z from "zod";
import { TypeField } from "../../generated/prisma/enums";

export const createFieldSchema = z
  .object({
    label: z.string().min(1, "FIELD_LABEL_REQUIRED"),
    type: z.enum(TypeField),
    required: z.boolean().optional().default(false),
    options: z.array(z.string()).optional(),
    gridX: z.number().int().min(0).max(11),
    gridY: z.number().int().min(0),
    gridW: z.number().int().min(1).max(12),
    gridH: z.number().int().min(1),
  })
  .refine((data) => data.gridX + data.gridW <= 12, {
    message: "GRID_OVERFLOW",
  });

export const createFormSchema = z.object({
  title: z.string().min(1, "TITLE_REQUIRED"),
  description: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  maxResponses: z.number().int().positive().optional(),
  oneResponsePerEmail: z.boolean().optional().default(false),
  captchaEnabled: z.boolean().optional().default(true),
  fields: z
    .array(createFieldSchema)
    .min(1, "FORM_MUST_HAVE_FIELDS"),
});

export const updateFormSchema = z.object({
  title: z.string().min(1, "TITLE_REQUIRED").optional(),
  description: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  maxResponses: z.number().int().positive().optional().nullable(),
  oneResponsePerEmail: z.boolean().optional(),
  captchaEnabled: z.boolean().optional(),
});

export const updateFieldSchema = z
  .object({
    label: z.string().min(1, "FIELD_LABEL_REQUIRED").optional(),
    type: z.enum(TypeField).optional(),
    required: z.boolean().optional(),
    options: z.array(z.string()).optional().nullable(),
    gridX: z.number().int().min(0).max(11).optional(),
    gridY: z.number().int().min(0).optional(),
    gridW: z.number().int().min(1).max(12).optional(),
    gridH: z.number().int().min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.gridX !== undefined && data.gridW !== undefined) {
        return data.gridX + data.gridW <= 12;
      }
      return true;
    },
    { message: "GRID_OVERFLOW" },
  );

export const createResponseSchema = z.object({
  email: z.string().email("INVALID_EMAIL").optional(),
  turnstileToken: z.string().optional(),
  fields: z
    .array(
      z.object({
        fieldId: z.string().uuid("INVALID_FIELD_ID"),
        value: z.string(),
      }),
    )
    .min(1, "INVALID_DATA"),
});
