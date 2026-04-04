# TrustHire — Commitment-Driven Job Portal
## Complete Documentation

---

## Table of Contents
1. Introduction
2. Website Structure
3. Tech Stack
4. Logic
5. Conclusion

---

## 1. Introduction

### 1.1 Project Overview
TrustHire is a revolutionary job portal designed to solve the "noise" problem in modern recruitment, where recruiters are overwhelmed by AI-generated and low-intent applications. It introduces a **Commitment-Driven** model where candidates can signal their genuine interest by paying a refundable **Challenge Fee** for priority review.

The platform provides a dual-interface for Candidates and Recruiters. Candidates benefit from getting their profiles moved to the "Priority Pipeline," ensuring their commitment is noticed. Recruiters benefit from a curated list of high-intent candidates, reducing the time-to-hire and increasing the quality of applicants.

The unique selling point (USP) of TrustHire is its **Challenge Fee System**. When a candidate applies for a prioritized role, they pay a nominal fee which is held in escrow. If the candidate is hired or rejected after a review, the fee is automatically refunded. If the candidate misses a scheduled interview, the fee is forfeited to compensate the recruiter's time, creating a system built on mutual respect and genuine intent.

### 1.2 Objectives
1.  **Reduce Recruitment Noise**: Filter out low-intent applications through a commitment-based barrier.
2.  **Increase Candidate Visibility**: Provide a secondary "Priority" channel for serious job seekers.
3.  **Ensure Fair Play**: Protect recruiters' time by penalizing interview no-shows through fee forfeiture.
4.  **Automatic Financial Integrity**: Implement automated refund triggers for hired or rejected candidates.
5.  **Role-Specific Experiences**: Deliver tailored dashboards and workflows for both job seekers and hiring managers.
6.  **Secure Communication**: Maintain data privacy through verified OTP-based authentication and JWT security.
7.  **Real-Time Engagement**: Provide instant feedback via in-app notifications and email alerts.

### 1.3 Scope
**In-Scope:**
- Multi-role authentication (Candidate/Recruiter) with OTP verification.
- Job posting, editing, and closure workflows for recruiters.
- Advanced job search with filters for salary, experience, location, and commitment level.
- Priority application flow integrated with Razorpay for Challenge Fee processing.
- Automated status-based refund logic (Hired/Rejected).
- Built-in notification system and email delivery for all major lifecycle events.
- Candidate profile management and application tracking.

**Out-of-Scope:**
- Directly integrated video conferencing (uses external links).
- Direct Peer-to-Peer messaging (uses structured interview notes/status instead).
- Multi-currency support (standardized on INR).
- Mobile application (responsive web only).

---

## 2. Website Structure

### 2.1 Project Folder Structure
trusthire/
├── client/                     # Frontend React application
│   ├── public/                 # Static assets and robots.txt
│   ├── src/
│   │   ├── components/         # Atomic UI components and common layouts
│   │   ├── context/            # Global state management (AuthContext)
│   │   ├── layouts/            # Sidebar-based dashboard layouts
│   │   ├── pages/              # Main route views (Home, Jobs, Dashboards)
│   │   ├── services/           # Axios-based API service layer
│   │   ├── utils/              # Helper functions (Date formatting, Salary range)
│   │   └── App.tsx             # Main router and app container
├── server/                     # Backend Node.js application
│   ├── config/                 # DB (MongoDB) and Gateway (Razorpay) config
│   ├── controllers/            # Business logic handlers for API requests
│   ├── middlewares/            # JWT verification and Role-based access control
│   ├── models/                 # Mongoose schemas (User, Job, Application, etc.)
│   ├── routes/                 # Express route definitions
│   ├── services/               # Background modules (Email, Refund, Notification)
│   └── server.js               # Entry point and middleware setup

### 2.2 Frontend Pages

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| Home | / | Public | Professional landing page with platform overview and CTA. |
| Jobs Board | /jobs | Public | Searchable list of active job postings with filters. |
| Job Detail | /jobs/:id | Public | Comprehensive view of job requirements and "Apply" entry point. |
| Login | /login | Public | Split-view authentication portal for existing users. |
| Register | /register | Public | Multi-step role-selection and signup form. |
| Verify OTP | /verify-otp | Public | Secondary auth step for new accounts or password resets. |
| Forgot Password | /forgot-password | Public | Account recovery flow with OTP verification. |
| Candidate Dashboard | /dashboard | Candidate | High-level overview of applications and stats. |
| My Applications | /dashboard/applications | Candidate | Detailed tracking of application statuses and fee history. |
| Candidate Profile | /dashboard/profile | Candidate | Resume-like personal branding and skill management. |
| Recruiter Dashboard | /recruiter/dashboard | Recruiter | Analytics-focused overview of job posts and pipeline health. |
| Post Job | /recruiter/post-job | Recruiter | Configuration form for new roles including Challenge Fee setup. |
| Recruiter Pipeline | /recruiter/jobs/:id/applications | Recruiter | Management interface for individual application status updates. |
| Talent Pool | /recruiter/candidates | Recruiter | Unified view of all candidates who have applied to recruiter's jobs. |

### 2.3 Navigation Flow

**Public & Core Flow:**
```ascii
Home → Browse Jobs → Job Detail → Login/Register → Apply → Dashboard
Home → Login → Dashboard (Role Based)
Home → Register → Role Selection → Fields Info → Verify OTP → Dashboard
```

**Candidate Dashboard Flow:**
```ascii
[Dashboard] 
   ├── [Applications] → [App Detail/Payment]
   ├── [Notifications]
   ├── [Profile]
   └── [Settings]
```

**Recruiter Dashboard Flow:**
```ascii
[Dashboard]
   ├── [Post Job]
   ├── [My Postings] → [View Pipeline] → [Review/Interview/Hire/Reject]
   ├── [All Applications]
   ├── [Talent Discovery]
   └── [Settings]
```

### 2.4 Route Definitions
| Route | Component | Access Level |
|-------|-----------|--------------|
| / | Home | Public |
| /jobs | Jobs | Public |
| /login | Login | Public |
| /register | Register | Public |
| /dashboard | CandidateLayout | Candidate |
| /dashboard/applications/:id | ApplicationDetail | Candidate |
| /recruiter/dashboard | RecruiterLayout | Recruiter |
| /recruiter/post-job | PostJob | Recruiter |
| /recruiter/jobs/:id/applications | RecruiterApplications | Recruiter |

### 2.5 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Create new user account and trigger OTP. |
| POST | /api/auth/verify-otp | No | Confirm email ownership via 6-digit code. |
| POST | /api/auth/login | No | Authenticate user and return JWT token. |
| GET | /api/jobs | No | Fetch all active job listings with pagination/filter. |
| POST | /api/jobs | Recruiter | Create a new job posting. |
| POST | /api/applications/:jobId | Candidate | Submit application for a job. |
| GET | /api/applications/my | Candidate | Fetch user's own applications. |
| PUT | /api/applications/:id/status | Recruiter | Update status and trigger automated email/refunds. |
| POST | /api/payments/create-order | Candidate | Initialize Razorpay order for Challenge Fee. |
| POST | /api/payments/verify | Candidate | Confirm payment completion and upgrade priority. |
| GET | /api/notifications | Yes | Fetch user-specific alerts. |

### 2.6 Database Collections

**Users Collection:**
- `name` (String), `email` (String, Unique), `password` (String, Hashed), `role` (Enum: candidate/recruiter), `isVerified` (Boolean), `otp` (Object: code, expires), `candidateFields` (Nested object for profile data).

**Jobs Collection:**
- `title` (String), `company` (String), `postedBy` (Reference: Users), `challengeFeeAmount` (Number), `challengeFeeDays` (Number), `experienceRequired` (Object: min, max), `skills` (Array), `isActive` (Boolean).

**Applications Collection:**
- `job` (Reference: Jobs), `candidate` (Reference: Users), `status` (Enum: pending/shortlisted/rejected/hired/etc), `feePaid` (Boolean), `feeAmount` (Number), `paymentId` (String), `refundId` (String), `interview` (Object: date, time, mode).

**Notifications Collection:**
- `recipient` (Reference: Users), `type` (String), `title` (String), `message` (String), `isRead` (Boolean).

### 2.7 System Architecture
```ascii
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend   │──────│   Backend   │──────│  Database   │
│ React/Vite   │      │ Node/Express│      │  MongoDB    │
│ (Compact UI) │      │ (REST API)  │      │  Atlas      │
└─────────────┘      └──────┬──────┘      └─────────────┘
                            │
                   ┌────────┼────────┐
                   │        │        │
              ┌────▼──┐ ┌──▼────┐ ┌─▼───────┐
              │Razorpay│ │Gmail  │ │JWT Auth │
              │Payment │ │SMTP   │ │Middleware│
              └────────┘ └───────┘ └─────────┘
```

---

## 3. Tech Stack

### 3.1 Technology Overview

| Layer | Technology | Version | Purpose | Why Chosen |
|-------|-----------|---------|---------|------------|
| Frontend | React | 18.x | UI Library | Speed and rich component ecosystem. |
| Styling | Tailwind CSS | 3.x | Design | Rapid, utility-first UI development. |
| Backend | Node.js | 18/20.x | Runtime | JavaScript consistency across stack. |
| Server | Express | 5.x | Web App Framework | Lightweight and extensive middleware. |
| Database | MongoDB | 7.x | NoSQL DB | Flexible schema for diverse job/profile data. |
| Security | JWT | 9.x | Session Mgmt | Scalable, stateless authentication. |
| Payments | Razorpay | 2.x | Transactions | Industry standard for secure INR payments. |
| Email | Nodemailer | 6.x | Communication | Robust SMTP handling for critical alerts. |

### 3.2 Frontend Dependencies
- **react-router-dom**: Internal routing and page navigation.
- **lucide-react**: Premium, consistent icon set.
- **axios**: Promise-based HTTP client for API interaction.
- **react-hot-toast**: Micro-animations for feedback notifications.
- **date-fns**: Time-ago and scheduling date processing.

### 3.3 Backend Dependencies
- **mongoose**: Object Data Modeling (ODM) for MongoDB.
- **bcryptjs**: Secure password hashing.
- **cors**: Cross-Origin Resource Sharing enablement.
- **node-cron**: Automated tasks for refund timeout checks.
- **dotenv**: Environment-specific configuration management.

### 3.4 Environment Variables

| Variable | Used In | Purpose |
|----------|---------|---------|
| PORT | server.js | Defines the backend port (Default: 5000). |
| MONGO_URI | config/db.js | Connection string for MongoDB Atlas. |
| JWT_SECRET | middleware/auth.js | Private key for signing access tokens. |
| EMAIL_USER | services/emailService.js | Gmail address for system alerts. |
| EMAIL_PASS | services/emailService.js | Google App Password for SMTP auth. |
| RAZORPAY_KEY_ID | controllers/paymentCtrl | Public key for gateway identity. |
| RAZORPAY_KEY_SECRET | controllers/paymentCtrl | Private key for signature verification. |
| CLIENT_URL | server.js | CORS whitelist for frontend origin. |

---

## 4. Logic

### 4.1 Registration Flow
1. User chooses account type (Recruiter or Candidate).
2. Form collects shared data (Email, Password) and role-specific data.
3. Backend validates email is not in use.
4. Password is salted and hashed (Bcrypt).
5. 6-digit numeric OTP is generated and stored with a timestamp.
6. Nodemailer triggers an HTML-formatted onboarding email with the OTP.
7. Account is created in `isVerified: false` state.
8. Verification page captures user input and confirms code against DB.
9. Successful match sets `isVerified: true` and activates account.

### 4.2 Login Flow
1. User provides credentials.
2. System identifies the user record and checks verification status.
3. Password verified using `bcrypt.compare`.
4. A JWT payload (User ID, Role) is signed using the `JWT_SECRET`.
5. Frontend receives token and user profile, persisting token in `localStorage`.
6. Private routes are unlocked based on the token presence and role payload.

### 4.3 Forgot Password Flow
1. **Initiate**: User submits email; system generates a reset-specific OTP.
2. **Verify**: User enters OTP; system sets `resetVerified: true` on user record.
3. **Reset**: User provides a new password; system updates DB and clears reset flags.

### 4.4 Job Posting Flow (Recruiter)
1. Recruiter fills a dense, single-viewport form.
2. Form handles automated validation for salary/experience ranges (min <= max).
3. Recruiter configures the "Priority Shield" (Challenge Fee) if desired.
4. Backend verifies Recruiter authorization.
5. Job object created with status `isActive: true`.
6. Job becomes instantly searchable on the main jobs board.

### 4.5 Job Application Flow (Free)
1. Candidate views detail → enters cover letter → confirms.
2. Backend creates `Application` with `isPriority: false` and `feePaid: false`.
3. Recruiter's "applicationCount" incremented.
4. "Standard" notification dispatched to recruiter.

### 4.6 Job Application Flow (With Fee)
1. Candidate clicks "Pay & Apply" on a fee-enabled role.
2. System creates a backend application record first.
3. Backend calls Razorpay API to generate a unique `order_id`.
4. Frontend launches Razorpay Checkout overlay.
5. Upon successful payment, Razorpay returns a cryptographic signature.
6. Backend verifies the signature with `crypto.createHmac`.
7. Application record upgraded: `feePaid: true`, `isPriority: true`.
8. Recruiter receives a "Priority Application" alert.

### 4.7 Application Status Workflow
```ascii
[Pending]──►[Reviewed]──┬──►[Shortlisted]──►[Interview]──►[Hired]
                        └──►[Rejected]
```
Transitions:
- **Move to Rejected**: Triggered manually by recruiter; auto-initiates Razorpay Refund if fee was paid.
- **Move to Hired**: Auto-initiates Razorpay Refund (Reward for successful recruitment).
- **Interview Scheduled**: Recruiter chooses date/time; system sends Calendar Invite style email.

### 4.8 Payment Integration & Refund Logic
TrustHire treats the Challenge Fee as a security deposit.
- **Escrow**: Fees are recorded in the `Transaction` collection.
- **Auto-Refund**: If a recruiter clicks "Reject" or "Hire", the system calls `razorpay.payments.refund()`.
- **Forfeiture**: If a recruiter marks an interview as "No Show", the application status becomes `fee_forfeited` and no refund is processed.

### 4.9 Notification System Logic
Notifications are event-driven within the controllers.
- A new document is added to the `Notifications` collection.
- Recipient is specific (e.g., Job Poster).
- The `Navbar` component polls or updates unread count on mount.
- Statuses like `application_received` vs `status_updated` allow icon differentiating.

### 4.10 Filter and Search Logic
- **Search**: Case-insensitive regex match against Title, Company, or Description.
- **Filters**: Aggregated Mongo query (`$match` with `$and`) for Location, Type, Salary, and Experience.
- **Dynamic Updates**: Result count updates instantly as filters are applied via debounced API calls.

### 4.11 Email System Logic
Powered by Nodemailer with custom HTML templates.
- **Onboarding**: Welcome + OTP.
- **Notification Mirrors**: Emails sent when shortlisted, rejected, or scheduled.
- **Receipts**: Automated email after successful Challenge Fee payment and after Refund processing.

---

## 5. Conclusion

### 5.1 Summary
TrustHire successfully bridges the trust gap in digital recruitment. By combining secure fintech (Razorpay) with commitment-based logic, it ensures that high-intent candidates rise to the top while recruiters regain their productivity.

### 5.2 Future Enhancements
- **Multi-Resume Support**: Allow candidates to store and pick different resumes for different roles.
- **Auto-Matching**: Suggest jobs based on candidate skill-match scores.
- **Bulk Hire**: Support recruiters in managing massive hiring drives with bulk status updates.
- **Analytics Dashboard**: Provide candidates with insights on their application performance vs the pool.

### 5.3 References
- React.js, Node.js, Express, and MongoDB Documentation.
- Razorpay API Reference.
- Lucide Icon Set.
- Tailwind CSS Style Documentation.
