import bcrypt from 'bcrypt'
import crypto from 'crypto'
import prisma from '../config/database'
import type { RegisterDTO, RegisterResponse, VerifyEmailResponse, AuthResponse, ForgotPasswordDTO, ForgotPasswordResponse, ResetPasswordDTO, ResetPasswordResponse } from '../types/auth.types'
import { generateToken } from '../utils/jwt'
import { sendVerificationEmail } from '../utils/emails/confirmAccount'
import { sendResetPasswordEmail } from '../utils/emails/resetPassword'
import { ERRORS } from '../utils/errors'

export class AuthService {
  async register(data: RegisterDTO): Promise<RegisterResponse> {
    const userExists = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (userExists) {
      throw new Error(ERRORS.EMAIL_ALREADY_REGISTERED.code)
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    const verificationToken = crypto.randomUUID()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        lastName: data.lastName,
        passwordHash,
        verificationToken,
        verificationExpires,
      },
    })

    await sendVerificationEmail({ email: user.email, name: user.name, lastName: user.lastName, token: verificationToken })

    return {
      message: 'USER_REGISTERED_SUCCESSFULLY_CONFIRM_EMAIL',
      userId: user.id,
    }
  }

  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    })

    if (!user) {
      throw new Error(ERRORS.TOKEN_INVALID.code)
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) {
      throw new Error(ERRORS.TOKEN_EXPIRED.code)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    })

    return { message: 'EMAIL_VERIFIED_SUCCESSFULLY' }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new Error(ERRORS.INVALID_CREDENTIALS.code)
    }

    if (!user.isVerified) {
      throw new Error(ERRORS.EMAIL_NOT_VERIFIED.code)
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash!)

    if (!isPasswordValid) {
      throw new Error(ERRORS.INVALID_CREDENTIALS.code)
    }

    const token = generateToken(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
      },
      token,
    }
  }

  async forgotPassword({ email } : ForgotPasswordDTO): Promise<ForgotPasswordResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { message: 'RESET_PASSWORD_EMAIL_SENT' }
    }

    const resetPasswordToken = crypto.randomUUID()
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken,
        resetPasswordExpires,
      },
    })

    await sendResetPasswordEmail({ email: user.email, name: user.name, lastName: user.lastName, token: resetPasswordToken })

    return { message: 'RESET_PASSWORD_EMAIL_SENT' }
  }

  async resetPassword({ token, password }: ResetPasswordDTO): Promise<ResetPasswordResponse> {
    const user = await prisma.user.findUnique({
      where: { resetPasswordToken: token },
    })
    
    if (!user) {
      throw new Error(ERRORS.TOKEN_INVALID.code)
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new Error(ERRORS.TOKEN_EXPIRED.code)
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    })

    return { message: 'PASSWORD_RESET_SUCCESSFULLY' }
  }
}