# AI StudyBuddy

**An AI assistant for smarter learning and study support**

A full-stack web application that turns lengthy study material into revision-ready content using
Google Gemini — summaries, flashcards, multiple-choice quizzes and personalised study plans.

| | |
|---|---|
| **Developed by** | Hasim Rizvi |
| **Class** | B.Sc. Computer Science — 3rd Year |
| **College** | Mohamed Sathak College of Arts and Science |
| **Architecture** | MVC, modular RESTful API |
| **Live demo** | Deploy free with one click using the included `render.yaml` |

---

## Table of Contents

1. [Problem & Solution](#problem--solution)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Architecture](#architecture)
6. [Database Design (ER)](#database-design-er)
7. [API Reference](#api-reference)
8. [Getting Started Locally](#getting-started-locally)
9. [Free Database Setup (MongoDB Atlas)](#free-database-setup-mongodb-atlas)
10. [Free Gemini API Key](#free-gemini-api-key)
11. [Offline Demo Engine](#offline-demo-engine)
12. [Seed Data & Demo Login](#seed-data--demo-login)
13. [Deploy to Render (Free)](#deploy-to-render-free)
14. [Testing](#testing)
15. [Troubleshooting](#troubleshooting)
16. [Future Enhancements](#future-enhancements)

---

## Problem & Solution

College students face a familiar problem: too much syllabus, too little time. Notes are scattered across
lecture slides, PDFs, textbooks and handwritten pages. Preparing revision notes, flashcards and practice
questions is manual, repetitive and slow.

AI StudyBuddy automates that work. A student pastes or uploads their material once, and the platform
generates:

- a **concise summary** with exam-important key points,
- **flashcards** for active recall practice,
- a **multiple-choice quiz** with instant scoring and explanations,
- a **day-by-day study plan** built around the exam date and daily available hours.

Everything generated is stored against the user's account, so it stays available for revision.

---

## Features

### Student

- Register / log in with secure JWT authentication
- Add study material by **pasting text** or **uploading a file** (`.txt`, `.md`, `.csv`, `.json`)
- Generate AI summary with key points
- Generate AI flashcards and practise with a flip-card interface
- Generate MCQ quizzes, attempt them and get scored instantly
- Generate personalised study plans with daily task breakdowns
- View all previously generated resources
- Edit profile and change password

### Administrator

- Dashboard with system-wide statistics
- View, activate/deactivate, promote/demote and delete users
- Review the system activity log
- Monitor which AI engine is serving requests

### Security

- Passwords hashed with **bcrypt** (salt rounds = 10)
- **JWT** access tokens, httpOnly cookies + Bearer header support
- **Role-Based Access Control** (student / admin)
- Helmet security headers, CORS, compression
- Rate limiting on auth routes (40 requests / 15 min) and the API (300 / min)
- File type + size validation on uploads
- Input validation through Mongoose schemas

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Vite, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Authentication | JSON Web Tokens, bcryptjs, cookies |
| AI Engine | Google Gemini 2.5 Flash (`@google/genai`) + Offline Demo Engine fallback |
| File Uploads | Multer |
| Security | Helmet, CORS, express-rate-limit, compression |
| Hosting | Render (free tier) · MongoDB Atlas (free tier M0) |

---

## Project Structure

```
Ai-Study-Buddy/
├── package.json                  # Root scripts (install, build, start)
├── render.yaml                   # One-click free Render deployment
├── README.md
├── PROJECT_REPORT.md             # Full academic project report
├── .env.example
│
├── server/                       # ===== BACKEND (Node + Express) =====
│   ├── index.js                  # Entry point: middleware, routes, static client
│   ├── package.json
│   ├── uploads/                  # Uploaded study material files
│   └── src/
│       ├── config/
│       │   └── db.js             # MongoDB (Mongoose) connection
│       ├── models/               # MODEL LAYER
│       │   ├── User.js           # name, email, password, role, college
│       │   ├── Material.js       # title, subject, content, sourceType
│       │   ├── Summary.js        # AI summary + key points
│       │   ├── Flashcard.js      # question, answer, difficulty
│       │   ├── Quiz.js           # questions, options, attempts
│       │   ├── StudyPlan.js      # studyPlan, dailyTasks, examDate
│       │   └── Activity.js       # system activity log
│       ├── controllers/          # CONTROLLER LAYER (business logic)
│       │   ├── authController.js
│       │   ├── materialController.js
│       │   ├── aiController.js
│       │   └── adminController.js
│       ├── routes/               # ROUTE DEFINITIONS
│       │   ├── authRoutes.js
│       │   ├── materialRoutes.js
│       │   ├── aiRoutes.js
│       │   └── adminRoutes.js
│       ├── middleware/
│       │   ├── auth.js           # JWT protect + role authorize
│       │   ├── upload.js         # Multer storage & file filter
│       │   ├── uploadError.js    # Friendly upload errors
│       │   └── errorHandler.js   # Central error handling + 404
│       └── utils/
│           ├── gemini.js         # AI SERVICE LAYER (Gemini + fallback)
│           ├── demoEngine.js     # Offline rule-based AI engine
│           ├── seed.js           # Demo data seeder
│           ├── ApiError.js
│           └── asyncHandler.js
│
└── client/                       # ===== FRONTEND (React) =====
    ├── index.html
    ├── vite.config.js            # Dev proxy to localhost:5000
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx               # Routing + route guards
        ├── index.css             # Tailwind + component classes
        ├── services/api.js       # Axios instance + interceptors
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── Alert.jsx
        │   └── Spinner.jsx
        └── pages/
            ├── Landing.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Materials.jsx
            ├── MaterialDetail.jsx  # AI actions + summary + cards + quiz
            ├── Flashcards.jsx
            ├── Quizzes.jsx
            ├── StudyPlans.jsx
            ├── Profile.jsx
            ├── Admin.jsx
            └── NotFound.jsx
```

---

## Architecture

```
┌──────────────────────┐
│  React Frontend      │  Landing · Auth · Dashboard · AI Tools · Admin
│  (Vite + Tailwind)   │
└──────────┬───────────┘
           │  HTTPS / JSON  (REST)
           ▼
┌──────────────────────────────────────────────────────────┐
│                  Express Server                          │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐  │
│  │ Middleware │ │   Routes   │     Controllers       │  │
│  │ helmet     │ │ /api/auth  │  authController       │  │
│  │ cors       │ │ /api/mat.. │  materialController   │  │
│  │ rate-limit │ │ /api/ai    │  aiController         │  │
│  │ multer     │ │ /api/admin │  adminController      │  │
│  │ JWT auth   │ │            │                       │  │
│  └────────────┘ └────────────┘ └───────────┬───────────┘  │
│                                             │              │
│  ┌──────────────┐              ┌────────────▼──────────┐  │
│  │  AI Service  │─────────────▶│   Mongoose Models     │  │
│  │ Gemini 2.5   │  fallback    │  User, Material,      │  │
│  │ + DemoEngine │              │  Summary, Flashcard,  │  │
│  └──────┬───────┘              │  Quiz, StudyPlan      │  │
│         │                      └────────────┬──────────┘  │
│         ▼  JSON prompts                      │             │
│  ┌──────────────────┐              ┌────────▼─────────┐   │
│  │  Google Gemini   │              │    MongoDB       │   │
│  │  API (external)  │              │  (Atlas / local) │   │
│  └──────────────────┘              └──────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### Request flow example (generate summary)

1. Client sends `POST /api/ai/materials/:id/summarize` with the JWT token.
2. `protect` middleware verifies the token and loads the user.
3. `aiController.generateSummary` loads the material, scoped to that user.
4. `gemini.generateSummary()` builds a JSON prompt and calls Gemini.
5. On success, structured JSON is returned; on failure, `demoEngine` generates it instead.
6. The result is saved to the `Summary` collection and returned to the client.

---

## Database Design (ER)

```
User (1) ───────< (N) Material (1) ───────< (N) Summary
                        │                          │
                        ├──────────────────────────┘  (each material → latest summary)
                        │
                        ├──────────────────────< (N) Flashcard
                        │
                        └──────────────────────< (N) Quiz

User (1) ───────< (N) StudyPlan
User (1) ───────< (N) Activity
```

### Collections

**1. User** — `name`, `email` (unique), `password` (bcrypt hashed), `role` (student/admin),
`department`, `year`, `college`, `isActive`, `lastLoginAt`, timestamps.

**2. Study Material** — `userId → User`, `title`, `subject`, `content`, `sourceType` (text/file),
`fileName`, `fileSize`, `tags`, `aiUsage` (which AI features have been run).

**3. Summary** — `userId → User`, `materialId → Material`, `summary`, `keyPoints[]`, `generatedBy`.

**4. Flashcard** — `userId → User`, `materialId → Material`, `question`, `answer`, `difficulty`.

**5. Quiz** — `userId → User`, `materialId → Material`, `title`, `questions[]` (each with 4 options,
`correctAnswer`, `explanation`), `attempts[]` (score history), `generatedBy`.

**6. Study Plan** — `userId → User`, `subject`, `examDate`, `availableHoursPerDay`, `weakAreas[]`,
`studyPlan` (full text), `dailyTasks[]`, `generatedBy`.

**7. Activity** — `userId → User`, `action`, `resource`, `meta` — the admin system log.

### Key relationships

- **User → Study Material**: one-to-many
- **Study Material → Summary**: one-to-one (latest kept per material)
- **Study Material → Flashcards**: one-to-many
- **Study Material → Quiz**: one-to-one (a quiz holds many questions)
- **User → Study Plan**: one-to-many (one plan per subject and exam date)
- **User → all AI resources**: one-to-many

---

## API Reference

All protected routes require `Authorization: Bearer <token>`.

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Service status, DB state, active AI engine |

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account, returns JWT |
| POST | `/api/auth/login` | Public | Log in, returns JWT |
| POST | `/api/auth/logout` | Public | Clear auth cookie |
| GET | `/api/auth/me` | User | Current user profile |
| PUT | `/api/auth/profile` | User | Update name / department / year / college |
| PUT | `/api/auth/password` | User | Change password |

### Study Material

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/materials` | User | List own materials (supports `?search=`, `?subject=`) |
| GET | `/api/materials/subjects` | User | Distinct subjects used |
| POST | `/api/materials` | User | Create material from pasted text |
| POST | `/api/materials/upload` | User | Upload a file (multipart, field name `file`) |
| GET | `/api/materials/:id` | User | Material + its summary, cards and quizzes |
| PUT | `/api/materials/:id` | User | Update material |
| DELETE | `/api/materials/:id` | User | Delete material and all its AI resources |

### AI Features

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/materials/:id/summarize` | User | Generate AI summary + key points |
| POST | `/api/ai/materials/:id/flashcards` | User | Generate flashcards (`{ count }`) |
| POST | `/api/ai/materials/:id/quiz` | User | Generate MCQ quiz (`{ count }`) |
| POST | `/api/ai/quizzes/:quizId/submit` | User | Submit answers, get score + explanations |
| GET | `/api/ai/flashcards` | User | All generated flashcards |
| GET | `/api/ai/quizzes` | User | All generated quizzes |
| POST | `/api/ai/study-plan` | User | Generate a study plan |
| GET | `/api/ai/study-plan` | User | List own study plans |
| DELETE | `/api/ai/study-plan/:id` | User | Delete a study plan |

**`POST /api/ai/study-plan` body**

```json
{
  "subject": "Data Structures",
  "examDate": "2026-10-20",
  "availableHoursPerDay": 3,
  "weakAreas": "Recursion, Graph traversal",
  "materialId": "optional-material-id"
}
```

### Administration (admin role only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | System statistics + activity log + AI engine status |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/status` | Activate / deactivate a user |
| PUT | `/api/admin/users/:id/role` | Change role (student / admin) |
| DELETE | `/api/admin/users/:id` | Delete a user and all their data |

### Response format

```json
{ "success": true, "message": "...", "data": { } }
{ "success": false, "message": "Error description" }
```

---

## Getting Started Locally

### Prerequisites

- **Node.js v18 or above** — check with `node -v`
- **npm v8 or above**
- A free **MongoDB Atlas** cluster (or a local MongoDB)
- Optional: a free **Google Gemini** API key

### 1. Install dependencies

```bash
git clone https://github.com/HasimRizvi/Ai-Study-Buddy.git
cd Ai-Study-Buddy
npm run install:all
```

`install:all` installs the root, `server` and `client` packages.

### 2. Configure environment

```bash
copy .env.example server\.env      # Windows
cp .env.example server/.env        # macOS / Linux
```

Then edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ai-study-buddy
JWT_SECRET=<a-long-random-string>
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
MAX_FILE_SIZE_MB=5
```

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Run in development

Two terminals:

```bash
# Terminal 1 — backend on http://localhost:5000
npm run dev:server
```

```bash
# Terminal 2 — frontend on http://localhost:5173
npm run dev:client
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` calls to the backend.

### 4. Run in production mode (single server)

```bash
npm run build     # builds the React client into client/dist
npm start         # Express serves both the API and the built client
```

Open **http://localhost:5000**.

---

## Free Database Setup (MongoDB Atlas)

1. Sign up at **https://www.mongodb.com/atlas/register** (free).
2. Choose the free **M0** cluster (512 MB, shared).
3. Pick a cloud region closest to you (e.g. **Singapore / Mumbai**).
4. Create a database user:
   - Authentication Method → **Password**
   - Username: `studybuddy`
   - Password: choose a strong one
5. Under **Network Access**, click *Allow access from anywhere* (`0.0.0.0/0`).
   Required because Render assigns a dynamic outbound IP.
6. Click **Connect → Drivers** and copy the connection string:

```
mongodb+srv://studybuddy:<password>@cluster0.xxxxx.mongodb.net/ai-study-buddy
```

7. Paste it into `MONGO_URI` in `server/.env` (and in Render environment variables).

> **Special characters:** if your password contains `@ : / ? # [ ] %`, percent-encode them
> (for example `@` → `%40`) or choose a password without symbols.

---

## Free Gemini API Key

1. Go to **https://aistudio.google.com/apikey**.
2. Sign in with a Google account and click **Create API key**.
3. Copy the key into `GEMINI_API_KEY` in `server/.env`.

The key is **optional**. Without it the app runs on the built-in Offline Demo Engine, so every
feature still works — this is what makes the project demo-safe for viva and offline use.

Check which engine is active at any time:

```bash
curl http://localhost:5000/api/health
```

```json
{ "ai": { "engine": "gemini", "model": "gemini-2.5-flash", "live": true } }
```

---

## Offline Demo Engine

`server/src/utils/demoEngine.js` performs genuine text analysis without any external API:

| Feature | How it works offline |
|---|---|
| Summary | Sentence splitting, TF keyword frequency, sentence scoring, top-ranked selection |
| Key points | Highest-scoring sentences from the summary |
| Flashcards | Regex concept extraction (`X is/refers to …`), sentence cloze questions, keyword definitions |
| Quiz | MCQs built from extracted definitions and cloze questions, with 4 shuffled options and explanations |
| Study plan | Phase model (Foundation → Active Recall → Deep Revision → Final Polish) expanded into daily tasks with milestones and exam-day rules |

The engine is used automatically when `GEMINI_API_KEY` is empty **or** if a live Gemini call fails
(rate limit, quota, network). The response always includes `generatedBy: "gemini" | "demo"`, and the
UI displays a badge showing which engine produced the content.

---

## Seed Data & Demo Login

Populate the database with an admin account, a sample study material, a summary, flashcards, a quiz
and a study plan:

```bash
npm run seed
```

**Demo credentials**

| Field | Value |
|---|---|
| Email | `hasim@mohamedsathak.edu.in` |
| Password | `Hasim@2026` |
| Role | admin |

To create a different admin, set these before seeding:

```bash
SEED_ADMIN_EMAIL=my@email.com SEED_ADMIN_PASSWORD=MyPass@123 npm run seed
```

**To promote an existing account to admin** (run once in a Mongo shell or a small script):

```js
// db.users.updateOne({ email: "you@email.com" }, { $set: { role: "admin" } })
```

---

## Deploy to Vercel + Render (Free, Separate Services)

The application is now deployed as **three independent services** so each part scales and
manages independently:

```
FRONTEND  ->  Vercel    (React)
BACKEND   ->  Render    (Node.js + Express + MongoDB)
DATABASE  ->  Atlas     (M0 free tier)
```

Because the frontend calls the backend through its public URL, the React app does NOT
need to be built into the Express server - each service is fully independent.

### Architecture

- **Render** hosts the Express API at `https://ai-study-buddy-api.onrender.com`.
  The API serves only JSON; it does not serve the React build.
- **Vercel** hosts the React build at `https://ai-study-buddy.vercel.app`.
  It calls the Render API URL through the `VITE_API_URL` environment variable.
- **MongoDB Atlas** is a standalone cluster both services connect to.
- The **Offline Demo Engine** still runs on the backend when `GEMINI_API_KEY` is absent,
  so the app remains fully functional.

### Step 1 - Get the two API tokens (30 seconds each)

You only need to do this once. These tokens let the deployment scripts authenticate
with each platform.

**A. Vercel token**
1. Go to **https://vercel.com/account/tokens**
2. Click **Create Token**
3. Name: `ai-study-buddy`, Scope: **Deployments**
4. Click **Create** and **copy the token immediately** (it is shown only once)

**B. Render API key**
1. Go to **https://dashboard.render.com/settings/api**
2. Copy the **Live API Key** shown on that page

### Step 2 - Push the repository

```bash
git add -A
git commit -m "Deploy AI StudyBuddy"
git push
```

### Step 3 - Deploy the backend API to Render

```bash
$env:RENDER_API_KEY="PASTE_YOUR_RENDER_KEY_HERE"
render services create --yaml render.yaml
```

This reads `render.yaml` and creates one free web service: **ai-study-buddy-api**.

**Configure environment variables** on the Render dashboard under the service's
**Environment** tab:

| Key | Value |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `GEMINI_API_KEY` | Your Gemini key *(optional)* |

`JWT_SECRET` is generated automatically by Render.

The API builds and starts. Its public URL will be:

```
https://ai-study-buddy-api.onrender.com
```

Verify it:

```bash
curl https://ai-study-buddy-api.onrender.com/api/health
```

### Step 4 - Deploy the frontend to Vercel

```bash
$env:VERCEL_TOKEN="PASTE_YOUR_VERCEL_TOKEN_HERE"

# Build once locally so the dist is ready, with the Render API URL baked in
cd client
$env:VITE_API_URL="https://ai-study-buddy-api.onrender.com"
npm run build
cd ..

# Deploy to Vercel
vercel --prod --token $env:VERCEL_TOKEN
```

During the first `vercel` command you will be asked to confirm the project settings -
accept the defaults (it auto-detects the Vite React project).

Vercel will assign a URL like:

```
https://ai-study-buddy.vercel.app
```

**Important:** set the same `VITE_API_URL` in the Vercel dashboard too so future deploys
rebuild with the correct API URL:

- Vercel dashboard -> Project -> Settings -> Environment Variables
- Add: `VITE_API_URL` = `https://ai-study-buddy-api.onrender.com`

### Step 5 - Seed demo data (optional)

Seed from your local machine so it writes to the same Atlas database:

```bash
# server/.env must point at your Atlas MONGO_URI
npm run seed
```

**Demo credentials:** `hasim@mohamedsathak.edu.in` / `Hasim@2026`

### Step 6 - Share the links with your staff

Once both deploys succeed, the live URLs are:

| Service | URL |
|---|---|
| **Frontend (React)** | `https://ai-study-buddy.vercel.app` |
| **Backend API** | `https://ai-study-buddy-api.onrender.com` |
| **API Health** | `https://ai-study-buddy-api.onrender.com/api/health` |

Send the **frontend URL** to your staff - that is all they need to open in a browser.
The API URL is only used internally by the frontend.

### How to redeploy after code changes

**Backend (Render)**
```bash
render services sync --service ai-study-buddy-api --token $env:RENDER_API_KEY
```

**Frontend (Vercel)**
```bash
vercel --prod --token $env:VERCEL_TOKEN
```

Both platforms auto-deploy from GitHub on every `git push` when connected, so pushing
to `main` deploys everything automatically.

### Free tier notes

- **Render free services sleep after 15 minutes** of inactivity - first request takes
  ~30-60 seconds. Wake it before a demo.
- **Vercel free tier** allows 100 GB-hours/month and serverless function invocations.
- **MongoDB Atlas M0** gives 512 MB of shared storage.
- **The Offline Demo Engine keeps the app fully functional** even if the Gemini key
  expires or the quota runs out.
- Uploaded files live on the Render container filesystem and are **cleared on redeploy**.
  Text is persisted in MongoDB, so generated AI resources survive. For permanent file
  storage, add Cloudinary or Amazon S3 in `server/src/middleware/upload.js`.

---

## Deploy to Render (Single Service - Alternative)

If you prefer the simpler **one-service** option (Express serves both API and React),
use the `render.yaml` as-is:

```bash
render services create --yaml render.yaml --token $env:RENDER_API_KEY
```

This creates a single free web service `ai-study-buddy` that runs both the backend and
the React build. No separate Vercel account is needed. The URL is
`https://ai-study-buddy.onrender.com`.

---


## Testing
## Testing

The backend was verified end-to-end against a real MongoDB instance — **61 automated assertions, all
passing**:

**Suite 1 — core API (48 checks)**

- Health endpoint, DB connection status
- Registration, duplicate email rejection, short password rejection
- Password never present in API responses
- Login (success + wrong password), `/me`, profile update, password change
- Old password invalid / new password valid after change
- Protected routes reject anonymous requests (401)
- Material create (text), short content rejection, list, subjects, get by id, update, delete
- Summary generation + key points
- Flashcard generation (8 cards) with complete Q/A
- Quiz generation — 4 options each, `correctAnswer` always matches an option
- Quiz scoring — 100% with correct answers, 0% with wrong answers
- Study plan generation — 7 daily tasks, past exam date rejected, list + delete
- RBAC: student blocked from `/api/admin/*` (403)
- Admin stats and activity log
- Admin user activation/deactivation, role change, self-protection, cascade delete
- Deactivated user blocked (403)
- Unknown API route returns 404 JSON

**Suite 2 — uploads, static serving, security (13 checks)**

- `.txt` upload, file physically stored, original name preserved
- Upload without a title falls back to the file name
- `.exe` rejected with a friendly message
- Oversize file rejected with the size limit stated
- AI works on uploaded file content
- Deleting a material removes its file from disk
- Server serves the built React client at `/`
- SPA fallback serves `index.html` for `/dashboard`
- API remains reachable alongside static files
- Helmet security headers present

The frontend production build completes cleanly (104 modules, 294 kB JS / 31 kB CSS gzipped to
~90 kB / 5.7 kB).

> Note: `rollup` ships a native binary that some corporate Windows Application Control policies block.
> If `npm run build` fails with `ERR_DLOPEN_FAILED ... rollup.win32-x64-msvc.node`, work around it by
> adding to `client/package.json`:
> `"overrides": { "rollup": "npm:@rollup/wasm-node@^4.34.8" }`

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `[DB] MONGO_URI is not configured` | `server/.env` was not created. Copy `.env.example` to `server/.env` and set `MONGO_URI`. |
| `MongooseServerSelectionError` | Wrong Atlas credentials/host, or the IP is not whitelisted. Add `0.0.0.0/0` in Network Access. |
| `Not authorised, please log in` | The token is missing or expired. Log in again. |
| Frontend loads but API calls fail in dev | Run `npm run dev:server` alongside `npm run dev:client`. |
| AI responses say "Offline Demo Engine" | `GEMINI_API_KEY` is empty or the call failed. Check `/api/health`. |
| Upload returns "File is too large" | Raise `MAX_FILE_SIZE_MB` in `server/.env`. |
| Upload returns "Only .txt, .md..." | PDFs and images are intentionally not supported. Copy the text out first. |
| Admin page redirects to dashboard | The account role is `student`. Promote it to `admin`. |
| Render says "Build failed" | Open the build log. Usually a wrong `MONGO_URI` or a failed `npm run install:all`. |
| Render first request is slow | Expected — free services sleep after 15 minutes idle. |
| Port already in use | Change `PORT` in `server/.env`, and update the Vite proxy in `client/vite.config.js`. |

---

## Future Enhancements

- PDF and DOCX extraction using `pdf-parse` / `mammoth`
- Spaced-repetition scheduling for flashcards (SM-2 algorithm)
- AI-powered doubt solving chat with chat history
- Marks-based analytics and progress charts per subject
- Image/handwriting input via OCR
- Cloud object storage for permanent file hosting
- Email verification and password reset
- Multilingual summaries and translation
- Mobile app built with React Native

---

## License

MIT License — free to use for academic and educational purposes.

Developed by **Hasim Rizvi**, B.Sc. Computer Science (3rd Year),
**Mohamed Sathak College of Arts and Science**.
