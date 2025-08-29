// src/auth/routes.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import jwt from "jsonwebtoken";

import { authLimiter } from "../security/rateLimit.js";
import { verifyTurnstile } from "../security/captcha.js";
import { enforceSignupIpQuota } from "../security/ipGuard.js";
import { hash, verify as verifyHash } from "./hash.js";
import { sendVerifyEmail } from "../mailer/mailer.js";

const prisma = new PrismaClient();
const r = Router();

// apply rate limiting to auth routes
r.use(authLimiter);

/**
 * Registration payload validation using zod
 */
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  organization: z.string().optional(),
  phone: z.string().optional(),
  surveyJson: z.any().optional(),
  captchaToken: z.string().min(1)
});

// POST /api/auth/register
r.post("/register", async (req, res) => {
  try {
     const ip = req.ip ?? "unknown";

    // Enforce IP quota to prevent mass signups
    if (!(await enforceSignupIpQuota(ip))) {
      return res.status(429).json({ error: "Too many signups from this IP. Try later." });
    }

    const parsed = RegisterSchema.parse(req.body);

    // Verify CAPTCHA
    const ok = await verifyTurnstile(parsed.captchaToken, ip);
    if (!ok) return res.status(400).json({ error: "CAPTCHA failed" });

    // Hash password
    const passwordHash = await hash(parsed.password);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash,
        name: parsed.name,
        organization: parsed.organization,
        phone: parsed.phone,
        surveyJson: parsed.surveyJson,
        lastIp: ip
      }
    });

    // Generate a short lived JWT token for email verification
    const token = jwt.sign({ uid: user.id }, process.env.JWT_SECRET!, { expiresIn: "2d" });
    await sendVerifyEmail(user.email, token);

    res.json({ message: "Registered. Check your email to verify." });
  } catch (e: any) {
    // Prisma unique constraint error code P2002 for duplicate email
    if (e?.code === "P2002") return res.status(400).json({ error: "Email already registered" });
    res.status(400).json({ error: "Invalid request" });
  }
});

// POST /api/auth/login
r.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  // Compare password
  const match = await verifyHash(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  // Require verified email
  if (!user.emailVerified) return res.status(403).json({ error: "Please verify your email" });

  // Store user id in session (HTTP-only cookie)
  req.session.userId = user.id;
  res.json({ ok: true, uploadsUsed: user.uploadsUsed, limit: 5 });
});

// GET /api/auth/verify?token=...
r.get("/verify", async (req, res) => {
  try {
    const token = String(req.query.token || "");
    const { uid } = jwt.verify(token, process.env.JWT_SECRET!) as { uid: number };
    await prisma.user.update({ where: { id: uid }, data: { emailVerified: true } });
    res.json({ message: "Email verified. You can log in now." });
  } catch {
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

// POST /api/auth/logout
r.post("/logout", (req, res) => {
  // Destroy the session server-side; cookie becomes invalid in browser
  req.session.destroy(() => res.json({ ok: true }));
});

export default r;
