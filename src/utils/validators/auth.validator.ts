import { z } from 'zod'
import type { RegisterDTO, LoginDTO, ForgotPasswordDTO, ResetPasswordDTO } from '../../types/auth.types'

export const registerSchema = z.object({
  email: z.string().email('INVALID_EMAIL'),
  name: z.string().min(2, 'NAME_TOO_SHORT'),
  lastName: z.string().min(2, 'LAST_NAME_TOO_SHORT'),
  password: z.string()
    .min(8, 'PASSWORD_TOO_SHORT')
    .regex(/[A-Z]/, 'PASSWORD_NO_UPPERCASE')
    .regex(/[a-z]/, 'PASSWORD_NO_LOWERCASE')
    .regex(/\d/, 'PASSWORD_NO_NUMBER'),
}) satisfies z.ZodType<RegisterDTO>

export const loginSchema = z.object({
  email: z.string().email('INVALID_EMAIL'),
  password: z.string().min(1, 'PASSWORD_REQUIRED'),
}) satisfies z.ZodType<LoginDTO>

export const forgotPasswordSchema = z.object({
  email: z.string().email('INVALID_EMAIL')
}) satisfies z.ZodType<ForgotPasswordDTO>

export const resetPasswordSchema = z.object({
  token: z.string().uuid('INVALID_TOKEN_FORMAT'),
  password: z.string()
    .min(8, 'PASSWORD_TOO_SHORT')
    .regex(/[A-Z]/, 'PASSWORD_NO_UPPERCASE')
    .regex(/[a-z]/, 'PASSWORD_NO_LOWERCASE')
    .regex(/\d/, 'PASSWORD_NO_NUMBER')
}) satisfies z.ZodType<ResetPasswordDTO>