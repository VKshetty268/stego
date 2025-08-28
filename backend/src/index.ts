import express from "express";
import session from "express-session";
import SQLiteStore from "connect-sqlite3";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import csrf from "csurf";

// import authRoutes from "./auth/routes";
// import uploadRoutes from "./upload/routes";
// import leadsRoutes from "./leads/routes";

const app = express();
const SQLiteStoreFactory = SQLiteStore(session);

app.use(helmet());
app.use(morgan("dev"));
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" })); // not used for file streams

app.use(session({
  store: new (SQLiteStoreFactory as any)({ db: "sessions.sqlite", dir: "./" }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 1000*60*60*24*7 }
}));

// CSRF for non-multipart routes (we’ll exempt /upload which uses streaming)
app.use(csrf({ cookie: false, ignoreMethods: ["GET", "HEAD", "OPTIONS"] }));

// app.use("/api/auth", authRoutes);
// app.use("/api/upload", uploadRoutes);
// app.use("/api/leads", leadsRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log(`API listening on ${process.env.PORT || 4000}`);
});
