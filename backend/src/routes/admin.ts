import express from "express";
import User from "../models/User";
import Scan from "../models/Scan";
import auth from "../middleware/auth";

const router = express.Router();

// Get all users with stats + last scan date
router.get("/users", auth, async (req: any, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Fetch all users
    const users = await User.find().select(
      "name email phone organization filesScanned threatsDetected remainingScans"
    );

    // Fetch last scan dates
    const lastScans = await Scan.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          lastScanAt: { $first: "$createdAt" },
        },
      },
    ]);

    // Map userId → lastScanAt
    const lastScanMap: Record<string, Date> = {};
    lastScans.forEach((s) => {
      lastScanMap[s._id] = s.lastScanAt;
    });

    // Merge lastScanAt into user data
    const enriched = users.map((u: any) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      organization: u.organization,
      filesScanned: u.filesScanned,
      threatsDetected: u.threatsDetected,
      remainingScans: u.remainingScans,
      lastScanAt: lastScanMap[u._id.toString()] || null,
    }));

    console.log("Enriched users being returned:", enriched);

    res.json(enriched);
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get overall stats
router.get("/stats", auth, async (req: any, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const totalUsers = await User.countDocuments();
    const totalScans = await Scan.countDocuments();
    const threatsDetected = await Scan.countDocuments({ status: "malicious" });

    res.json({ totalUsers, totalScans, threatsDetected });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
