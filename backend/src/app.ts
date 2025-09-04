// src/app.ts
import express from "express";
import session from "express-session";
import SQLiteStore from "connect-sqlite3";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import csrf from "csurf";

// Route imports (these files are created below)
import authRoutes from "./auth/routes";
import uploadRoutes from "./upload/routes";
import leadsRoutes from "./leads/routes";

const SQLiteStoreFactory = SQLiteStore(session);

/**
 * createApp builds and returns the configured Express application.
 * This separation helps with testing or bootstrapping multiple servers.
 */
export function createApp() {
  const app = express();

  // Security HTTP headers
  app.use(helmet());

  // Logging for requests (dev)
  app.use(morgan("dev"));

  // Enable CORS for frontend origin and allow credentials (cookies)
  app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

  // Parse cookies and JSON payloads for the JSON routes (uploads use streaming)
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));

  // Session configuration (stored in SQLite file)
  app.use(
    session({
      store: new (SQLiteStoreFactory as any)({
        db: "sessions.sqlite",
        dir: "./"
      }),
      secret: process.env.SESSION_SECRET || "supersecret123",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // set to true in production behind HTTPS
        maxAge: 1000 * 60 * 60 * 24 * 7
      }
    })
  );

  // CSRF protection for JSON routes (ignore raw multipart uploads)
  // app.use(
  //   csrf({
  //     cookie: false,
  //     ignoreMethods: ["GET", "HEAD", "OPTIONS"]
  //   })
  // );

  // Mount API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/leads", leadsRoutes);

  // Health-check endpoint
  app.get("/health", (_req, res) => res.json({ ok: true }));

  return app;
}
