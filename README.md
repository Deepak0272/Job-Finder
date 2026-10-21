# 🚀 AI Job Finder & Career Assistant

> A modern, responsive, full-stack web application designed to help students, graduates, and professionals discover career opportunities matched to their exact technical competencies, certifications, and preferred locations.

---

## 🌟 Key Features

1. **User Authentication & Profiles (JWT & bcrypt)**:
   - Secure registration, login, and token-based session handling.
   - Profile management with headline, technical skills tag manager, education history, work experience, and preferred location.
   - Instant PDF resume upload with automated competency extraction.

2. **Job Search Dashboard**:
   - Live search bar by job titles, keywords, and technical skills (e.g. *CCNA*, *Linux*, *React*).
   - Multi-attribute filters: Categories, Remote/Workplace model (Remote, Hybrid, On-site), Experience Level, Job Type, and Salary threshold.
   - Clean, responsive job cards showing company logos, salary ranges, verified sources, and posting dates.
   - Pagination controls and sorting (Newest, Highest Salary, Title).

3. **AI Job Matching Engine**:
   - Neural skill compatibility score calculated from **0% to 100%**.
   - Distinct breakdown of **Matching Skills** (green) and **Missing Prerequisites** (amber) for every job.
   - Supports **OpenAI GPT-4o-mini** with an intelligent built-in heuristic matching engine when no API key is supplied.
   - Tailored **Career Certification Roadmaps** (CompTIA Network+, Cisco CCNA, CompTIA Security+, AWS Solutions Architect).

4. **Saved Jobs**:
   - Bookmark any job with single-click save/remove toggles.
   - Compound unique database constraints preventing duplicate bookmarks.
   - Dedicated Saved Jobs portal with quick Apply links.

5. **Interactive Application Tracker**:
   - Visual Kanban pipeline with 5 stages: `Interested` ➔ `Applied` ➔ `Interview` ➔ `Offer` ➔ `Rejected`.
   - Add personal notes, log dates, record salary offers, and move stages dynamically.
   - Toggle between **Kanban Board** and **Compact Table View**.

6. **Protected Administrator Dashboard**:
   - Role-based route guard (`adminOnly`).
   - System telemetry metrics (Total registered users, active jobs, submitted applications, saved jobs).
   - Full CRUD management for job listings with interactive Job Creator Modal.
   - Registered users directory with role promotion/demotion capabilities.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router v6 |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB with Mongoose + Embedded LocalStore fallback |
| **Authentication**| JWT (JSON Web Tokens) & bcryptjs |
| **Resume Parser** | Multer & pdf-parse |
| **AI Matching** | OpenAI API (`gpt-4o-mini`) + Built-in Heuristic NLP Matching Engine |
| **Job Data** | Verified Direct Database Listings + Remotive Verified Remote API |

---

## 📂 Project Structure

```
job-finder/
├── backend/
│   ├── config/             # Database connection & embedded store
│   ├── controllers/        # Auth, Job, AI, SavedJobs, Application, Admin
│   ├── middleware/         # JWT auth, upload (multer PDF), error handler
│   ├── models/             # User, Job, SavedJob, Application, DataBridge
│   ├── routes/             # Express API routes
│   ├── services/           # AI parser, external Remotive API service
│   ├── data/               # Persistent embedded datastore (store.json)
│   ├── seed.js             # Demo data population script
│   ├── server.js           # Express application entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # JobCard, JobFilters, Navbar, Sidebar, Modals
│   │   ├── context/        # AuthContext, ToastContext
│   │   ├── layouts/        # MainLayout with collapsible sidebar
│   │   ├── pages/          # 10 full-featured application pages
│   │   ├── services/       # Frontend API clients (Axios)
│   │   ├── App.jsx         # Router & provider hierarchy
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── package.json            # Root orchestration script
├── .env.example            # Environment template
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation

Clone or open the repository folder, then install dependencies for both frontend and backend:

```bash
# Option A: Install both with single root command
npm run install-all

# Option B: Install individually
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Setup

Copy `.env.example` into `backend/.env`:

```bash
cp .env.example backend/.env
```

*(Note: The application includes an automated, zero-setup embedded datastore and built-in AI matcher out of the box. You do NOT need external MongoDB or OpenAI credentials to test all features immediately!)*

### 4. Seed Demo Data

Run the database seeder to populate realistic jobs across IT Support, Network Engineering, Software Development, Cyber Security, and Data Analysis:

```bash
npm run seed
```

### 5. Running Locally

Open two terminal windows:

**Terminal 1 (Backend API on http://localhost:5000):**
```bash
cd backend
npm run dev
# or: node server.js
```

**Terminal 2 (Frontend Client on http://localhost:3000):**
```bash
cd frontend
npm run dev
```

Visit **http://localhost:3000** in your web browser!

---

## 🔑 Pre-seeded Demo Credentials

You can sign in using the 1-click quick login buttons on the login page, or manually:

| Account Type | Email Address | Password | Profile Highlights |
| :--- | :--- | :--- | :--- |
| **Demo Job Seeker** | `seeker@jobfinder.ai` | `Seeker@123456` | Skills: *CCNA*, *Linux*, *Desktop Support*, *Active Directory*, *Networking* |
| **Administrator** | `admin@jobfinder.ai` | `Admin@123456` | Full Admin Dashboard, Job CRUD, User Directory |

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate user & return JWT token
- `GET /api/auth/me` - Retrieve authenticated user session (Protected)
- `PUT /api/auth/profile` - Update profile headline, skills, education, experience (Protected)

### Jobs (`/api/jobs`)
- `GET /api/jobs` - Search and filter jobs with pagination (`search`, `category`, `location`, `remoteType`, `minSalary`, etc.)
- `GET /api/jobs/:id` - Get full details of a specific job
- `POST /api/jobs` - Create a new job listing (Admin only)
- `PUT /api/jobs/:id` - Update job listing (Admin only)
- `DELETE /api/jobs/:id` - Delete job listing (Admin only)
- `GET /api/jobs/categories` - Fetch job categories and counts

### AI Engine (`/api/ai`)
- `POST /api/ai/analyze-resume` - Upload & parse PDF resume, extract technical skills (Protected)
- `POST /api/ai/match-jobs` - Score jobs against profile skills (0–100%) and return matching/missing breakdown (Protected)
- `POST /api/ai/skill-recommendations` - Return targeted certification roadmap (Protected)

### Saved Jobs (`/api/saved-jobs`)
- `GET /api/saved-jobs` - Get current user's bookmarked jobs (Protected)
- `POST /api/saved-jobs/:jobId` - Bookmark a job (Protected, duplicate-safe)
- `DELETE /api/saved-jobs/:jobId` - Remove job from bookmarks (Protected)

### Application Tracker (`/api/applications`)
- `GET /api/applications` - Fetch tracked applications (Protected)
- `POST /api/applications` - Track a new job application (Protected)
- `PUT /api/applications/:id` - Update status, notes, or salary offered (Protected)
- `DELETE /api/applications/:id` - Delete an application from pipeline (Protected)

### Admin Management (`/api/admin`)
- `GET /api/admin/stats` - System telemetry (User, Job, and Application counts) (Admin only)
- `GET /api/admin/users` - Directory of registered platform users (Admin only)
- `PUT /api/admin/users/:id/role` - Promote or change user role (Admin only)
- `DELETE /api/admin/users/:id` - Remove user account (Admin only)
