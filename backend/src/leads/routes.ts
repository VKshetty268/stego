// src/leads/routes.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const r = Router();

// GET /api/leads/export.csv
// Guarded by a simple header 'x-admin-key' which must match ADMIN_KEY env var.
// For production, replace with proper admin auth.
r.get("/export.csv", async (req, res) => {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(401).send("Unauthorized");
  }

  const users = await prisma.user.findMany({
    select: {
      createdAt: true,
      email: true,
      name: true,
      organization: true,
      phone: true,
      surveyJson: true,
      uploadsUsed: true
    }
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
  res.write("createdAt,email,name,organization,phone,uploadsUsed,surveyJson\n");

  for (const u of users) {
    const line = [
      u.createdAt.toISOString(),
      u.email,
      u.name,
      u.organization ?? "",
      u.phone ?? "",
      String(u.uploadsUsed),
      JSON.stringify(u.surveyJson ?? {})
    ]
      .map((s) => `"${String(s).replace(/"/g, '""')}"`)
      .join(",");
    res.write(line + "\n");
  }
  res.end();
});

export default r;
