import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayloadShape { userId: string }

export default function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const hdr = req.headers.authorization;
    const token =
      (hdr && hdr.startsWith("Bearer ") && hdr.split(" ")[1]) ||
      (req.cookies && (req.cookies.token as string));

    if (!token) return res.status(401).json({ error: "Auth token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayloadShape;
    (req as any).user = { userId: decoded.userId };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
