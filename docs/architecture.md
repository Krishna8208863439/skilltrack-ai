# SkillTrack AI — System Architecture
**Smart India Hackathon 2026 | Problem Statement ID: 26135**  
**Theme:** Skill Development / Employment | **Team:** Code Warriors

---

## 1. High-Level System Architecture

SkillTrack AI is structured as a scalable, modern micro-monorepo comprised of four primary tiers:

```mermaid
graph TD
    User([End Users: Candidate, Institute, Employer, Admin]) -->|HTTPS / REST| NGINX[Reverse Proxy / Ingress :80]
    NGINX -->|/| Frontend[Vite + React 18 + TS + Tailwind :5173]
    NGINX -->|/api/*| Backend[Node.js + Express + Prisma ORM :5000]
    NGINX -->|/ai/*| AIService[Python FastAPI + scikit-learn + spaCy :8000]

    Backend -->|Internal REST| AIService
    Backend -->|PostgreSQL Wire Protocol| DB[(PostgreSQL 16 Database)]
    Backend -->|File Storage| LocalDisk[(Encrypted Safe Uploads Volume)]
```

---

## 2. Component Breakdown

### 2.1 Frontend (`/frontend`)
- **Framework:** React 18 with TypeScript and Vite bundler
- **Styling:** Tailwind CSS with Government-Ready SaaS design system (Deep Navy `#0b132b`, Brand Blue `#0c87eb`, Slate neutral tones)
- **Routing:** React Router v6 with strict Role-Based Access Control (RBAC) guards
- **Visualizations:** Recharts for Skill-Gap Radar charts, Demand trends, and Conversion funnel analytics
- **State & Networking:** Context API + Axios with automatic JWT bearer token interceptors & refresh handlers

### 2.2 Backend (`/backend`)
- **Runtime:** Node.js 20 LTS with Express.js REST APIs
- **ORM & Data Layer:** Prisma ORM connecting to PostgreSQL
- **Security & Middleware:**
  - `helmet` security headers
  - `cors` origin whitelisting
  - `express-rate-limit` DDoS and brute-force mitigation
  - `bcryptjs` password hashing (cost factor 12)
  - `jsonwebtoken` for stateless, signed access & refresh tokens
  - `zod` schema-based request validation
  - Centralized audit logging middleware

### 2.3 AI / ML Service (`/ai-service`)
- **Runtime:** Python 3.11 with FastAPI and Uvicorn
- **NLP & Parsing:** `spaCy` NLP with custom entity ruler and phrase matcher for multi-word skill taxonomy extraction (`pdfplumber` & `python-docx` for parsing)
- **Matching & Similarity:**
  - Hybrid matching engine: Rule-based skill overlap with proficiency weights (transparent and explainable)
  - TF-IDF Vectorization with Cosine Similarity for semantic context matching between candidate resumes and job role specifications
- **Recommendation Engines:**
  - Job Matcher with per-factor explanation (Skill overlap 50%, Experience fit 20%, Qualification 15%, Location/Preferences 15%)
  - Course Matcher addressing detected missing skill gaps ranked by impact and duration fit

### 2.4 Database (`/backend/prisma`)
- **Database Engine:** PostgreSQL 16
- **Schema Management:** Prisma Schema (`schema.prisma`) with declarative migrations
- **Integrity & Constraints:**
  - Foreign key cascades and set null safeguards
  - Custom Enums for strict status state-machines
  - Composite unique indexes preventing duplicate enrollments or applications
  - Status history logging for the entire placement lifecycle

---

## 3. End-to-End Workflow Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor C as Candidate
    participant FE as Frontend
    participant BE as Backend
    participant AI as AI Service
    participant DB as PostgreSQL
    actor E as Employer
    actor I as Institute

    C->>FE: Upload Resume (PDF/DOCX)
    FE->>BE: POST /api/resumes/upload
    BE->>AI: POST /parse-resume
    AI-->>BE: Extracted Skills & Experience
    BE-->>FE: Return Proposed Profile Data
    C->>FE: Review, Edit & Confirm Extractions
    FE->>BE: PUT /api/candidate/profile (Persist verified skills)
    
    C->>FE: Select Target Job Role
    FE->>BE: POST /api/skill-gap/analyze
    BE->>AI: POST /skill-gap
    AI-->>BE: Match Score, Radar Gap Matrix, Missing Skills
    BE-->>FE: Render Interactive Radar Chart & Explanations

    FE->>BE: GET /api/courses/recommendations
    BE-->>FE: Recommended Courses mapped to missing skills
    C->>FE: Enroll in Training Program
    I->>BE: Verify Course Completion
    BE->>DB: Upgrade Candidate Verified Skill Level

    C->>FE: Apply to Matched Job
    FE->>BE: POST /api/applications/apply
    BE->>DB: Log Application Status (APPLIED)
    E->>FE: Shortlist Candidate & Schedule Interview
    FE->>BE: POST /api/interviews/schedule
    E->>FE: Mark Candidate as HIRED
    BE->>DB: Record Verified Placement & Employment Outcome
```
