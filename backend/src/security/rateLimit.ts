// src/security/rateLimit.ts
import rateLimit from "express-rate-limit";

// Basic rate limits suitable for dev/prototype. Tune for production.
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50
});

export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30
});
