# 🥦 QUICKPICK — Grocery Click & Collect Platform

QuickPick is a production-oriented, full-stack web application designed for a single local grocery shop. Customers browse fresh grocery products online, choose weight or pack options, build their cart, choose ASAP or scheduled collection time slots, and collect their bagged groceries at an express store counter without waiting in traditional billing lines.

---

## 🌟 Key Highlights

- **Single-Shop Focused Architecture:** Tailored specifically for a local neighborhood grocery store with express counter pickup.
- **Backend Price Calculation & Inventory Reservation:** Prices sent by the frontend are never trusted; all computations and stock reservations occur atomically inside database transactions.
- **Prevents Overselling & Duplicate Submissions:** Idempotency keys protect against duplicate orders; inventory is reserved on order placement and released on cancellation or rejection.
- **Cryptographic QR Code & Pickup Token:** Each order generates an encrypted 16-character token with a scannable high-resolution QR code pass for 60-second counter handovers.
- **Dual-Engine Prisma ORM:** 100% PostgreSQL schema with full relational constraints (`prisma/schema.postgresql.prisma`), paired with zero-config local engine fallback (`prisma/schema.sqlite.prisma`) for instant offline execution.
- **Real-Time Order Flow via Socket.IO:** Live updates synchronize customer order status (`PLACED` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY` ➔ `COLLECTED`) and alert staff to incoming orders and low-stock events.
- **Razorpay Checkout Integration:** Test mode checkout with server-side HMAC-SHA256 cryptographic signature validation and webhook processing.
- **Full Operational Staff Dashboard:** Order board, express QR scanner terminal, inventory control with movement audit logs, time-slot management, and sales reports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide React, Axios, Socket.IO Client, Canvas Confetti |
| **Backend** | Node.js (v24), Express 4, Socket.IO 4, Helmet, CORS, Morgan |
| **Database & ORM** | PostgreSQL 16 / SQLite local fallback, Prisma ORM 5.22 |
| **Authentication** | JWT (jsonwebtoken), bcryptjs password hashing (cost factor 10) |
| **Validation** | Zod 3.23 (strict schema parsing on all requests) |
| **Payments** | Razorpay SDK & Server-Side Signature Verification |
| **Pickups & QR** | `qrcode` library (Level H error correction, zero PII exposure) |

---

## 📂 Project Directory Structure

```text
quickpick/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Admin Sidebar, Layout, etc.
│   │   │   ├── common/         # Navbar, Footer, AuthModal, CartDrawer, ToastNotification
│   │   │   └── customer/       # ProductCard, CategoryPill, HeroBanner, HowItWorks, etc.
│   │   ├── contexts/           # AuthContext, CartContext, SocketContext
│   │   ├── pages/
│   │   │   ├── admin/          # Overview, Orders, PickupScan, Products, Inventory, Slots, Reports, Settings
│   │   │   └── customer/       # HomePage, CheckoutPage, OrderTrackingPage, OrderHistoryPage
│   │   ├── services/           # Axios API Client with JWT interceptors
│   │   ├── utils/              # Currency, date, and status formatters
│   │   ├── App.jsx             # Hash-based SPA routing
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Express + Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Active Prisma schema
│   │   ├── schema.postgresql.prisma # PostgreSQL reference schema
│   │   └── schema.sqlite.prisma# SQLite local reference schema
│   ├── src/
│   │   ├── controllers/        # auth, product, cart, order, payment, pickup, admin
│   │   ├── database/           # prisma client, seed data, setup-db switcher
│   │   ├── middleware/         # auth (JWT), role authorize, rateLimiter, validate, error
│   │   ├── routes/             # auth, product, cart, order, payment, pickup, admin
│   │   ├── utils/              # jwt, qr, orderNumber, response
│   │   ├── validations/        # Zod schemas for auth, products, orders, cart, pickups
│   │   ├── app.js              # Express app & static serving
│   │   ├── server.js           # HTTP + Socket.IO server listener
│   │   └── socket.js           # Real-time event broadcasting
│   ├── tests/
│   │   └── run-tests.js        # 23 automated end-to-end API tests
│   ├── .env.example
│   └── package.json
├── docker-compose.yml          # PostgreSQL + API containerization
├── Dockerfile                  # Multi-stage production container build
├── package.json                # Root developer scripts
└── README.md
```

---

## 🔑 Pre-Seeded Test Credentials

The database comes pre-seeded with 3 realistic accounts for instant one-click evaluation:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Store Admin** | `admin@quickpick.com` | `Admin@12345` | Full access: Overview, Orders, Inventory, Products, Settings, Reports |
| **Pickup Staff** | `staff@quickpick.com` | `Staff@12345` | Counter operations: Order Queue, Bag Groceries, Scan QR, Handover |
| **Customer** | `customer@example.com` | `Customer@12345` | Browse catalogue, add to cart, checkout, view live order QR passes |

> **Pro Tip:** In the **Sign In** modal, click the quick buttons (`🛒 Customer`, `🧑‍💼 Staff`, `👑 Admin`) for instant demo login.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+

### 2. Setup Database & Seed Initial Catalog
From the `server/` directory:
```bash
cd server
npm install
node src/database/setup-db.js
```
*Note:* The setup script automatically tests for a PostgreSQL instance on port 5432. If none is detected, it configures the local SQLite engine and seeds all categories, 22 products, pickup time slots, and sample orders immediately.

To explicitly force PostgreSQL:
```bash
node src/database/setup-db.js --pg
```

### 3. Run the Automated Test Suite
Verify backend logic, inventory reservation, idempotency, duplicate collection blocking, and security permissions:
```bash
npm test
```
*(All 23 automated test suites run end-to-end and report results).*

### 4. Start the Application
You can run the full application in two ways:

#### Option A: Full Development Mode (with Vite HMR)
In terminal 1 (Server):
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

In terminal 2 (Client):
```bash
cd client
npm run dev
# Running on http://localhost:5173 (proxies API & WebSocket to port 5000)
```

#### Option B: Standalone Production Mode (Single Port 5000)
Express serves both the API and the pre-built React frontend:
```bash
cd client
npm run build
cd ../server
npm start
# Open http://localhost:5000 in your browser
```

---

## 🛡️ Critical Click & Collect Business Logic

### 1. Zero Trust on Frontend Pricing
Product prices, discount values, and subtotals sent by the client are strictly ignored. The backend retrieves the live product record, applies the specific variant multiplier, validates stock availability, computes 5% GST, and freezes the final price in `OrderItem`.

### 2. Atomic Stock Reservation (`$transaction`)
When a customer clicks **Confirm & Place Pickup Order**:
```
Customer Checkout ──► Database Transaction ──► Validate availableStock (stockQuantity - reservedStock)
                                           ──► Increment reservedStock by requested quantity
                                           ──► Log InventoryMovement (type: 'RESERVATION')
                                           ──► Create Order & Payment records
                                           ──► Clear Customer Cart
```
If two shoppers purchase the last item simultaneously, the second transaction is rejected cleanly with an insufficient stock notification.

### 3. Order Cancellation & Rejection (Stock Release)
If a customer cancels an order while it is in the `PLACED` state, or if store staff rejects an order:
- `reservedStock` is automatically decremented.
- An `InventoryMovement` record of type `RELEASE` is written to the audit log.
- Slot `bookedCount` is decremented.

### 4. Cryptographic QR Verification & Handover
- QR codes encode an opaque payload (`orderNumber`, `pickupToken`, `shop: 'QuickPick'`, `v: 1`).
- Customer phone numbers, addresses, and payment secrets are **never** embedded in QR codes.
- When counter staff scans the QR code:
  - Backend checks token match.
  - Backend verifies order status is `READY`.
  - Backend checks `collectedAt`: if already collected, it blocks the handover with a duplicate collection alert.
  - If verified, handover marks order `COLLECTED`, converts reservation into `SALE`, and marks cash payment as `SUCCESS`.

---

## 💳 Razorpay Test Mode Setup

1. Sign up for a free Razorpay account at [https://dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Generate your **Test Key ID** and **Test Key Secret** under **Settings ➔ API Keys**.
3. Place them in `server/.env`:
   ```env
   RAZORPAY_KEY_ID="rzp_test_YourKeyIdHere"
   RAZORPAY_KEY_SECRET="YourKeySecretHere"
   RAZORPAY_WEBHOOK_SECRET="YourWebhookSecretHere"
   ```
4. In test mode, Razorpay provides standard test cards, UPI IDs (`success@razorpay`), and simulated netbanking.

---

## 🌐 Production Deployment Guide

### A. Deploy Database (Managed PostgreSQL)
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech), [Supabase.com](https://supabase.com), or [Render.com](https://render.com).
2. Copy your PostgreSQL connection string:
   ```text
   DATABASE_URL="postgresql://user:password@ep-cool-db.neon.tech/quickpick?sslmode=require"
   ```

### B. Deploy Backend (Render / Railway)
1. Push this repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), create a new **Web Service**.
3. Connect your repository and select the `server/` root directory.
4. Set Build Command:
   ```bash
   npm install && npx prisma db push --schema=prisma/schema.postgresql.prisma && npx prisma generate --schema=prisma/schema.postgresql.prisma && node src/database/seed.js
   ```
5. Set Start Command:
   ```bash
   node src/server.js
   ```
6. Add Environment Variables:
   - `DATABASE_URL`: Your managed PostgreSQL connection URL
   - `JWT_SECRET`: Random 64-character secret
   - `RAZORPAY_KEY_ID`: Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret
   - `CLIENT_URL`: URL of your deployed frontend (e.g. `https://quickpick.vercel.app`)

### C. Deploy Frontend (Vercel)
1. In [Vercel Dashboard](https://vercel.com), click **Add New Project**.
2. Select repository and choose the `client/` folder as the Root Directory.
3. Framework Preset: **Vite**.
4. In `client/vite.config.js` or via environment variable, point the API proxy target to your live Render backend URL.
5. Click **Deploy**.

---

## 🐳 Docker Deployment

To spin up both PostgreSQL and QuickPick API together in Docker:
```bash
docker-compose up --build
```
The application will be accessible at `http://localhost:5000`.

---

© 2026 QUICKPICK Grocery Click & Collect. Production-Ready Platform.
