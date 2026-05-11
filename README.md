# Dairy Milk Collection Management — Backend API

Node.js + Express + PostgreSQL + Prisma + JWT.

## Prerequisites

- Node.js 18+
- PostgreSQL with database `milk_diary` and user matching `DATABASE_URL` in `.env`

## Setup

```bash
cd Backend
cp .env.example .env   # if you do not already have .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

> Dashboard “today” and daily summaries use the **server’s local timezone** for calendar-day boundaries.

Default admin (after seed):

- **Email:** `admin@gmail.com`
- **Password:** `admin123`

Server: `http://localhost:4000` (override with `PORT` in `.env`)

## Health

```http
GET /health
```

## Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

Response includes `data.token` — send as:

```http
Authorization: Bearer <token>
```

## Farmers

```http
GET /api/farmers?page=1&limit=10&q=patil&village=Khedgaon&status=active
POST /api/farmers
Content-Type: application/json

{
  "name": "Demo Farmer",
  "mobile": "+919876543210",
  "village": "Khedgaon",
  "status": "active"
}
```

```http
GET /api/farmers/:id
PUT /api/farmers/:id
DELETE /api/farmers/:id
```

`farmerCode` (e.g. `FR-1004`) and `qrCode` (e.g. `FARMER-1004`) are generated automatically.

## Milk collections

```http
POST /api/collections
Content-Type: application/json

{
  "farmerId": "<uuid>",
  "weight": 12.5,
  "collectedAt": "2026-05-11T08:30:00.000Z"
}
```

`session` defaults from time: **Morning** if hour `< 12`, else **Evening**. You may send `"session": "Morning"` to override.

```http
GET /api/collections?page=1&limit=10&farmerId=<uuid>&session=Morning
GET /api/collections/:id
```

### Daily summary

```http
GET /api/collections/summary/daily?date=2026-05-11
```

### Monthly summary (paginated items)

```http
GET /api/collections/summary/monthly?year=2026&month=5&page=1&limit=10
```

### Farmer history

```http
GET /api/collections/farmer/:farmerId?page=1&limit=10
```

## Dashboard

```http
GET /api/dashboard/stats
```

Returns totals for **today** (server local calendar day): farmers count, today’s collection count, total liters, morning / evening liters.

## OpenAPI

Skeleton contract: `docs/openapi.yaml` (import into Postman or wire `swagger-ui-express` later).

## Scripts

| Script            | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Nodemon + API              |
| `npm start`       | Production `node`          |
| `npm run prisma:migrate` | `prisma migrate dev` |
| `npm run db:seed` | Seed admin + farmers       |
