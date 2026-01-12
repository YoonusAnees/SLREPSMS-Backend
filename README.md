# SLREPSMS Backend (Node.js + TypeScript + TypeORM + PostgreSQL/PostGIS)

Sri Lanka Road **E‑Penalty & Safety Management System (SLREPSMS)** – backend API for:
- **E‑Penalty** issuance (Traffic Officer)
- **Online payment workflow** (Sandbox payment simulation)
- **Evidence uploads** (photo/video/document)
- **Road incident reporting** + **WebGIS dispatch** (PostGIS nearest rescue team)
- **Demerit points** + **license suspension** (rule-based)

> This is a **prototype** backend suitable for a final-year project demonstration.

---

## Tech Stack
- **Node.js + Express**
- **TypeScript**
- **TypeORM**
- **PostgreSQL + PostGIS**
- **JWT Auth + RBAC**
- **Multer** (evidence upload)

---

## Prerequisites
- Node.js 18+ (recommended)
- PostgreSQL 14+
- PostGIS extension installed

---

## 1) Database Setup (PostgreSQL + PostGIS)

Create database and enable extensions:

```sql
CREATE DATABASE slrepsms;
\c slrepsms;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

## 2) Project Setup

### Install dependencies
```bash
npm install
```

### Environment file
Copy `.env.example` to `.env` and edit values:

```bash
cp .env.example .env
```

Example `.env`:
```env
PORT=4000
NODE_ENV=development
JWT_SECRET=change-me

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=slrepsms
```

---

## 3) Run the API

### Development
```bash
npm run dev
```

### Build + Run
```bash
npm run build
npm start
```

Health check:
- `GET http://localhost:4000/health`

---

## 4) NPM Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start API with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled API |
| `npm run typeorm` | TypeORM CLI (optional) |

---

## 5) API Modules (High-level)

### Auth
- `POST /api/auth/register` *(prototype)*
- `POST /api/auth/login`

### Violation Types (Admin)
- `GET /api/violation-types`
- `POST /api/violation-types`

### Vehicles (Driver)
- `GET /api/vehicles/my`
- `POST /api/vehicles/my`

### Penalties
- `POST /api/penalties` *(Officer issues)*
- `GET /api/penalties/my` *(Driver views)*
- `GET /api/penalties` *(Admin lists)*

### Evidence Upload
- `POST /api/penalties/evidence` *(Officer uploads file)*

### Payments (Sandbox)
- `POST /api/payments/initiate` *(Driver initiates)*
- `POST /api/payments/sandbox/complete` *(simulate paid/failed)*
- `GET /api/payments/my` *(Driver history)*

### Incidents + Dispatch (WebGIS / Rescue)
- `POST /api/incidents` *(Officer/Dispatcher/Admin)*
- `GET /api/incidents/active` *(Dispatcher/Admin)*
- `POST /api/rescue-teams` *(Admin)*
- `GET /api/rescue-teams` *(Dispatcher/Admin)*
- `POST /api/dispatches/nearest` *(Dispatcher/Admin)*
- `POST /api/dispatches/status` *(Rescue/Dispatcher/Admin)*

---

## 6) RBAC Roles

| Role | Allowed actions (summary) |
|---|---|
| DRIVER | View penalties, pay, manage own vehicles |
| OFFICER | Issue penalties, upload evidence, create incidents |
| ADMIN | Manage violation types, create rescue teams, list penalties |
| DISPATCHER | View incidents, dispatch nearest team |
| RESCUE | Update dispatch status (EN_ROUTE/ON_SCENE/COMPLETED) |

---

## 7) Demerit Points + License Suspension (Business Rules)

- Each **Driver starts with 5 points** (`current_points = 5`).
- When a penalty is issued, points are deducted based on `violation_types.points`.
- If `current_points <= 0` → `license_status = SUSPENDED` for **30 days** (`suspended_until`).

Fields used (in `users` table for drivers):
- `current_points` (int)
- `license_status` (ACTIVE/SUSPENDED)
- `suspended_until` (timestamp)

---

## 8) Evidence Upload Notes

Uploads are stored locally in `/uploads` for prototype use.

To upload evidence in Postman:
- Use **form-data**
- Keys:
  - `penalty_id` (text)
  - `type` (text, e.g., PHOTO)
  - `file` (file)

Evidence URL will look like:
- `/uploads/<filename>`

---

## 9) Postman Collection (Import)

Import:
1. Postman → **Import**
2. Select `postman/SLREPSMS.postman_collection.json`
3. Set `{{baseUrl}} = http://localhost:4000`
4. Login and paste JWT into `{{token}}`

Suggested test flow:
1. Register Admin/Officer/Driver (prototype)
2. Login each role
3. Admin creates violation types
4. Driver adds vehicle
5. Officer issues penalty
6. Driver initiates payment → sandbox complete
7. Officer/Dispatcher creates incident
8. Admin creates rescue team
9. Dispatcher dispatches nearest team
10. Rescue updates status

---

## Notes (Prototype vs Real System)
This is a student prototype. A real production deployment would add migrations, refresh tokens, rate limiting, stronger audit logs, centralized storage, and real payment gateway integration.

---

## Author
SLREPSMS – Student prototype backend.
