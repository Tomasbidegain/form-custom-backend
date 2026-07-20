import z from "zod";

export const createFormResponseSchema = z.object({
  email: z.string().email("INVALID_EMAIL").optional(),
  fields: z
    .array(
      z.object({
        fieldId: z.string().min(1, "FIELD_ID_REQUIRED"),
        value: z.string().min(1, "FIELD_VALUE_REQUIRED"),
      }),
    )
    .min(1, "FORM_RESPONSE_MUST_HAVE_FIELDS"),
});