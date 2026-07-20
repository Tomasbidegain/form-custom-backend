export interface AppError {
  code: string
  message: string
}

export const ERRORS = {
  // Common
  INTERNAL_SERVER_ERROR: {
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Authentication required",
  },
  INVALID_DATA: {
    code: "INVALID_DATA",
    message: "The request data is invalid",
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    message: "You do not have permission to perform this action",
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    message: "The requested resource was not found",
  },

  // Auth - Validation
  INVALID_EMAIL: {
    code: "INVALID_EMAIL",
    message: "The email address is not valid",
  },
  NAME_TOO_SHORT: {
    code: "NAME_TOO_SHORT",
    message: "Name must be at least 2 characters",
  },
  LAST_NAME_TOO_SHORT: {
    code: "LAST_NAME_TOO_SHORT",
    message: "Last name must be at least 2 characters",
  },
  PASSWORD_TOO_SHORT: {
    code: "PASSWORD_TOO_SHORT",
    message: "Password must be at least 8 characters",
  },
  PASSWORD_NO_UPPERCASE: {
    code: "PASSWORD_NO_UPPERCASE",
    message: "Password must contain at least one uppercase letter",
  },
  PASSWORD_NO_LOWERCASE: {
    code: "PASSWORD_NO_LOWERCASE",
    message: "Password must contain at least one lowercase letter",
  },
  PASSWORD_NO_NUMBER: {
    code: "PASSWORD_NO_NUMBER",
    message: "Password must contain at least one number",
  },
  PASSWORD_REQUIRED: {
    code: "PASSWORD_REQUIRED",
    message: "Password is required",
  },
  INVALID_TOKEN_FORMAT: {
    code: "INVALID_TOKEN_FORMAT",
    message: "The token format is invalid",
  },

  // Auth - Business
  EMAIL_ALREADY_REGISTERED: {
    code: "EMAIL_ALREADY_REGISTERED",
    message: "This email is already registered",
  },
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    message: "Invalid email or password",
  },
  EMAIL_NOT_VERIFIED: {
    code: "EMAIL_NOT_VERIFIED",
    message: "Please verify your email before logging in",
  },
  TOKEN_MISSING: {
    code: "TOKEN_MISSING",
    message: "Authorization token is required",
  },
  TOKEN_INVALID: {
    code: "TOKEN_INVALID",
    message: "The token is invalid",
  },
  TOKEN_EXPIRED: {
    code: "TOKEN_EXPIRED",
    message: "The token has expired",
  },
  TOKEN_REQUIRED: {
    code: "TOKEN_REQUIRED",
    message: "Token is required",
  },
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "User not found",
  },

  // Auth - Success messages (used as response codes)
  USER_REGISTERED_SUCCESSFULLY: {
    code: "USER_REGISTERED_SUCCESSFULLY",
    message: "User registered successfully. Please check your email to verify your account",
  },
  EMAIL_VERIFIED_SUCCESSFULLY: {
    code: "EMAIL_VERIFIED_SUCCESSFULLY",
    message: "Email verified successfully",
  },
  RESET_PASSWORD_EMAIL_SENT: {
    code: "RESET_PASSWORD_EMAIL_SENT",
    message: "If the email exists, a password reset link has been sent",
  },
  PASSWORD_RESET_SUCCESSFULLY: {
    code: "PASSWORD_RESET_SUCCESSFULLY",
    message: "Password reset successfully",
  },

  // Form - Validation
  TITLE_REQUIRED: {
    code: "TITLE_REQUIRED",
    message: "Title is required",
  },
  FIELD_LABEL_REQUIRED: {
    code: "FIELD_LABEL_REQUIRED",
    message: "Field label is required",
  },
  INVALID_FIELD_TYPE: {
    code: "INVALID_FIELD_TYPE",
    message: "Invalid field type",
  },
  GRID_OVERFLOW: {
    code: "GRID_OVERFLOW",
    message: "Field exceeds grid boundaries (gridX + gridW must be <= 12)",
  },
  FORM_MUST_HAVE_FIELDS: {
    code: "FORM_MUST_HAVE_FIELDS",
    message: "Form must have at least one field",
  },
  INVALID_EXPIRES_AT: {
    code: "INVALID_EXPIRES_AT",
    message: "Invalid expiration date format",
  },
  INVALID_MAX_RESPONSES: {
    code: "INVALID_MAX_RESPONSES",
    message: "Max responses must be a positive number",
  },

  // Form - Business
  FORM_NOT_FOUND: {
    code: "FORM_NOT_FOUND",
    message: "Form not found",
  },
  FIELD_NOT_FOUND: {
    code: "FIELD_NOT_FOUND",
    message: "Field not found",
  },
  NO_DATA_TO_UPDATE: {
    code: "NO_DATA_TO_UPDATE",
    message: "No data provided to update",
  },
  FORM_EXPIRED: {
    code: "FORM_EXPIRED",
    message: "Cannot publish form: expiration date has passed",
  },
  FORM_ALREADY_PUBLISHED: {
    code: "FORM_ALREADY_PUBLISHED",
    message: "Form is already published",
  },
  FORM_NOT_PUBLISHED: {
    code: "FORM_NOT_PUBLISHED",
    message: "Form is not published",
  },
  FORM_MAX_RESPONSES_REACHED: {
    code: "FORM_MAX_RESPONSES_REACHED",
    message: "This form has reached the maximum number of responses",
  },
  EMAIL_ALREADY_RESPONDED: {
    code: "EMAIL_ALREADY_RESPONDED",
    message: "This email has already submitted a response to this form",
  },
  REQUIRED_FIELD_MISSING: {
    code: "REQUIRED_FIELD_MISSING",
    message: "One or more required fields are missing",
  },
  INVALID_FIELD_ID: {
    code: "INVALID_FIELD_ID",
    message: "One or more field IDs do not belong to this form",
  },
  RESPONSE_NOT_FOUND: {
    code: "RESPONSE_NOT_FOUND",
    message: "Response not found",
  },

  // Field Value Validation
  INVALID_FIELD_VALUE: {
    code: "INVALID_FIELD_VALUE",
    message: "One or more field values are invalid",
  },
  FIELD_VALUE_REQUIRED: {
    code: "FIELD_VALUE_REQUIRED",
    message: "This field is required",
  },
  INVALID_NUMBER: {
    code: "INVALID_NUMBER",
    message: "The value must be a valid number",
  },
  INVALID_EMAIL_FORMAT: {
    code: "INVALID_EMAIL_FORMAT",
    message: "The value must be a valid email address",
  },
  INVALID_DATE: {
    code: "INVALID_DATE",
    message: "The value must be a valid date (YYYY-MM-DD)",
  },
  INVALID_TIME: {
    code: "INVALID_TIME",
    message: "The value must be a valid time (HH:MM)",
  },
  INVALID_DATETIME: {
    code: "INVALID_DATETIME",
    message: "The value must be a valid datetime",
  },
  INVALID_OPTION: {
    code: "INVALID_OPTION",
    message: "The value is not a valid option",
  },
  INVALID_CHECKBOX: {
    code: "INVALID_CHECKBOX",
    message: "The value must be 'true' or 'false'",
  },
  INVALID_MULTISELECT: {
    code: "INVALID_MULTISELECT",
    message: "The value must be a valid JSON array",
  },
  INVALID_FILE_URL: {
    code: "INVALID_FILE_URL",
    message: "The value must be a valid file URL",
  },

  // Captcha
  CAPTCHA_REQUIRED: {
    code: "CAPTCHA_REQUIRED",
    message: "Captcha verification is required",
  },
  CAPTCHA_INVALID: {
    code: "CAPTCHA_INVALID",
    message: "Captcha verification failed",
  },

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests, please try again later",
  },
} as const

export type ErrorCode = keyof typeof ERRORS

export function getError(code: ErrorCode): AppError {
  return ERRORS[code]
}
