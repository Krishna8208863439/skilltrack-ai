# SkillTrack AI

**Smart India Hackathon 2026 — Problem Statement ID: 26135**
**Theme: Skill Development & Employment | Team: Code Warriors**

An AI-powered, full-stack platform that bridges the skill gap between India's workforce, vocational institutes, and employers — with explainable AI, consent-first data privacy (DPDP), and verified employment outcome tracking.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Credentials](#demo-credentials)
- [API Reference](#api-reference)
- [Screenshots](#screenshots)
- [Team](#team)

---

## Overview

SkillTrack AI addresses the critical disconnect between skill supply and demand in India's job market. The platform provides:

- **Candidates** — AI resume parsing, skill gap analysis, personalised job & course recommendations, and placement tracking
- **Institutes** — Cohort management, student placement analytics, and outcome verification
- **Employers** — Consent-based talent search, application pipeline management, and skill-matched candidate discovery
- **Administrators** — National employment intelligence dashboard, audit logs, and CSV export for governance reporting

---

## Features

| Feature | Description |
|---|---|
| AI Resume Parser | Extracts skills from PDF/DOCX resumes using NLP + taxonomy matching |
| Skill Gap Analysis | Weighted deterministic scoring against job requirements |
| Job Matching | TF-IDF semantic matching with skill overlap scoring |
| Course Recommender | Gap-coverage ranked course suggestions |
| Placement Tracking | End-to-end application pipeline with interview scheduling |
| Notification System | Real-time bell dropdown + full notifications page with filters |
| Admin Dashboard | National KPIs, institute performance table, compliance audit logs, CSV export |
| DPDP Consent | Candidate consent model — data shared only with verified institutes/employers |
| Role-Based Access | Candidate / Institute / Employer / Admin with route-level guards |

---

## Tech Stack

### Frontend
| Technology | Version |
|---|---|
| React | 18.3 |
| TypeScript | 5.5 |
| Vite | 5.4 |
| Tailwind CSS | 3.4 |
| React Router | 6.26 |
| Recharts | 2.12 |
| Axios | 1.7 |

### Backend
| Technology | Version |
|---|---|
| Node.js | ≥ 18 |
| Express | 4.21 |
| Prisma ORM | 5.22 |
| PostgreSQL | 16 |
| JSON Web Tokens | 9.0 |
| Zod | 3.23 |

### AI / ML Service
| Technology | Version |
|---|---|
| Python | 3.11+ |
| FastAPI | 0.111+ |
| scikit-learn | 1.5+ |
| PyMuPDF | 1.28+ |
| python-docx | 1.1+ |
| uvicorn | 0.30+ |

---

## Project Structure

```
skilltrack-ai/
├── frontend/               # React + TypeScript + Vite
│   └── src/
│       ├── pages/          # All page components
│       ├── components/     # Shared layout (Navbar, Sidebar, DashboardLayout)
│       ├── context/        # AuthContext
│       └── services/       # Axios API client
│
├── backend/                # Express.js REST API
│   ├── src/
│   │   ├── routes/         # auth, candidate, jobs, courses, notifications, admin …
│   │   ├── middleware/     # JWT auth, role guard
│   │   └── services/       # In-memory store, AI service proxy
│   └── prisma/             # Schema, migrations, seed data
│
├── ai-service/             # Python FastAPI ML service
│   ├── src/main.py         # All AI endpoints
│   └── data/               # Skill taxonomy JSON
│
├── docker/                 # Dockerfiles + nginx config
├── docker-compose.yml      # Full stack orchestration
└── docs/                   # Architecture, DB schema, scoring formula
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Python 3.11+
- PostgreSQL 16

### 1. Clone the repository

```bash
git clone https://github.com/Krishna8208863439/skilltrack-ai.git
cd skilltrack-ai
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env        # fill in your DATABASE_URL and JWT_SECRET
npm install
npx prisma db push
node prisma/seed.js
npm run dev                 # runs on http://localhost:5000
```

### 3. AI Service setup

```bash
cd ai-service
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
# runs on http://localhost:8000
```

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev                 # runs on http://localhost:5173
```

### Docker (all services at once)

```bash
docker-compose up --build
# Frontend → http://localhost
# Backend  → http://localhost:5000
# AI       → http://localhost:8000
```

---

## Environment Variables

### `backend/.env`

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/skilltrack_ai?schema=public
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### `ai-service/.env`

```env
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/skilltrack_ai
BACKEND_URL=http://localhost:5000
```

---

## Demo Credentials

> Seeded automatically by `node prisma/seed.js`

| Role | Email | Password |
|---|---|---|
| Candidate | `priya.sharma@demo.com` | `Candidate@123` |
| Candidate | `rahul.kumar@demo.com` | `Candidate@123` |
| Employer | `hr@techcorp.demo.com` | `Employer@123` |
| Institute | `admin@nsdc.demo.com` | `Institute@123` |
| **Admin** | `krishna@gmail.com` | `Sgi@5555` |

> **Admin access is restricted to `krishna@gmail.com` only** — no other account can access the admin dashboard regardless of role.

---

## API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login and receive JWT |
| POST | `/auth/register` | Register new account |
| GET | `/candidate/profile` | Get candidate profile |
| GET | `/jobs` | List all active jobs |
| POST | `/skill-gap/analyze` | Run skill gap analysis |
| GET | `/courses` | List courses |
| GET | `/tracking/pipeline` | Application pipeline |
| GET | `/notifications` | List notifications |
| PATCH | `/notifications/:id/read` | Mark notification as read |
| PATCH | `/notifications/mark-all-read` | Mark all as read |
| DELETE | `/notifications/:id` | Delete notification |
| GET | `/admin/stats` | National KPI statistics |
| GET | `/admin/export-csv` | Download employment report |
| GET | `/api/health` | Service health check |

**AI Service** — Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/parse-resume-file` | Parse PDF/DOCX resume |
| POST | `/api/ai/extract-skills` | Extract skills from text |
| POST | `/api/ai/skill-gap` | Calculate skill gap score |
| POST | `/api/ai/match-jobs` | Semantic job matching |
| POST | `/api/ai/recommend-courses` | Course recommendations |
| GET | `/health` | AI service health check |
| GET | `/docs` | Interactive Swagger UI |

---

## Screenshots

| Page | Description |
|---|---|
| Landing Page | Platform overview with role-based CTAs |
| Login / Register | Two-column responsive layout with role selector |
| Candidate Dashboard | KPI cards, skill overview, top job matches |
| Skill Gap Analysis | Weighted gap scoring with missing skills breakdown |
| Job Recommendations | AI-matched jobs with score breakdown |
| Notifications | Bell dropdown + full-page with filters |
| Admin Dashboard | National KPIs, institute table, audit logs |

---

## Team

**Team Code Warriors** — Smart India Hackathon 2026

Built for **Problem Statement ID: 26135**
Ministry of Skill Development & Higher Education

---

## License

This project was built for Smart India Hackathon 2026 (SIH 2026). All rights reserved by Team Code Warriors.
