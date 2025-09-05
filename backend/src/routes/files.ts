import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import auth from "../middleware/auth";
import Scan from "../models/Scan";
import { stegoScanSync, stegoScanAsync, stegoGetReport } from "../services/stegoClient";

const router = Router();

// --- uploads dir
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// --- allowed file types per Stego WEB APP guide (exclude DICOM explicitly)
const ALLOWED = new Set([
  ".jpg", ".jpeg", ".png", ".bmp"
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED.has(ext)) cb(null, true);
    else cb(new Error(`Unsupported file type: ${ext}`));
  },
  limits: { fileSize: 25 * 1024 * 1024 },
});

// --- normalize Stego report into safe/malicious
function interpretReport(report: any): boolean {
  try {
    const files = report?.files || [];
    if (!files.length) return false;

    const f = files[0];

    // malicious if detected true OR detections array not empty OR severity not Clean
    if (f.detected === true) return true;
    if (Array.isArray(f.detections) && f.detections.length > 0) return true;
    if (f.severity && f.severity.toLowerCase() !== "clean") return true;

    return false;
  } catch {
    return true; // conservative fallback
  }
}

// --- POST /api/files/upload
router.post("/upload", auth, upload.array("files"), async (req, res) => {
  const mode = (process.env.STEGO_MODE || "sync").toLowerCase();
  const userId = req.user!.userId;
  const files = (req.files as Express.Multer.File[]) || [];

  if (!files.length) return res.status(400).json({ error: "No files uploaded" });

  const results: Array<{ filename: string; status: "safe" | "malicious" }> = [];

  try {
    for (const f of files) {
      try {
        let report: any = null;

        if (mode === "async") {
          console.log("Starting async scan for:", f.originalname);
          const { job_id } = await stegoScanAsync(f.path, f.originalname);
          console.log("Job ID:", job_id);

          // simple polling loop
          for (let i = 0; i < 15; i++) {
            const r = await stegoGetReport(job_id, true);
            console.log(`Async report poll #${i + 1} for ${f.originalname}:`, JSON.stringify(r, null, 2));

            if (r?.status === "In Progress") {
              await new Promise((r) => setTimeout(r, 2000));
              continue;
            }
            report = r;
            break;
          }
        } else {
          console.log("🚀 Starting sync scan for:", f.originalname);
          report = await stegoScanSync(f.path, f.originalname);
          console.log("📄 Sync report for", f.originalname, ":", JSON.stringify(report, null, 2));
        }

        const detected = interpretReport(report);
        const status: "safe" | "malicious" = detected ? "malicious" : "safe";

        await new Scan({
          userId,
          filename: f.originalname,
          status,
          rawReport: report,
        }).save();

        results.push({ filename: f.originalname, status });
      } catch (e: any) {
        console.error("Scan failed for:", f.originalname);
        console.error("Error message:", e?.message);
        console.error("Error response:", e?.response?.data);

        await new Scan({
          userId,
          filename: f.originalname,
          status: "malicious",
          rawReport: { error: e?.message, response: e?.response?.data },
        }).save();

        results.push({ filename: f.originalname, status: "malicious" });
      } finally {
        fs.promises.unlink(f.path).catch(() => {});
      }
    }

    return res.json({ results });
  } catch (err) {
    console.error("Upload handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- GET /api/files/stats
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const [scansToday, threatsBlocked] = await Promise.all([
      Scan.countDocuments({ userId, createdAt: { $gte: start } }),
      Scan.countDocuments({
        userId,
        createdAt: { $gte: start },
        status: "malicious",
      }),
    ]);

    res.json({ scansToday, threatsBlocked });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
