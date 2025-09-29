// backend/src/routes/files.ts
import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import auth from "../middleware/auth";
import Scan from "../models/Scan";
import User from "../models/User";
import { stegoScanSync, stegoScanAsync, stegoGetReport } from "../services/stegoClient";

const router = Router();

// --- uploads dir
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const ALLOWED = new Set([
  // Images
  ".jpg", ".jpeg", ".j2k", ".jp2", ".bmp", ".gif", ".png", ".tif", ".tiff", ".pcx", ".ico",
  // Audio
  ".wav", ".mp3", ".m4a", ".ogg",
  // Video
  ".3gp", ".m4v", ".mov", ".mp4", ".avi", ".flv", ".mpg", ".mpeg", ".asf", ".webm",
  // Documents
  ".ole", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".pdf", ".txt",
  // Executables / binaries
  ".exe", ".elf", ".swf", ".nes",
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
    else cb(new Error(`Unsupported file type: ${ext}. Only .dcm files are allowed.`));
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // bump limit if DICOM files are large
});

// --- normalize Stego report into safe/malicious
function interpretReport(report: any): boolean {
  try {
    const files = report?.files || [];
    if (!files.length) return false;

    const f = files[0];
    if (f.detected === true) return true;
    if (Array.isArray(f.detections) && f.detections.length > 0) return true;
    if (f.severity && f.severity.toLowerCase() !== "clean") return true;

    return false;
  } catch {
    return true;
  }
}

// --- POST /api/files/upload
router.post("/upload", auth, upload.array("files"), async (req, res) => {
  const mode = (process.env.STEGO_MODE || "sync").toLowerCase();
  const userId = req.user!.userId;
  const files = (req.files as Express.Multer.File[]) || [];

  if (!files.length) return res.status(400).json({ error: "No files uploaded" });
  

  if (!(req as any).session.scanResults) {
    (req as any).session.scanResults = [];
  }

  const newResults: any[] = [];

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    for (const f of files) {
      try {
        let report: any = null;
        if (mode === "async") {
          const { job_id } = await stegoScanAsync(f.path, f.originalname);
          for (let i = 0; i < 15; i++) {
            const r = await stegoGetReport(job_id, true);
            if (r?.status === "In Progress") {
              await new Promise((r) => setTimeout(r, 2000));
              continue;
            }
            report = r;
            break;
          }
        } else {
          report = await stegoScanSync(f.path, f.originalname);
        }

        const detected = interpretReport(report);
        const status: "safe" | "malicious" = detected ? "malicious" : "safe";

        await new Scan({ userId, filename: f.originalname, status, rawReport: report }).save();

        // update user stats
        user.filesScanned += 1;
        if (status === "malicious") user.threatsDetected += 1;
        if (user.remainingScans > 0) user.remainingScans -= 1;

        const resultObj = {
          filename: f.originalname,
          status,
          severity: report?.files?.[0]?.severity || "Unknown",
          scanTime: report?.files?.[0]?.malware_scan_elapsed_time || null, // 🔑 switched to malware_scan_elapsed_time if needed
          details: report?.files?.[0] || {},
        };

        (req as any).session.scanResults.unshift(resultObj);
        newResults.unshift(resultObj);
      } catch (e: any) {
        const errObj = {
          filename: f.originalname,
          status: "malicious",
          severity: "Error",
          scanTime: null,
          details: [{ finding: e?.message || "Scan failed", severity: "High", type: "error" }],
        };
        (req as any).session.scanResults.unshift(errObj);
        newResults.unshift(errObj);
      } finally {
        fs.promises.unlink(f.path).catch(() => {});
      }
    }

    await user.save();
    return res.json({ results: newResults });
  } catch (err) {
    console.error("Upload handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- GET /api/files/stats
router.get("/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user!.userId).select(
      "filesScanned threatsDetected remainingScans"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      allScans: user.filesScanned,
      threatsBlocked: user.threatsDetected,
      remainingScans: user.remainingScans,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
