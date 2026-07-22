import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ERRORS } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json(ERRORS.TOKEN_MISSING);
    }

    const decoded = verifyToken(token);

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json(ERRORS.TOKEN_INVALID);
  }
}
