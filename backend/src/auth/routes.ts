import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { hash, verify as verifyHash } from "./hash";
import jwt from "jsonwebtoken";
import { verifyTurnstile } from "../security/captcha";
import { authLimiter } from "../security/rateLimit";
import { enforceSignupIpQuota } from "../security/ipGuard";
import { sendVerifyEmail } from "../mailer/mailer";

const prisma = new PrismaClient();
const r = Router();
r.use(authLimiter);

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  organization: z.string().optional(),
  phone: z.string().optional(),
  surveyJson: z.any().optional(),
  captchaToken: z.string().min(1)
});

r.post("/register", async (req, res) => {
  try {
    const ip = req.ip;
    if (!(await enforceSignupIpQuota(ip))) {
      return res.status(429).json({ error: "Too many signups from this IP. Try later." });
    }
    const parsed = RegisterSchema.parse(req.body);

    const ok = await verifyTurnstile(parsed.captchaToken, ip);
    if (!ok) return res.status(400).json({ error: "CAPTCHA failed" });

    const passwordHash = await hash(parsed.password);
    const user = await prisma.user.create({
      data: {
        email: parsed.email, passwordHash, name: parsed.name,
        organization: parsed.organization, phone: parsed.phone,
        surveyJson: parsed.surveyJson, lastIp: ip
      }
    });

    const token = jwt.sign({ uid: user.id }, process.env.JWT_SECRET!, { expiresIn: "2d" });
    await sendVerifyEmail(user.email, token);

    res.json({ message: "Registered. Check your email to verify." });
  } catch (e: any) {
    if (e.code === "P2002") return res.status(400).json({ error: "Email already registered" });
    res.status(400).json({ error: "Invalid request" });
  }
});

r.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  if (!(await verifyHash(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  if (!user.emailVerified) return res.status(403).json({ error: "Please verify your email" });

  req.session.userId = user.id;
  res.json({ ok: true, uploadsUsed: user.uploadsUsed, limit: 5 });
});

r.get("/verify", async (req, res) => {
  try {
    const token = String(req.query.token || "");
    const { uid }: any = jwt.verify(token, process.env.JWT_SECRET!);
    await prisma.user.update({ where: { id: uid }, data: { emailVerified: true }});
    res.json({ message: "Email verified. You can log in now." });
  } catch {
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

r.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

export default r;
