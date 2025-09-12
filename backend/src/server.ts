import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";

// routes
import authRoutes from "./routes/auth";
import fileRoutes from "./routes/files";
import adminRoutes from "./routes/admin";

dotenv.config();

const app = express();

// --- Middlewares ---
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // adjust to frontend
    credentials: true,
  })
);

// --- Session middleware (fix for req.session undefined) ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set true if https + proxy
  })
);

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/admin", adminRoutes);

// --- DB + server ---
const PORT = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/stego")
  .then(() => {
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection failed", err));
