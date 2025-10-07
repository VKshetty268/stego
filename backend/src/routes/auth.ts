import express from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import auth from "../middleware/auth";
import path from "path";
import dotenv from "dotenv";
dotenv.config();


// dotenv.config({ path: path.resolve(__dirname, "../.env") });

const router = express.Router();

// 📌 Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, organization, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();

    const user = new User({
      name,
      email,
      phone,
      organization,
      password: hashed,
      isVerified: false,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    
    console.log("TESTING EMAIL FUNCTIONALITY", process.env.EMAIL_USER )
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your StegoEnterprise Test-Drive OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Welcome to StegoEnterprise Test-Drive</h2>
          <p>Thank you for signing up for the <strong>StegoEnterprise Test-Drive platform</strong>.</p>
          <p>Your new One-Time Password (OTP) is:</p>
          <h1 style="color: #2d6cdf; letter-spacing: 3px;">${otp}</h1>
          <p>Please enter this code in the app to verify your email address. This code will expire in 10 minutes.</p>

          <hr style="margin:20px 0;"/>

          <p>
            With this free test-drive, you can scan your images, videos, and documents 
            to detect hidden or malicious content. To continue beyond your test-drive or 
            to secure your organization, please contact our sales team for the full 
            version of StegoEnterprise.
          </p>

          <p>
            <strong>Contact Sales:</strong><br/>
            Phone: (973) 818-9705<br/>
            Email: sales@wetstonelabs.com
          </p>

          <p style="font-size: 12px; color: #777;">
            If you did not request this code, please ignore this email.
          </p>
        </div>
      `,
    });


//Uncomment the below Part to Enable email sending through Microsoft/Outlook accounts
//     console.log("TESTING EMAIL FUNCTIONALITY", process.env.SMTP_USER )

//     const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "smtp.office365.com",
//   port: parseInt(process.env.SMTP_PORT || "587", 10),
//   secure: (process.env.SMTP_SECURE || "false") === "true", // false for 587 (STARTTLS)
//   auth: {
//     user: process.env.SMTP_USER!,
//     pass: process.env.SMTP_PASS!,
//   },
//   // Optional but recommended for strict TLS:
//   requireTLS: true,
//   tls: { minVersion: "TLSv1.2" },
// });

// // (Optional) quick connectivity check on boot or just before send:
// await transporter.verify().catch((e) => {
//   console.error("SMTP verify failed:", e?.message || e);
// });

// await transporter.sendMail({
//   from: process.env.SMTP_FROM || process.env.SMTP_USER,
//   to: email,
//   subject: "Verify your Stego account",
//   text: `Welcome to Stego! Your OTP is ${otp}. It will expire in 10 minutes.`,
// });

    res.json({ message: "User registered. Please verify OTP." });
    await user.save();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Verify OTP
// 📌 Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.isVerified) {
      // If already verified, just mint a token for a seamless experience
      const token = jwt.sign(
        { userId: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
      );
      return res.json({
        message: "Already verified",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          needsProfileCompletion: user.needsProfileCompletion,
        },
      });
    }

    if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    // ⬇️ Return the same shape as /auth/login for consistency
    res.json({
      message: "Email verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        needsProfileCompletion: user.needsProfileCompletion,
      },
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        needsProfileCompletion: user.needsProfileCompletion,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Current user info
router.get("/me", auth, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Google login
router.post("/google", async (req, res) => {
  try {
    const { email, name, picture } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        isVerified: true,
        needsProfileCompletion: true, // ✅ mark for onboarding
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        picture,
        phone: user.phone,
        organization: user.organization,
        needsProfileCompletion: user.needsProfileCompletion,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Google onboarding (first-time only)
router.post("/google-onboarding", auth, async (req: any, res) => {
  try {
    const { organization, phone } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.organization = organization;
    user.phone = phone;
    user.needsProfileCompletion = false; // ✅ mark onboarding complete
    await user.save();

    res.json({ message: "Profile updated" });
  } catch (err) {
    console.error("Google onboarding error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.isVerified) return res.status(400).json({ error: "User already verified" });

    // generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    // 📧 trial-context email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your StegoEnterprise Test-Drive OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Welcome to StegoEnterprise Test-Drive</h2>
          <p>Thank you for signing up for the <strong>StegoEnterprise Test-Drive platform</strong>.</p>
          <p>Your new One-Time Password (OTP) is:</p>
          <h1 style="color: #2d6cdf; letter-spacing: 3px;">${otp}</h1>
          <p>Please enter this code in the app to verify your email address. This code will expire in 10 minutes.</p>

          <hr style="margin:20px 0;"/>

          <p>
            With this free test-drive, you can scan your images, videos, and documents 
            to detect hidden or malicious content. To continue beyond your test-drive or 
            to secure your organization, please contact our sales team for the full 
            version of StegoEnterprise.
          </p>

          <p>
            <strong>Contact Sales:</strong><br/>
            Phone: (973) 818-9705<br/>
            Email: sales@wetstonelabs.com
          </p>

          <p style="font-size: 12px; color: #777;">
            If you did not request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    res.json({ message: "A new OTP has been sent to your email" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// helper: make a Gmail transporter using your existing env
function makeTransporter() {
  // You already use Gmail elsewhere; reuse that for consistency
  return nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// helper: create a secure token (store hashed in DB, return raw for email link)
function createPasswordResetToken() {
  const raw = crypto.randomBytes(32).toString("hex"); // what goes in URL
  const hashed = crypto.createHash("sha256").update(raw).digest("hex"); // what we store
  const expires = Date.now() + 60 * 60 * 1000; // 1 hour
  return { raw, hashed, expires };
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Always returns 200 with a generic message (avoid account enumeration)
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (user) {
      const { raw, hashed, expires } = createPasswordResetToken();
      user.resetPasswordToken = hashed;
      user.resetPasswordExpires = new Date(expires);
      await user.save();

      const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
      const resetUrl = `${frontendBase}/reset-password/${raw}`;

      const transporter = makeTransporter();
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset your StegoEnterprise password",
        html: `
          <div style="font-family:Arial,sans-serif;color:#333;line-height:1.5">
            <h2>Reset your password</h2>
            <p>We received a request to reset your StegoEnterprise password.</p>
            <p>
              Click the button below to choose a new password. This link will
              expire in <strong>1 hour</strong>.
            </p>
            <p style="margin:24px 0">
              <a href="${resetUrl}"
                 style="background:#16a34a;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block">
                Reset Password
              </a>
            </p>
            <p>If you didn’t request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    }

    // Return success even if user isn't found (prevents email enumeration)
    return res.json({ message: "If an account exists for this email, a reset link has been sent." });
  } catch (err) {
    console.error("forgot-password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/auth/reset-password/:token
 * Body: { password }
 */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params as { token: string };
    const { password } = req.body as { password?: string };

    if (!token) return res.status(400).json({ error: "Token is required" });
    if (!password) return res.status(400).json({ error: "Password is required" });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() }, // not expired
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    // update password
    const hashedPw = await bcrypt.hash(password, 10);
    user.password = hashedPw;
    // clear reset fields
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    // optional: mark verified if they reset via email they control
    if (!user.isVerified) user.isVerified = true;

    await user.save();

    return res.json({ message: "Password has been reset successfully. You can now log in." });
  } catch (err) {
    console.error("reset-password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
