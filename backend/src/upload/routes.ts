import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { uploadLimiter } from "../security/rateLimit";
import busboy from "busboy";
import { scanWithStego } from "./stego";

const prisma = new PrismaClient();
const r = Router();
r.use(uploadLimiter);

// simple auth gate
function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });
  next();
}

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED = new Set(["image/jpeg","image/png","image/gif","video/mp4","video/x-msvideo"]);

r.get("/status", requireAuth, async (req: any, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.session.userId }});
  res.json({ uploadsUsed: u?.uploadsUsed ?? 0, limit: 5 });
});

r.post("/", requireAuth, (req: any, res) => {
  // Exempt from JSON parser; handle raw multipart with Busboy
  const bb = busboy({ headers: req.headers, limits: { files: 1, fileSize: MAX_SIZE } });
  let filename = ""; let mimetype = ""; let size = 0;

  let closed = false;
  const done = (status: number, body: any) => { if (!closed) { closed = true; res.status(status).json(body); } };

  bb.on("file", async (_name, file, info) => {
    filename = info.filename; mimetype = info.mimeType;
    if (!ALLOWED.has(mimetype)) { file.resume(); return done(400, { error: "Unsupported type" }); }

    const user = await prisma.user.findUnique({ where: { id: req.session.userId }});
    if (!user) return done(401, { error: "Unauthorized" });
    if (user.uploadsUsed >= 5) return done(403, { error: "Limit reached" });

    // Count bytes for limit enforcement
    file.on("data", (chunk) => { size += chunk.length; if (size > MAX_SIZE) file.destroy(); });
    file.on("limit", () => done(413, { error: "File too large" }));

    try {
      const verdict = await scanWithStego(filename, mimetype, size, file);
      await prisma.$transaction([
        prisma.uploadEvent.create({
          data: {
            userId: user.id, filename, mimetype, sizeBytes: size,
            result: verdict?.verdict ?? "error"
          }
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { uploadsUsed: { increment: 1 } }
        })
      ]);

      const used = user.uploadsUsed + 1;
      const reached = used >= 5;
      done(200, {
        message: "Scan complete",
        verdict: verdict?.verdict ?? "unknown",
        uploadsUsed: used,
        limitReached: reached
      });
    } catch (e) {
      done(500, { error: "Scan failed" });
    }
  });

  bb.on("error", () => done(400, { error: "Malformed upload" }));
  bb.on("close", () => { /* nothing */ });

  req.pipe(bb);
});

export default r;
