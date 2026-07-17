// DTOs de entrada (lo que recibe el backend)
export interface RegisterDTO {
  email: string
  name: string
  lastName: string
  password: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface VerifyEmailDTO {
  token: string
}

export interface ForgotPasswordDTO {
  email: string
}

export interface ResetPasswordDTO {
  token: string
  password: string
}

export interface SendVerificationEmailDTO {
  email: string
  name: string
  lastName: string
  token: string
}

export interface SendResetPasswordEmailDTO {
  email: string
  name: string
  lastName: string
  token: string
}

// DTOs de salida (lo que devuelve el backend)
export interface UserResponse {
  id: string
  email: string
  name: string
  lastName: string
  photoUrl?: string | null
}

export interface AuthResponse {
  user: UserResponse
  token: string
}

export interface RegisterResponse {
  message: string
  userId: string
}

export interface VerifyEmailResponse {
  message: string
}

// Respuestas de error
export interface ErrorResponse {
  error: string
  details?: unknown
}

export interface ForgotPasswordResponse {
  message: string
}
export interface ResetPasswordResponse {
  message: string
}
