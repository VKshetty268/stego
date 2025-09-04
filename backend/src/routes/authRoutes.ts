// backend/routes/auth.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    console.log("test")
    const { email, password, name, phone, organization } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with extra fields
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    // name: name || null,
    // phone: phone || null,
    // organization: organization || null,
  },
});


    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
