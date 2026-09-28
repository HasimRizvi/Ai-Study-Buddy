# AI StudyBuddy — Project Report

**An AI assistant for smarter learning and study support**

| | |
|---|---|
| **Project Title** | AI StudyBuddy — An AI assistant for smarter learning and study support |
| **Submitted by** | Hasim Rizvi |
| **Class** | B.Sc. Computer Science — 3rd Year |
| **College** | Mohamed Sathak College of Arts and Science |
| **Academic Year** | 2025 – 2026 |
| **Repository** | https://github.com/HasimRizvi/Ai-Study-Buddy |

---

## Table of Contents

1. [Description](#1-description)
2. [Scenario-Based Case Study](#2-scenario-based-case-study)
3. [Problem](#3-problem)
4. [Solution](#4-solution)
5. [Software & Hardware Requirements](#5-software--hardware-requirements)
6. [System Design](#6-system-design)
7. [Epic 1 — Project Architecture](#7-epic-1--project-architecture)
8. [Epic 2 — Project Setup and Configuration](#8-epic-2--project-setup-and-configuration)
9. [Epic 3 — Backend Development](#9-epic-3--backend-development)
10. [Epic 4 — Database Configuration](#10-epic-4--database-configuration)
11. [Epic 5 — Project Execution](#11-epic-5--project-execution)
12. [Testing](#12-testing)
13. [Deployment](#13-deployment)
14. [Conclusion](#14-conclusion)
15. [References](#15-references)

---

## 1. Description

AI StudyBuddy is an AI-powered learning assistance platform developed to simplify the study process for
students by leveraging modern web technologies and Generative AI. The application provides an
intelligent backend system that enables students to upload study materials, generate concise
summaries, create flashcards, produce quizzes, and receive personalized study plans through
AI-generated responses.

The backend is developed using **Node.js and Express.js**, following a **RESTful API architecture**
that ensures scalability, maintainability, and secure communication between the frontend and backend
services. **MongoDB** serves as the primary NoSQL database, while **Mongoose ODM** provides schema
validation, data modeling, and efficient database interactions. To secure user information and
protected resources, the application implements **JWT (JSON Web Token)** based authentication along
with **Role-Based Access Control (RBAC)**. Users are authenticated before accessing AI-powered
features, ensuring that only authorized users can utilize premium learning services. Passwords are
securely encrypted using **bcryptjs**, preventing unauthorized access to user credentials.

One of the key highlights of AI StudyBuddy is its integration with the **Google Gemini AI API**, which
enables the application to perform advanced natural language processing tasks. Instead of relying on
predefined templates, the backend dynamically communicates with the Gemini model to generate
high-quality educational content based on the study material provided by the user.

The frontend is developed using **React.js** with **Vite** and **Tailwind CSS**, and is served by the
same Express process, so the complete application runs as a single deployable unit.

---

## 2. Scenario-Based Case Study

### Background

**Hasim** is a third-year B.Sc. Computer Science student at Mohamed Sathak College of Arts and Science,
preparing for semester examinations while simultaneously learning new technical skills for
internships and placement opportunities. His study materials are scattered across lecture notes, PDFs,
textbooks, online articles, and handwritten notes, making it difficult to organize and revise
effectively. Due to the large volume of content and limited preparation time, Hasim often struggles to
identify important concepts, create revision notes, and evaluate his understanding before
examinations.

Traditional study methods require significant manual effort to summarize lengthy materials, prepare
practice questions, and create revision schedules. This process is repetitive, time-consuming, and
often results in inconsistent learning outcomes.

### Context of the Project

The project was developed as a full-stack web application to demonstrate the practical use of Generative
AI in education. The emphasis is on a **secure, modular RESTful backend** combined with a responsive
React frontend, so that any client — web, mobile, or desktop — can consume the same learning services
through documented APIs.

---

## 3. Problem

Hasim encounters several challenges during his preparation:

- Difficulty understanding lengthy study materials within limited time.
- Manual preparation of notes consumes a significant amount of study time.
- Creating flashcards and revision questions is repetitive and labor-intensive.
- Lack of personalized study plans based on available time and examination schedules.
- No centralized platform to securely store AI-generated learning resources.
- Difficulty assessing knowledge through self-generated quizzes.
- Switching between multiple applications for note-taking, quizzes, and scheduling reduces productivity.

---

## 4. Solution

The AI StudyBuddy backend provides a centralized, AI-powered learning platform that automates several
academic tasks through intelligent content generation. The system enables authenticated users to upload
or enter study materials and leverage the Google Gemini AI API to generate educational resources
automatically.

The backend processes incoming requests through secure RESTful APIs and performs the following
operations:

- Authenticates users using JWT-based security.
- Stores user information and study resources in MongoDB.
- Sends study content to the Google Gemini model through dedicated AI service modules.
- Generates concise summaries for faster revision.
- Creates flashcards for active recall learning.
- Produces multiple-choice quizzes for self-assessment.
- Generates personalized study plans based on user preferences and examination timelines.
- Stores generated learning resources for future retrieval and continuous learning.

By separating **authentication, business logic, database operations, and AI processing** into modular
components, the backend ensures maintainability, scalability, and efficient request handling.

### Robustness Enhancement

Because a college project must be demonstrable at any time — including without internet access, an API
key, or quota — the AI service layer is designed with a **graceful fallback**. When
`GEMINI_API_KEY` is absent, or when a live Gemini call fails (rate limit, quota expiry, network
failure), the service transparently switches to a built-in **Offline Demo Engine** that performs real
text analysis using sentence scoring, keyword frequency analysis, and regex-based concept extraction.
The response always reports which engine produced the content, so the behaviour is transparent and
verifiable during evaluation.

---

## 5. Software & Hardware Requirements

### Software Requirements

| Requirement | Specification |
|---|---|
| Operating System | Windows 10/11, macOS, or Linux (cross-platform) |
| Node.js | v16 or above (v18+ recommended) |
| npm | v8 or above |
| Express.js | Lightweight routing web framework for the backend RESTful entry points |
| MongoDB | Document NoSQL engine storing users, materials, and analytics metrics |
| React.js | Frontend user interface |
| Mongoose | ODM providing schema validation and data modeling |
| Postman / Thunder Client | API verification toolkit for schema validation across route guards |
| Code Editor | Visual Studio Code or similar IDE |
| Web Browser | Any modern browser (Chrome, Edge, Firefox) |

### Hardware Requirements

| Component | Specification |
|---|---|
| Processor | Intel Core i5 (8th Gen or above) / AMD Ryzen 5 or equivalent |
| RAM | 8 GB minimum (16 GB recommended for concurrent MongoDB and processing layers) |
| Storage | 1 GB of available disk workspace |

---

## 6. System Design

### Modules

| Module | Responsibility |
|---|---|
| **Client Application** | React frontend — register, log in, upload study material, access AI features |
| **Express Server** | Receives HTTP requests, handles routing, processes middleware, sends responses |
| **Authentication Middleware** | Verifies JWT identity, protects private routes, enforces role authorization |
| **Route Handlers** | Define endpoints for authentication, materials, AI features, administration |
| **Controllers** | Validate input, authorize, invoke models and AI services, shape responses |
| **AI Service Layer** | Communicates with Google Gemini to generate summaries, flashcards, quizzes, plans |
| **Database Layer** | Mongoose models storing users, materials, and AI-generated resources |

### MVC Architecture Pattern

**Model Layer (Data Layer)** — Defines the MongoDB collections using Mongoose schemas. Responsible for
managing user information, uploaded study materials, and AI-generated learning resources while
ensuring data validation and database interactions.

**View Layer (API Response Layer)** — Since AI StudyBuddy exposes a backend REST API, there is no
traditional server-rendered user interface in the View layer. Instead, the API returns structured JSON
responses to the React frontend, allowing users to interact through REST endpoints. The React
application itself acts as the presentation layer consuming these responses.

**Controller Layer (Business Logic)** — Processes incoming API requests, validates user input, performs
authentication and authorization, communicates with the database models, invokes the Google Gemini AI
service when required, and returns the appropriate response to the client.

**MVC Benefits** — Separating data management, business logic, and client communication into independent
components improves code readability, simplifies debugging and testing, and allows new features to be
integrated without affecting existing modules.

---

## 7. Epic 1 — Project Architecture

The AI StudyBuddy backend follows a modular RESTful architecture designed to provide secure, scalable,
and AI-powered learning services. The system processes client requests through Express.js, validates
users using JWT authentication, interacts with MongoDB for data storage, and communicates with the
Google Gemini AI API to generate intelligent study resources.

The architecture separates authentication, business logic, AI services, and database operations into
independent modules, making the application easier to maintain, extend, and debug.

### Component Definition

- **Client Application**: The frontend (React.js) allows users to register, log in, upload study
  material, and access AI-powered features such as summaries, quizzes, flashcards, and study plans
  through REST APIs.
- **Express Server**: The Express.js server receives HTTP requests, handles routing, processes
  middleware, and sends appropriate responses to the client.
- **Authentication Middleware**: JWT-based middleware verifies user identity, protects private routes,
  and ensures that only authenticated users can access AI services and study resources.
- **Route Handlers**: Routes manage API endpoints related to user authentication, study material, AI
  features, and administrative operations.
- **AI Service Layer**: A dedicated AI service communicates with the Google Gemini API to generate
  summaries, quizzes, flashcards, and personalized study plans based on the user's study content.
- **Database Layer**: MongoDB, together with Mongoose ODM, stores user information, uploaded study
  materials, and AI-generated learning resources securely.

### Entity-Relationship (ER) Diagram Description

The backend manages data through interconnected MongoDB collections that store user information, study
materials, and AI-generated learning resources. Each entity is linked using logical relationships to
ensure efficient data management and retrieval.

**1. User Entity** — Stores the details of registered users and administrators.
Attributes: `_id` (Primary Key – ObjectId), `name` (String, Required), `email` (String, Required,
Unique), `password` (String, Hashed), `role` (String – Student/Admin), `department`, `year`, `college`,
`isActive`, `lastLoginAt`, `createdAt`.

**2. Study Material Entity** — Stores study content uploaded by students for AI processing.
Attributes: `_id` (Primary Key), `userId` (Foreign Key → User), `title`, `subject`, `content`,
`sourceType`, `fileName`, `tags`, `createdAt`.

**3. Summary Entity** — Stores AI-generated summaries.
Attributes: `_id` (Primary Key), `userId` (Foreign Key → User), `materialId` (Foreign Key → Study
Material), `summary`, `keyPoints[]`, `generatedBy`, `createdAt`.

**4. Flashcard Entity** — Stores AI-generated flashcards.
Attributes: `_id` (Primary Key), `userId` (Foreign Key → User), `materialId` (Foreign Key → Study
Material), `question`, `answer`, `difficulty`, `createdAt`.

**5. Quiz Entity** — Stores AI-generated quizzes.
Attributes: `_id` (Primary Key), `userId` (Foreign Key → User), `materialId` (Foreign Key → Study
Material), `title`, `questions[]` (each with `question`, 4 `options`, `correctAnswer`, `explanation`),
`attempts[]`, `createdAt`.

**6. Study Plan Entity** — Stores personalized study plans generated by AI.
Attributes: `_id` (Primary Key), `userId` (Foreign Key → User), `subject`, `studyPlan`, `examDate`,
`availableHoursPerDay`, `weakAreas[]`, `dailyTasks[]`, `createdAt`.

**7. Activity Entity** — Stores the system activity log for administrative monitoring.
Attributes: `_id` (Primary Key), `userId` (Foreign Key → User), `action`, `resource`, `meta`,
`createdAt`.

### Key Relationships

- **User → Study Material** (One-to-Many): A user can upload multiple study materials.
- **Study Material → Summary** (One-to-One): Each uploaded material can have one AI-generated summary.
- **Study Material → Flashcards** (One-to-Many): One study material can generate multiple flashcards.
- **Study Material → Quiz** (One-to-One): One study material can generate one quiz containing multiple
  questions.
- **User → Study Plan** (One-to-Many): A user can generate multiple study plans based on different
  subjects or examination schedules.
- **User → AI Resources** (One-to-Many): All AI-generated summaries, flashcards, quizzes, and study
  plans are associated with the user who generated them.

### Key Features

- **Secure User Authentication**: JWT-based authentication with encrypted passwords using bcrypt.
- **Study Material Management**: Upload and manage study materials that act as AI input.
- **AI Summary Generation**: Concise summaries from uploaded content using the Google Gemini API.
- **AI Flashcard Generation**: Automatic flashcards for concept revision and active recall.
- **AI Quiz Generation**: Multiple-choice quizzes for self-assessment with instant scoring.
- **AI Study Plan Generation**: Personalized study plans based on learning goals and available time.
- **Role-Based Access Control (RBAC)**: Different access privileges for Students and Administrators.
- **MongoDB Data Storage**: Efficient storage of users, materials, and AI resources.
- **File Upload Support**: `.txt`, `.md`, `.csv` and `.json` material uploads via Multer.
- **Offline Resilience**: Built-in demo engine guarantees functionality without an AI key.

### Roles and Responsibilities

**Student** — The primary users of the system. They can register, log in securely, upload study
materials, and utilize AI-powered features such as summary generation, flashcard creation, quiz
generation, and personalized study plans. Students can also view and manage their previously generated
learning resources.

**Administrator** — Manage the overall system and ensure its smooth operation. They monitor registered
users, manage user accounts (activate, deactivate, promote, delete), oversee application usage, review
system logs, monitor which AI engine is active, and resolve user-related issues.

### User Flow

The application begins with the user registering or logging into the system. After successful JWT-based
authentication, the user is redirected to the dashboard, where they can upload study materials and access
AI-powered features. Based on the uploaded content, the system generates summaries, flashcards, quizzes,
or personalized study plans using the Google Gemini API. All generated resources are displayed to the
user and saved for future reference. Users can also manage their profile and view their previously
generated learning resources through the dashboard.

---

## 8. Epic 2 — Project Setup and Configuration

### Creating the Project Folder

1. Create a new folder named `Ai-Study-Buddy`.
2. Open the project folder in Visual Studio Code.
3. Initialize the project using Node.js and install the required dependencies.

### Project Initialization

```bash
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv multer @google/genai
npm install helmet cors compression cookie-parser morgan express-rate-limit
npm install --save-dev nodemon
```

### Folder Structure

```
Ai-Study-Buddy/
├── client/            # React frontend
│   ├── src/
│   │   ├── pages/     # Landing, Login, Register, Dashboard, Materials, ...
│   │   ├── components/# Navbar, Footer, Alert, Spinner
│   │   ├── context/   # AuthContext
│   │   └── services/  # Axios API client
│   └── vite.config.js
├── server/            # Express backend
│   ├── index.js
│   ├── uploads/
│   └── src/
│       ├── config/    # db.js
│       ├── models/    # User, Material, Summary, Flashcard, Quiz, StudyPlan, Activity
│       ├── controllers/ # auth, material, ai, admin
│       ├── routes/    # auth, material, ai, admin
│       ├── middleware/  # auth, upload, uploadError, errorHandler
│       └── utils/     # gemini.js, demoEngine.js, seed.js, ApiError.js, asyncHandler.js
├── render.yaml
└── package.json
```

### Environment Configuration

A `.env` file is created in the `server` folder and the required environment variables are configured.

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
MAX_FILE_SIZE_MB=5
```

The `.env` file is excluded from version control through `.gitignore` to prevent secrets from being
exposed in the repository. A `.env.example` template is provided instead.

---

## 9. Epic 3 — Backend Development

The backend is developed using Node.js, Express.js, and MongoDB, following a modular architecture. The
application separates routing, controllers, middleware, models, and utility modules to improve
maintainability and scalability. The backend exposes secure REST APIs for authentication, study
material management, AI-powered content generation, and administrative operations.

### Core System Script Implementations

**1. Application Entry Point (`server/index.js`)**
The `index.js` file serves as the main entry point of the application. It loads environment variables via
`dotenv`, configures security middleware (`helmet`, `cors`, `compression`, `cookie-parser`, `morgan`,
rate limiting), registers the API routes, serves the compiled React client as static assets with SPA
fallback, establishes the MongoDB connection, and starts the server only after a successful database
connection.

**2. Database Connection (`server/src/config/db.js`)**
This module establishes a connection between the application and MongoDB using Mongoose. It ensures the
backend communicates with the database before processing any client requests, exits with a clear message
if `MONGO_URI` is missing, and applies a 10-second server selection timeout for fast failure feedback.

**3. Authentication Middleware (`server/src/middleware/auth.js`)**
The authentication middleware verifies JWT access tokens for protected routes. It accepts the token
from either the `Authorization: Bearer` header or an httpOnly cookie, rejects expired or tampered
tokens, loads the user, blocks deactivated accounts, and includes a `authorize(...roles)` function to
restrict administrative operations.

**4. AI Integration (`server/src/utils/gemini.js`)**
This utility integrates the backend with the **Google Gemini 2.5 Flash** model. It sends prompts
requesting strictly valid JSON (`responseMimeType: application/json`) and parses the response,
tolerating markdown code fences. If no API key is configured, or if a call fails, it transparently falls
back to the Offline Demo Engine and flags the response with `generatedBy: "demo"`.

**5. File Upload Middleware (`server/src/middleware/upload.js`)**
The upload middleware handles study material uploads using Multer. It stores files in
`server/uploads` with unique names, validates the extension and MIME type against an allow-list
(`.txt`, `.md`, `.csv`, `.json`), and enforces a configurable size limit. `uploadError.js` converts
Multer errors into clear client-facing messages.

**6. Error Handling (`server/src/middleware/errorHandler.js`)**
Centralised error handling translates Mongoose `ValidationError`, `CastError`, and duplicate-key
(`11000`) errors into structured JSON responses, and provides a JSON 404 handler for unmatched API
routes.

### API Route Interface Endpoints

**1. Authentication APIs** — Handle user registration, login, JWT issuance, profile management, and
protected route access.

**2. Study Material APIs** — Allow users to create, upload, retrieve, update, search, and delete study
materials, all scoped to the authenticated user.

**3. AI Feature APIs** — Provide endpoints for AI summary generation, AI flashcard generation, AI quiz
generation, quiz submission with scoring, and AI study plan generation.

**4. Administrative APIs** — Provide administrator-only endpoints for system statistics, user
management, and activity monitoring.

---

## 10. Epic 4 — Database Configuration

The backend uses MongoDB as its primary NoSQL database and Mongoose ODM for data modeling and schema
validation. MongoDB stores user information, uploaded study materials, and AI-generated learning
resources in a structured manner. Mongoose simplifies database operations by providing schemas,
validation rules, and efficient query handling.

### Database Collections

The AI StudyBuddy database consists of the following collections:

- **Users** — Stores user account and authentication details.
- **Study Materials** — Stores uploaded learning materials.
- **Summaries** — Stores AI-generated summaries and key points.
- **Flashcards** — Stores AI-generated question-answer cards.
- **Quizzes** — Stores AI-generated quizzes and attempt history.
- **Study Plans** — Stores personalised study plans.
- **Activities** — Stores the system activity log.

### Mongoose Schema Definitions

1. **User Schema (`models/User.js`)** — Stores authentication and profile information. Passwords are
   securely encrypted before being stored using a `pre('save')` hook that generates a bcrypt salt
   (10 rounds) and hashes the password. A `matchPassword()` instance method compares a candidate
   password, and `toPublicJSON()` guarantees the hashed password is never serialised to the client.
2. **Study Material Schema (`models/Material.js`)** — Stores the learning content uploaded by users.
   This content acts as the input for AI features. The `aiUsage` sub-document records which AI features
   have already been applied to the material.
3. **Summary, Flashcard, Quiz and StudyPlan Schemas** — Store the AI-generated learning resources,
   each linked to both the owning user and the originating study material.

### Relationship Implementation

All references are implemented using `mongoose.Schema.Types.ObjectId` with `ref` declarations and
indexes on the frequently queried fields (`userId`, `materialId`, `createdAt`). Cascade deletion is
handled explicitly in the controllers: removing a study material also removes its summaries,
flashcards, and quizzes; removing a user removes their materials, generated resources, study plans, and
activity records.

---

## 11. Epic 5 — Project Execution

The backend can be executed locally using Node.js. Before running the application, MongoDB must be
reachable and the required environment variables must be configured correctly. The backend exposes
REST APIs that can be tested using Postman or Thunder Client.

### Running the Application

```bash
# Install all dependencies (root, server and client)
npm run install:all

# Start the development server
npm run start

# Or run the backend and frontend separately
npm run dev:server    # http://localhost:5000
npm run dev:client    # http://localhost:5173
```

After successful execution, the server connects to MongoDB and starts listening for incoming API
requests:

```
==============================================
  AI StudyBuddy API
  Mode        : development
  Server      : http://localhost:5000
  Health      : http://localhost:5000/api/health
  AI engine   : gemini (gemini-2.5-flash)
==============================================
```

### API Testing

#### 1. User Registration
Registers a new user by accepting the required details and securely storing the encrypted password in
the MongoDB database.

`POST /api/auth/register`

```json
{
  "name": "Hasim Rizvi",
  "email": "hasim@mohamedsathak.edu.in",
  "password": "Hasim@2026",
  "department": "B.Sc. Computer Science",
  "year": "3rd Year",
  "college": "Mohamed Sathak College of Arts and Science"
}
```

#### 2. User Login
Authenticates the registered user and generates a JWT access token for accessing protected APIs.

`POST /api/auth/login`

```json
{ "email": "hasim@mohamedsathak.edu.in", "password": "Hasim@2026" }
```

#### 3. Upload Study Material
Allows authenticated users to upload study material that will be used as input for AI-powered content
generation.

`POST /api/materials/upload` (multipart, field `file`) or `POST /api/materials` for pasted text.

#### 4. Generate AI Summary
Sends the uploaded study material to the Google Gemini API and generates a concise summary.

`POST /api/ai/materials/:id/summarize`

#### 5. Generate AI Flashcards
Creates AI-generated flashcards from the uploaded study material for effective revision.

`POST /api/ai/materials/:id/flashcards` — body `{ "count": 8 }`

#### 6. Generate AI Quiz
Generates multiple-choice questions from the uploaded study material to help users assess their
understanding.

`POST /api/ai/materials/:id/quiz` — body `{ "count": 5 }`

#### 7. Generate AI Study Plan
Creates a personalized study schedule based on the user's learning goals and available study time.

`POST /api/ai/study-plan`

```json
{
  "subject": "Data Structures",
  "examDate": "2026-10-20",
  "availableHoursPerDay": 3,
  "weakAreas": "Recursion, Graph traversal"
}
```

### Complete Endpoint Reference

| # | Method | Endpoint | Auth | Description |
|---|---|---|---|---|
| 1 | GET | `/api/health` | Public | Service status, DB state, AI engine |
| 2 | POST | `/api/auth/register` | Public | Register a user |
| 3 | POST | `/api/auth/login` | Public | Log in and receive a JWT |
| 4 | POST | `/api/auth/logout` | Public | Clear the auth cookie |
| 5 | GET | `/api/auth/me` | User | Current profile |
| 6 | PUT | `/api/auth/profile` | User | Update profile |
| 7 | PUT | `/api/auth/password` | User | Change password |
| 8 | GET | `/api/materials` | User | List own materials |
| 9 | GET | `/api/materials/subjects` | User | Distinct subjects |
| 10 | POST | `/api/materials` | User | Create material from text |
| 11 | POST | `/api/materials/upload` | User | Upload material file |
| 12 | GET | `/api/materials/:id` | User | Material with its AI resources |
| 13 | PUT | `/api/materials/:id` | User | Update material |
| 14 | DELETE | `/api/materials/:id` | User | Delete material and resources |
| 15 | POST | `/api/ai/materials/:id/summarize` | User | Generate AI summary |
| 16 | POST | `/api/ai/materials/:id/flashcards` | User | Generate AI flashcards |
| 17 | POST | `/api/ai/materials/:id/quiz` | User | Generate AI quiz |
| 18 | POST | `/api/ai/quizzes/:quizId/submit` | User | Submit answers, get score |
| 19 | GET | `/api/ai/flashcards` | User | All flashcards |
| 20 | GET | `/api/ai/quizzes` | User | All quizzes |
| 21 | POST | `/api/ai/study-plan` | User | Generate study plan |
| 22 | GET | `/api/ai/study-plan` | User | All study plans |
| 23 | DELETE | `/api/ai/study-plan/:id` | User | Delete a study plan |
| 24 | GET | `/api/admin/stats` | Admin | System statistics + activity |
| 25 | GET | `/api/admin/users` | Admin | List all users |
| 26 | PUT | `/api/admin/users/:id/status` | Admin | Activate / deactivate |
| 27 | PUT | `/api/admin/users/:id/role` | Admin | Change role |
| 28 | DELETE | `/api/admin/users/:id` | Admin | Delete user and data |

---

## 12. Testing

The backend was verified end-to-end against a real MongoDB instance using an automated HTTP test suite.
**61 assertions were executed and all passed.**

### Suite 1 — Core API (48 checks)

| Area | Checks | Result |
|---|---|---|
| Health & DB | Health endpoint, connection status | Pass |
| Registration | Success, duplicate email, short password, no password leak | Pass |
| Authentication | Login, wrong password, `/me`, logout | Pass |
| Authorization | Anonymous → 401, deactivated user → 403, student → admin route = 403 | Pass |
| Passwords | Change password, old password invalid, new password valid | Pass |
| Materials | Create (text), short content rejected, list, search, subjects, get, update, delete | Pass |
| AI Summary | Generation, key points present | Pass |
| AI Flashcards | 8 cards generated, all with question and answer | Pass |
| AI Quiz | 4 options per question, `correctAnswer` always matches an option | Pass |
| Quiz Scoring | 100% with correct answers, 0% with wrong answers | Pass |
| Study Plan | 7 daily tasks, past exam date rejected, list, delete | Pass |
| Administration | Stats, activity log, status toggle, role change, self-protection, cascade delete | Pass |
| Errors | Unknown route → 404 JSON | Pass |

### Suite 2 — Uploads, Static Serving and Security (13 checks)

| Check | Result |
|---|---|
| `.txt` upload stored with original name | Pass |
| Uploaded file physically written to `server/uploads` | Pass |
| Missing title falls back to the file name | Pass |
| Executable file rejected with a friendly message | Pass |
| Oversize file rejected, size limit stated in the error | Pass |
| AI generation works on uploaded file content | Pass |
| Deleting a material removes its file from disk | Pass |
| Server serves the built React client at `/` | Pass |
| SPA fallback serves `index.html` for `/dashboard` | Pass |
| API remains reachable alongside static files | Pass |
| Helmet security headers present | Pass |
| File type and size limits enforced from `MAX_FILE_SIZE_MB` | Pass |

### Frontend

The production build completes cleanly: **104 modules transformed**, producing 30.94 kB of CSS
(5.69 kB gzipped) and 294.13 kB of JavaScript (90.10 kB gzipped).

### Defects Found and Fixed During Testing

| Defect | Root cause | Resolution |
|---|---|---|
| Quiz generation hung indefinitely | The demo engine's padding loop reused an identical question string, so the dedup set rejected every iteration and the loop never advanced | Regenerated the padding questions with unique identifiers and added a bounded guard |
| Flashcards could contain duplicate padding cards | The same padding loop re-used keyword indices without a bound | Added a bounded guard counter |
| Uploaded files were not deleted with their material | The delete handler matched the stored file against the *original* filename, but files are stored under a unique generated name | Persisted `storedFileName` on the Material document and delete that exact path |
| Duplicate Mongoose index warnings | `index: true` and `schema.index()` both declared on `materialId` | Removed the redundant `schema.index()` declarations |

---

## 13. Deployment

The application is deployed as a **single free service on Render**, using the `render.yaml` blueprint
included in the repository.

### Deployment Configuration

```yaml
services:
  - type: web
    name: ai-study-buddy
    runtime: node
    plan: free
    buildCommand: npm run install:all && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_VERSION
        value: "22"
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: GEMINI_API_KEY
        sync: false
```

### Deployment Steps

1. Push the repository to GitHub.
2. In Render, choose **New → Blueprint** and select the repository.
3. Render reads `render.yaml`, creates the free web service, and builds the application.
4. Set `MONGO_URI` (MongoDB Atlas) and optionally `GEMINI_API_KEY` in the environment variables.
5. `JWT_SECRET` is generated automatically by Render.
6. The application is available at `https://ai-study-buddy.onrender.com`, with a health endpoint at
   `/api/health`.

### Supporting Free Services

| Service | Tier | Purpose |
|---|---|---|
| Render | Free web service | Hosts the Express API and the React build |
| MongoDB Atlas | M0 (512 MB) | Cloud database |
| Google Gemini API | Free tier | AI content generation |

### Deployment Considerations

- **Cold starts:** Free Render services sleep after 15 minutes of inactivity, so the first request
  after a sleep may take 30–60 seconds. The service is warmed up before demonstrations.
- **Ephemeral filesystem:** Uploaded files are cleared on redeploy. Material *text* is persisted in
  MongoDB, so all generated AI resources survive. Permanent object storage can be added by swapping the
  storage engine in `server/src/middleware/upload.js`.
- **Graceful AI degradation:** If the Gemini quota is exhausted or the key is missing, the Offline Demo
  Engine continues to serve every AI endpoint, so the application is never non-functional.

---

## 14. Conclusion

By integrating artificial intelligence with a secure backend architecture, AI StudyBuddy significantly
improves the learning experience for students. Manual preparation time is reduced through automated
content generation, allowing students to focus more on understanding concepts rather than organizing
study materials.

The implementation of JWT authentication, MongoDB data management, and Google Gemini AI integration
ensures that educational resources are generated securely, efficiently, and consistently. The modular
backend architecture further supports future enhancements, enabling additional AI-powered learning
capabilities to be integrated with minimal architectural changes.

As a result, AI StudyBuddy serves as a scalable and intelligent educational platform that enhances
productivity, promotes effective revision, and supports personalized learning for students preparing for
academic examinations and competitive assessments.

### Key Learnings

- Designing a modular RESTful API following the MVC pattern
- Securing an application with JWT, bcrypt password hashing, and role-based access control
- Integrating a Generative AI model and engineering reliable JSON-structured output
- Designing a graceful AI fallback so a system never becomes non-functional
- Modelling relational data in MongoDB using Mongoose schemas with referential integrity
- Building a responsive React single-page application with Tailwind CSS
- Deploying a full-stack application on free cloud infrastructure

---

## 15. References

1. Node.js Documentation — https://nodejs.org/en/docs
2. Express.js Guide — https://expressjs.com/en/guide/routing.html
3. Mongoose Documentation — https://mongoosejs.com/docs
4. MongoDB Atlas Documentation — https://www.mongodb.com/docs/atlas/
5. Google Gemini API Documentation — https://ai.google.dev/gemini-api/docs
6. JSON Web Token (RFC 7519) — https://jwt.io
7. React Documentation — https://react.dev
8. Vite Guide — https://vite.dev/guide/
9. Tailwind CSS Documentation — https://tailwindcss.com/docs
10. Render Documentation — https://docs.render.com
11. OWASP Cheat Sheets — https://cheatsheetseries.owasp.org

---

**Submitted by:** Hasim Rizvi
**B.Sc. Computer Science — 3rd Year**
**Mohamed Sathak College of Arts and Science**
**Repository:** https://github.com/HasimRizvi/Ai-Study-Buddy
