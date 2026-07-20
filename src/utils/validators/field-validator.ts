import { z } from "zod";
import { TypeField } from "../../generated/prisma/enums";
import { ERRORS } from "../errors";

export interface FieldValidationResult {
  isValid: boolean;
  error?: { code: string; message: string };
}

// Zod schemas reutilizables
const emailSchema = z.string().email();
const urlSchema = z.string().url();
const numberSchema = z.string().regex(/^-?\d+(\.\d+)?$/);
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  });
const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/)
  .refine((val) => {
    const [hours, minutes] = val.split(":").map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  });
const datetimeSchema = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime());
});
const checkboxSchema = z.enum(["true", "false"]);

export function validateFieldValue(
  type: TypeField,
  value: string,
  options: string[],
  required: boolean,
): FieldValidationResult {
  // Validar required primero
  const isEmpty = !value || value.trim() === "";

  if (required && isEmpty) {
    return { isValid: false, error: ERRORS.FIELD_VALUE_REQUIRED };
  }

  // Si no es required y está vacío, es válido
  if (isEmpty) {
    return { isValid: true };
  }

  // Validar según el tipo
  switch (type) {
    case "NUMBER": {
      const result = numberSchema.safeParse(value);
      if (!result.success) {
        return { isValid: false, error: ERRORS.INVALID_NUMBER };
      }
      break;
    }

    case "EMAIL": {
      const result = emailSchema.safeParse(value);
      if (!result.success) {
        return { isValid: false, error: ERRORS.INVALID_EMAIL_FORMAT };
      }
      break;
    }

    case "DATE": {
      const result = dateSchema.safeParse(value);
      if (!result.success) {
        return { isValid: false, error: ERRORS.INVALID_DATE };
      }
      break;
    }

    case "TIME": {
      const result = timeSchema.safeParse(value);
      if (!result.success) {
        return { isValid: false, error: ERRORS.INVALID_TIME };
      }
      break;
    }

    case "DATETIME": {
      const result = datetimeSchema.safeParse(value);
      if (!result.success) {
        return { isValid: false, error: ERRORS.INVALID_DATETIME };
      }
      break;
    }

    case "SELECT":
    case "RADIO": {
      if (options.length > 0 && !options.includes(value)) {
        return { isValid: false, error: ERRORS.INVALID_OPTION };
      }
      break;
    }

    case "CHECKBOX": {
      const result = checkboxSchema.safeParse(value);
      if (!result.success) {
        return { isValid: false, error: ERRORS.INVALID_CHECKBOX };
      }
      break;
    }

    case "MULTISELECT": {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          return { isValid: false, error: ERRORS.INVALID_MULTISELECT };
        }
        if (options.length > 0) {
          const allValid = parsed.every((item: string) =>
            options.includes(item),
          );
          if (!allValid) {
            return { isValid: false, error: ERRORS.INVALID_OPTION };
          }
        }
      } catch {
        return { isValid: false, error: ERRORS.INVALID_MULTISELECT };
      }
      break;
    }

    case "FILE": {
      const result = urlSchema.safeParse(value);
      if (!result.success) {
        return { isValid: false, error: ERRORS.INVALID_FILE_URL };
      }
      break;
    }

    case "TEXT":
    default:
      // TEXT no tiene validación específica
      break;
  }

  return { isValid: true };
}
