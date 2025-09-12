import express from "express";
import User from "../models/User";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to check admin
function adminAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      id: string;
      isAdmin: boolean;
    };

    if (!decoded.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// --- Admin stats ---
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalScans = await User.aggregate([{ $group: { _id: null, total: { $sum: "$filesScanned" } } }]);
    const totalThreats = await User.aggregate([{ $group: { _id: null, total: { $sum: "$threatsDetected" } } }]);

    res.json({
      totalUsers,
      totalScans: totalScans[0]?.total || 0,
      threatsDetected: totalThreats[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// --- User list for spreadsheet ---
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("name email organization filesScanned threatsDetected remainingScans createdAt");
    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
