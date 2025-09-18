import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import auth from "../middleware/auth";
import Scan from "../models/Scan";
import User from "../models/User";
import dotenv from "dotenv";

import { stegoScanSync, stegoScanAsync, stegoGetReport } from "../services/stegoClient";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const router = Router();

console.log("FREE SCAN LIMIT", process.env.FREE_SCAN_LIMIT );
// 🔑 Configurable free scan limit
const FREE_SCAN_LIMIT = parseInt(process.env.FREE_SCAN_LIMIT || "50", 10);

// --- uploads dir
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// --- allowed file types (exclude DICOM explicitly)
const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".bmp"]);

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

  const newResults: any[] = []; // 🔑 collect only this batch

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Enforce free scan limit before proceeding
    if (user.remainingScans <= 0) {
      return res.status(403).json({
        error: `You have used up all your free scans (limit: ${FREE_SCAN_LIMIT}).`,
      });
    }

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

        await new Scan({
          userId,
          filename: f.originalname,
          status,
          rawReport: report,
        }).save();

        // update user stats
        user.filesScanned += 1;
        if (status === "malicious") user.threatsDetected += 1;
        if (user.remainingScans > 0) user.remainingScans -= 1;

        const resultObj = {
          filename: f.originalname,
          status,
          severity: report?.files?.[0]?.severity || "Unknown",
          scanTime: report?.files?.[0]?.scan_elapsed_time || null,
          details: report?.files?.[0] || {},
        };

        // session keeps history
        (req as any).session.scanResults.unshift(resultObj);

        // batch results returned
        newResults.unshift(resultObj);
      } catch (e: any) {
        const errObj = {
          filename: f.originalname,
          status: "malicious",
          severity: "Error",
          scanTime: null,
          details: [
            {
              finding: e?.message || "Scan failed",
              severity: "High",
              type: "error",
            },
          ],
        };
        (req as any).session.scanResults.unshift(errObj);
        newResults.unshift(errObj);
      } finally {
        fs.promises.unlink(f.path).catch(() => {});
      }
    }

    await user.save();

    // 🔑 return only the new batch
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
