// src/upload/routes.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { uploadLimiter } from "../security/rateLimit.js";
import busboy from "busboy";
import { scanWithStego } from "./stego.js";
import { sendUploadReceipt } from "../mailer/mailer.js";

const prisma = new PrismaClient();
const r = Router();

// Apply rate limiting to uploads
r.use(uploadLimiter);

// Simple session auth guard for routes that require login
function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// Allowed MIME types and limits
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "video/x-msvideo" // avi
]);

// GET /api/upload/status -> returns how many uploads used
r.get("/status", requireAuth, async (req: any, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.session.userId } });
  res.json({ uploadsUsed: u?.uploadsUsed ?? 0, limit: 5 });
});

// POST /api/upload -> single file per request; streaming using busboy
r.post("/", requireAuth, (req: any, res) => {
  // Use busboy to handle multipart streaming (low memory footprint)
  const bb = busboy({ headers: req.headers, limits: { files: 1, fileSize: MAX_SIZE } });

  let filename = "";
  let mimetype = "";
  let size = 0;
  let finished = false;

  // Helper to ensure we respond only once
  const done = (code: number, payload: any) => {
    if (!finished) {
      finished = true;
      res.status(code).json(payload);
    }
  };

  bb.on("file", async (_name, file, info) => {
    filename = info.filename;
    mimetype = info.mimeType;

    if (!ALLOWED.has(mimetype)) {
      // unsupported mime — skip stream and return error
      file.resume();
      return done(400, { error: "Unsupported type" });
    }

    // Fetch user and enforce per-user limit
    const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    if (!user) return done(401, { error: "Unauthorized" });
    if (user.uploadsUsed >= 5) return done(403, { error: "Limit reached" });

    // Track size in-memory for the stream (busboy will emit limit too)
    file.on("data", (chunk) => {
      size += chunk.length;
      // defensive: if exceeded, destroy stream
      if (size > MAX_SIZE) file.destroy(new Error("too_large"));
    });

    file.on("limit", () => done(413, { error: "File too large" }));

    try {
      // Stream to Stego and await verdict
      const verdict = await scanWithStego(filename, mimetype, size, file);

      // Persist only metadata and update user's uploadsUsed counter
      await prisma.$transaction([
        prisma.uploadEvent.create({
          data: {
            userId: user.id,
            filename,
            mimetype,
            sizeBytes: size,
            result: verdict?.verdict ?? "error"
          }
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { uploadsUsed: { increment: 1 } }
        })
      ]);

      // Optionally: send an email receipt for the upload
      try {
        await sendUploadReceipt(user.email, filename, verdict?.verdict ?? "unknown");
      } catch (e) {
        // email failure shouldn't block response, log in production
        console.warn("Failed to send upload receipt", e);
      }

      const used = user.uploadsUsed + 1;
      done(200, {
        message: "Scan complete",
        verdict: verdict?.verdict ?? "unknown",
        uploadsUsed: used,
        limitReached: used >= 5
      });
    } catch (e: any) {
      if (e?.message === "too_large") return done(413, { error: "File too large" });
      // error streaming or Stego API failure
      done(500, { error: "Scan failed" });
    }
  });

  bb.on("error", () => done(400, { error: "Malformed upload" }));

  // Pipe the raw request into busboy for processing
  req.pipe(bb);
});

export default r;
