import rateLimit from "express-rate-limit";
export const authLimiter = rateLimit({ windowMs: 10*60*1000, max: 50 });    // any auth routes
export const uploadLimiter = rateLimit({ windowMs: 10*60*1000, max: 30 });  // uploads
