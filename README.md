# Stego / SecureDICOM Web Application

Stego is a full-stack web application for detecting **steganography and malicious content hidden in images**.  
It provides a secure environment for users to upload media, receive scan results, and manage their accounts.  

There are **two variants**:  
- **Stego** – for general media files (JPEG, PNG, BMP).  
- **SecureDICOM** – tailored for healthcare, restricted to DICOM files.  

---

## 🚀 Quick Start (TL;DR)

1. **Clone repos**  
   ```bash
   git clone <your-backend-repo> backend
   git clone <your-frontend-repo> frontend
   ```

2. **Create `.env` files**  
   - `backend/.env` → see [Backend Setup](#backend-setup)  
   - `frontend/.env` → see [Frontend Setup](#frontend-setup)

3. **Install dependencies**  
   ```bash
   cd backend && npm i
   cd frontend && npm i
   ```

4. **Run dev servers**  
   ```bash
   # backend (http://localhost:4000)
   npm run dev

   # frontend (http://localhost:5173)
   npm run dev
   ```

5. **Login flows**  
   - Email + Password (with OTP verification)  
   - Google Sign-In → one-time onboarding → dashboard  
   - Admin users are redirected to `/admin`

---

## 🏗 Architecture

**Frontend:** React + Vite + TailwindCSS  
- Routes: `/login`, `/register`, `/verify-email`, `/dashboard`, `/admin`, `/google-onboarding`  

**Backend:** Node.js + Express + MongoDB  
- Auth (email+OTP, Google OAuth)  
- File uploads (multer) → Stego scan service  
- Session memory for scan results  
- User stats + admin APIs  

**External:**  
- Stego Engine API (sync/async scan)  
- SMTP (Gmail/Outlook) for OTP emails  
- Google OAuth 2.0  

**Database:** MongoDB (Atlas)  
- Users, Scans collections

---

## 📂 File Map

### Backend
- `src/models/User.ts` – User schema (OTP, stats, onboarding, admin flag)  
- `src/models/Scan.ts` – Per-scan record (raw JSON report)  
- `src/middleware/auth.ts` – JWT middleware  
- `src/routes/auth.ts` – Register/Login/OTP, Google auth & onboarding  
- `src/routes/files.ts` – File upload, scan, stats, free-scan limit  
- `src/routes/admin.ts` – Admin stats + users list  
- `src/services/stegoClient.ts` – Stego API helpers (token, sync/async scans)  
- `src/server.ts` – Express bootstrap (CORS, sessions, middleware)  

### Frontend
- `src/App.tsx` – App routes  
- `src/api/api.ts` – Axios instance with auth header  
- `src/pages/Login.tsx` – Local + Google login  
- `src/pages/Register.tsx` – Register (OTP)  
- `src/pages/VerifyEmail.tsx` – Verify OTP  
- `src/pages/Dashboard.tsx` – Upload + scan results  
- `src/pages/AdminDashboard.tsx` – Admin stats + export  
- `src/pages/GoogleOnboarding.tsx` – Phone/org form (Google first login)  
- `src/components/ResultsList.tsx` & `ResultItem.tsx` – Results UI  

---

## ⚙️ Backend Setup

```bash
cd backend
npm i
npm run dev
# API at http://localhost:4000
```

### Required `.env` (backend)
```env
PORT=4000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>

# Auth
JWT_SECRET=super-long-random-string

# Email (OTP)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_or_smtp_password

# Stego API
STEGO_BASE_URL=https://<stego-base>
STEGO_AGENT_TOKEN=<provided_token>
STEGO_AGENT_NAME=WEBAPP
STEGO_MODE=sync   # or async

# Business settings
FREE_SCAN_LIMIT=50

# Sessions
SESSION_SECRET=another-secret
```

### Middlewares required
- `cors`
- `express.json`, `express.urlencoded`
- `express-session` (for scan history in session)

---

## 💻 Frontend Setup

```bash
cd frontend
npm i
npm run dev
# open http://localhost:5173
```

### Required `.env` (frontend)
```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

Wrap app with GoogleOAuthProvider:
```tsx
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}>
  <App />
</GoogleOAuthProvider>
```

---

## 🔑 Auth Flows

### Email + OTP
1. Register → backend generates OTP (expires in 10 mins), sends via email  
2. Verify OTP → account activated  
3. Login → returns JWT + user object  

### Google Sign-In
1. Frontend obtains Google profile → POST `/auth/google`  
2. New users flagged `needsProfileCompletion=true`  
3. Redirect to `/google-onboarding` (phone + org)  
4. Backend updates user → `needsProfileCompletion=false`  
5. Future logins go straight to dashboard  

---

## 🧪 File Scanning Flow

1. User uploads file → `POST /api/files/upload`  
2. Backend:  
   - Validates type + free scan quota  
   - Multer saves file temporarily to `/uploads/`  
   - Sends to Stego API (sync/async)  
   - Interprets report → safe/malicious  
   - Saves Scan doc + updates User stats  
   - Deletes file from disk  
3. Frontend:  
   - Shows results (safe/malicious, severity, findings, scan time)  
   - Stats updated live  

**Free Scan Limit** is enforced via `remainingScans` in user model (default: 50).  

---

## 📊 Stats & Admin

- `GET /api/files/stats` → per-user stats (files scanned, threats, remaining scans)  
- `GET /api/admin/stats` → global stats (requires admin)  
- `GET /api/admin/users` → list of all users + last scan date  
- Admin dashboard supports **Excel export**  

Promote a user to admin:
```js
db.users.updateOne({ email: "admin@company.com" }, { $set: { isAdmin: true } })
```

---

## 🔒 Security Checklist

- `.env` files are ignored via `.gitignore`  
- Never use default `JWT_SECRET || "secret"` in production  
- Use HTTPS + `cookie.secure=true` behind proxies  
- Restrict CORS origins in prod  
- Validate file types and sizes (multer enforces 25MB max)  
- Don’t log secrets, OTPs, or tokens  

---

## 🛠 Example API Calls (Postman)

```http
POST /api/auth/register
POST /api/auth/verify-otp
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/google
POST /api/auth/google-onboarding
POST /api/files/upload
GET  /api/files/stats
GET  /api/admin/stats      # admin only
GET  /api/admin/users      # admin only
```

---

## 🎨 UI Highlights
- **Login/Register/OTP** with Google & email flows  
- **Dashboard:** drag-and-drop uploads, progress bar, results list  
- **Results:** collapsible details with severity & findings  
- **Admin Dashboard:** stats + user table + Excel export  
- **Terms & Conditions modal** for compliance  
- **Responsive design** (desktop & mobile):contentReference[oaicite:3]{index=3}:contentReference[oaicite:4]{index=4}

---

## 🧭 Troubleshooting

- **Email OTP not sending:** check `EMAIL_USER`/`EMAIL_PASS` and `.env` loading  
- **Google Sign-In loop:** ensure `/auth/google-onboarding` sets `needsProfileCompletion=false`  
- **Stego API errors:** verify `STEGO_BASE_URL` and `STEGO_AGENT_TOKEN`  
- **Sessions undefined:** mount `express-session` before routes  
- **Admin dashboard empty:** ensure JWT user has `isAdmin=true`

---

## 📦 Extending (SecureDICOM Variant)

- Backend: restrict file types to `.dcm`  
- Frontend: rebrand UI strings (Stego → SecureDICOM)  
- Deploy separately with different `.env` configs  

---

## 📜 License
This project is proprietary to Wetstonelabs. Distribution restricted.
