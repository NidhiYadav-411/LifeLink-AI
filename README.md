# LifeLink AI — Intelligent Blood Donation & Emergency Response Platform

LifeLink AI is a full-stack emergency blood network application connecting voluntary donors, patients in critical need, and verified healthcare facilities in real-time. It features component-specific compatibility matching, multi-stage geographic radius expansion, role-based authorization workflows, and live request tracking.

---

## 1. Visual Design & Theme

LifeLink AI is styled with a healthcare-grade aesthetic based on the coral-red and white design system:
- **Primary Coral Red**: `#E0443A`
- **Hover Coral Red**: `#C9322B`
- **Background**: `#FFFFFF`
- **Soft Pink Surface**: `#FCE9E7`
- **Light Border**: `#F2C7C3`
- **Primary Text**: `#191919`
- **Secondary Muted Text**: `#666666`
- **Success & Warning**: `#238636` / `#D97706`

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons, Interactive Geo Canvas
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Rate Limiter (`express-rate-limit`)
- **Database**: Normalized MySQL relational schema (via `mysql2`), with automatic zero-config fallback to SQLite for immediate local execution.
- **Testing**: Native Node.js test runner (`node --test`) for compatibility matrices and workflow state machine rules.

---

## 3. Pre-Seeded Demo Accounts

You can log in to test all four role workflows immediately using the pre-seeded credentials (also available as 1-click buttons on the Login page):

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Blood Donor (O-)** | `donor@lifelink.ai` | `Donor@123` | Alex Rivera (Universal RBC Donor, 4 previous donations) |
| **Hospital Staff** | `hospital@lifelink.ai` | `Hospital@123` | Apex Multi-Speciality Hospital (Certified & Verified) |
| **Patient / Family** | `patient@lifelink.ai` | `Patient@123` | John Anderson (Has active submitted & pending requests) |
| **System Administrator** | `admin@lifelink.ai` | `Admin@123` | Full governance, hospital verification & audit trail |

Additional pre-seeded donors in various blood groups: `sarah.donor@lifelink.ai` (A+), `rahul.donor@lifelink.ai` (B+), `priya.donor@lifelink.ai` (AB+), `michael.donor@lifelink.ai` (O+), `emily.donor@lifelink.ai` (A-), `david.donor@lifelink.ai` (B-).

---

## 4. End-to-End Workflow Demonstration

1. **Donor Onboarding & Availability**:
   - A donor registers, sets their blood group (`O-`, `A+`, etc.), city/coordinates, and donation status.
   - The donor can toggle availability on/off from the dashboard anytime.
2. **Patient Blood Request Creation**:
   - A patient creates a request specifying units, component (e.g. PRBC, Platelets, Plasma), required date, and urgency.
   - The request is created in **`Pending Verification`** status.
3. **Hospital Clinical Verification**:
   - Hospital staff logs in, reviews the patient's requirement, and authorizes it.
   - The status advances to **`Verified`**.
4. **Intelligent Donor Matching & Geo-Radius Escalation**:
   - The matching engine filters donors based on blood component compatibility matrix, active availability, and medical eligibility.
   - Computes great-circle distance using the Haversine formula and ranks candidates.
   - Staff can escalate search zones (5 km &rarr; 10 km &rarr; 25 km).
5. **Targeted Outreach & Donor Response**:
   - Hospital sends targeted emergency alerts to candidates.
   - Donors receive urgent notifications and can accept or decline.
   - When a donor accepts, the request moves to **`Donor Response Received`**.
6. **Fulfillment & Verified Certification**:
   - Hospital marks the transfusion complete (**`Fulfilled`**), automatically recording a verified donation certificate for the donor.

---

## 5. Project Architecture & Modular Structure

The codebase is organized so multiple engineers can develop modules concurrently without merge conflicts:

```
LifeLink-AI/
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, StatusBadge, Map, Modals
│   │   ├── layouts/            # MainLayout, DashboardLayout
│   │   ├── modules/
│   │   │   ├── donors/         # Teammate 1: Donor Cards, Incoming Alerts, History
│   │   │   ├── requests/       # Teammate 2: Request Cards, Timelines, Verifications
│   │   │   └── matching/       # Teammate 3: Candidate Lists, Radius Escalation, Outreach
│   │   ├── pages/              # 13 Dedicated Pages
│   │   ├── services/           # HTTP API client, Auth, Notification services
│   │   ├── context/            # AuthContext
│   │   └── hooks/              # useAuth
│   └── package.json
├── server/                     # Backend API (Express.js)
│   ├── src/
│   │   ├── controllers/        # Auth, Donor, Request, Matching, Admin, Notification
│   │   ├── routes/             # Scoped modular express routes
│   │   ├── services/           # matchingService, notificationService, auditService
│   │   ├── database/           # db.js, initDb.js, schema.sql, seed.sql
│   │   ├── middleware/         # authMiddleware, roleMiddleware, rateLimiter
│   │   ├── validators/         # Input & state transition validation
│   │   └── utils/              # compatibility.js, geo.js
│   ├── tests/                  # Unit tests for matching engine & state transitions
│   ├── .env.example
│   └── package.json
├── shared/                     # Shared Constants & Contracts
│   ├── constants/              # roles.js, requestStatus.js, bloodGroups.js, urgencyLevels.js
│   └── api-contracts/          # endpoints.js
├── package.json
└── README.md
```

---

## 6. Installation & Execution Guide

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Optional: MySQL Server (SQLite is built-in as an automatic out-of-the-box fallback)

### Step 1: Install Dependencies
Run from the root directory:
```bash
npm install
npm run install:all
```

### Step 2: Initialize & Seed the Database
Populates the demo donors, hospitals, requests, and notifications:
```bash
npm run seed
```

### Step 3: Run the Application
Start both frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Running Unit Tests
```bash
npm test
```

---

## 7. API Endpoint Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register Donor, Patient, or Hospital.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Inspect authenticated user profile.
- `POST /api/auth/logout` — Invalidate session.

### Donors (`/api/donors`)
- `GET /api/donors/profile` — Fetch donor profile details.
- `PUT /api/donors/profile` — Update city, blood group, last donation date.
- `PATCH /api/donors/availability` — Toggle active donation availability.
- `GET /api/donors/incoming-requests` — List matched emergency alerts.
- `POST /api/donors/requests/:requestId/respond` — Record ACCEPTED or DECLINED response.
- `GET /api/donors/history` — List verified donation certificates.

### Blood Requests (`/api/requests`)
- `GET /api/requests` — List authorized requests with filters (`status`, `urgency`, `bloodGroup`).
- `POST /api/requests` — Create emergency blood request.
- `GET /api/requests/:id` — Get full request details and candidate responses.
- `POST /api/requests/:id/verify` — Authorize/verify request (Hospital/Admin only).
- `PATCH /api/requests/:id/status` — State machine transition.
- `POST /api/requests/:id/cancel` — Cancel active request.
- `GET /api/requests/:id/history` — Fetch event audit logs.

### Matching Engine (`/api/matching`)
- `GET /api/matching/requests/:requestId/candidates?radius=10` — Run matching algorithm.
- `POST /api/matching/requests/:requestId/outreach` — Dispatch targeted emergency alerts.
- `POST /api/matching/requests/:requestId/expand-radius` — Expand search radius (5, 10, 25 km).

### Administration (`/api/admin`)
- `GET /api/admin/users` — List all registered users.
- `GET /api/admin/hospitals` — List registered hospitals.
- `PATCH /api/admin/hospitals/:id/verify` — Certify hospital registration license.
- `GET /api/admin/audit-logs` — Inspect system audit records.
- `GET /api/admin/stats` — Platform live metrics.

---

## 8. Implemented Features & Prototype Summary

- [x] Coral-red & white responsive UI matching reference specifications.
- [x] Normalized MySQL schema with indexes, foreign keys, and audit logging.
- [x] Role-based protected routes and JWT authentication.
- [x] Precision blood component compatibility matrix (Whole Blood, RBC, Platelets, Plasma).
- [x] Haversine geolocation calculation and multi-stage radius expansion (5 km, 10 km, 25 km).
- [x] Hospital verification gating preventing unauthorized emergency broadcasts.
- [x] In-app notification bell with real-time updates and unread badges.
- [x] Complete test suite for matching rules and state transitions.
