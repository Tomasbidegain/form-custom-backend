import bcrypt from 'bcrypt'
import crypto from 'crypto'
import prisma from '../config/database'
import type { RegisterDTO, RegisterResponse, VerifyEmailResponse, AuthResponse } from '../types/auth.types'
import { generateToken } from '../utils/jwt'
import { sendVerificationEmail } from '../utils/emails/confirmAccount'

export class AuthService {
  async register(data: RegisterDTO): Promise<RegisterResponse> {
    const userExists = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (userExists) {
      throw new Error('EMAIL_ALREADY_REGISTERED')
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
      throw new Error('TOKEN_INVALID')
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) {
      throw new Error('TOKEN_EXPIRED')
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
      throw new Error('INVALID_CREDENTIALS')
    }

    if (!user.isVerified) {
      throw new Error('EMAIL_NOT_VERIFIED')
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash!)

    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS')
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
}