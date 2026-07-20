import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { ERRORS } from '../utils/errors'

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(ERRORS.TOKEN_MISSING)
    }

    const token = authHeader.split(' ')[1]

    const decoded = verifyToken(token)

    req.userId = decoded.userId

    next()
  } catch (error) {
    return res.status(401).json(ERRORS.TOKEN_INVALID)
  }
}