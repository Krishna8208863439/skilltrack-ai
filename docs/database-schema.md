# SkillTrack AI — Database Schema Documentation
**Database:** PostgreSQL 16 | **ORM:** Prisma | **Hackathon:** SIH 2026 PS-26135

---

## 1. Schema Entity Relationship Overview

The schema is organized into 6 core domains:
1. **User Identity & Access Control:** `users`, `consents`, `audit_logs`, `notifications`
2. **Candidate Domain:** `candidate_profiles`, `education_records`, `experiences`, `certifications`, `resumes`, `candidate_skills`
3. **Skill Taxonomy & Gap Analysis:** `skills`, `skill_gap_results`, `_MatchedSkills`, `_MissingSkills`
4. **Employer & Job Pipeline:** `employer_profiles`, `jobs`, `job_required_skills`, `job_applications`, `application_status_history`, `interviews`, `placement_records`, `employment_outcomes`
5. **Institute & Training Domain:** `institute_profiles`, `training_programs`, `enrollments`
6. **Course Recommendation Domain:** `courses`, `course_skills`, `course_enrollments`, `course_recommendations`

---

## 2. Enums Reference

| Enum Name | Values | Purpose |
|---|---|---|
| `Role` | `CANDIDATE`, `INSTITUTE`, `EMPLOYER`, `ADMIN` | Role-based authorization |
| `ProficiencyLevel` | `BEGINNER` (1), `ELEMENTARY` (2), `INTERMEDIATE` (3), `ADVANCED` (4), `EXPERT` (5) | Standardized skill depth |
| `SkillCategory` | `TECHNICAL`, `SOFT`, `DOMAIN`, `TOOL`, `LANGUAGE`, `FRAMEWORK`, `DATABASE`, `CLOUD`, `OTHER` | Taxonomy classification |
| `SkillSource` | `SELF_REPORTED`, `RESUME_EXTRACTED`, `ASSESSMENT`, `COURSE_COMPLETED`, `EMPLOYER_VERIFIED`, `INSTITUTE_VERIFIED` | Skill provenance tracking |
| `JobType` | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`, `FREELANCE` | Job engagement type |
| `WorkMode` | `ONSITE`, `REMOTE`, `HYBRID` | Location flexibility |
| `SkillImportance` | `REQUIRED`, `PREFERRED`, `NICE_TO_HAVE` | Job requirement weighting |
| `ApplicationStatus` | `APPLIED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `INTERVIEWED`, `OFFERED`, `ACCEPTED`, `REJECTED`, `WITHDRAWN` | Candidate application status lifecycle |
| `InterviewStatus` | `SCHEDULED`, `COMPLETED`, `CANCELLED`, `RESCHEDULED`, `NO_SHOW` | Interview round tracking |
| `PlacementStatus` | `IN_TRAINING`, `LOOKING_FOR_JOB`, `INTERVIEWING`, `OFFER_RECEIVED`, `PLACED`, `HIGHER_EDUCATION`, `OPTED_OUT` | Candidate aggregate placement status |
| `VerificationStatus`| `SELF_REPORTED`, `EMPLOYER_VERIFIED`, `INSTITUTE_VERIFIED`, `ADMIN_VERIFIED` | Truthfulness & verification level |
| `ProgramStatus` | `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED` | Institute cohort lifecycle |
| `EnrollmentStatus`| `APPLIED`, `ENROLLED`, `IN_PROGRESS`, `COMPLETED`, `DROPPED`, `CERTIFIED` | Training milestone progression |
| `AuditAction` | `USER_LOGIN`, `USER_REGISTER`, `ROLE_CHANGE`, `CONSENT_GRANTED`, `CONSENT_REVOKED`, `RESUME_UPLOADED`, `SKILL_VERIFIED`, `JOB_CREATED`, `APPLICATION_SUBMITTED`, `INTERVIEW_SCHEDULED`, `PLACEMENT_RECORDED`, `OUTCOME_VERIFIED`, `REPORT_EXPORTED` | Complete compliance audit trail |

---

## 3. Key Table Definitions

### 3.1 `users`
Core authentication table with hashed credentials and role tagging.
- `id` (UUID, PK)
- `email` (String, Unique, Indexed)
- `passwordHash` (String, Bcrypt hash)
- `name` (String)
- `role` (Role enum, default: `CANDIDATE`)
- `isActive` (Boolean, default: true)
- `emailVerified` (Boolean, default: false)
- `createdAt`, `updatedAt`, `lastLoginAt`

### 3.2 `consents`
Data privacy and granular GDPR/DPDP-compliant permission management.
- `id` (UUID, PK)
- `userId` (FK -> `users.id`)
- `shareProfileWithEmployers` (Boolean, default: true)
- `shareResumeWithEmployers` (Boolean, default: true)
- `shareAcademicRecords` (Boolean, default: true)
- `allowPlacementTracking` (Boolean, default: true)
- `updatedAt`

### 3.3 `candidate_skills`
Candidate skills with verifiable provenance and 1-5 proficiency.
- `id` (UUID, PK)
- `candidateProfileId` (FK -> `candidate_profiles.id`)
- `skillId` (FK -> `skills.id`)
- `proficiencyLevel` (ProficiencyLevel enum)
- `yearsOfExperience` (Float, default: 0)
- `source` (SkillSource enum)
- `isVerified` (Boolean, default: false)
- `verifiedBy` (String?)

### 3.4 `application_status_history`
Full audit trail of every status transition in a job application.
- `id` (UUID, PK)
- `applicationId` (FK -> `job_applications.id`)
- `fromStatus` (ApplicationStatus?)
- `toStatus` (ApplicationStatus)
- `notes` (String?)
- `changedById` (String?)
- `changedAt` (DateTime, default: now)

### 3.5 `employment_outcomes`
Verified placement outcome recording for institutes and government administrators.
- `id` (UUID, PK)
- `applicationId` (FK -> `job_applications.id`, Unique)
- `candidateId` (String, Indexed)
- `employerId` (String, Indexed)
- `jobTitle` (String)
- `annualSalary` (Decimal?) — Private/Voluntary; only visible to candidate & aggregated for admins
- `offerDate` (DateTime)
- `joiningDate` (DateTime?)
- `verificationStatus` (VerificationStatus enum)
- `verifiedAt` (DateTime?)
- `verifiedById` (String?)
- `offerLetterUrl` (String?)
