import rateLimit from "express-rate-limit";

export const responseRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 requests por IP por ventana
  message: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests, please try again later",
  },
  standardHeaders: true, // Headers X-RateLimit-*
  legacyHeaders: false,
});
