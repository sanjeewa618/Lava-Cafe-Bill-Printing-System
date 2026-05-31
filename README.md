# 🌋 Lava Cafe POS System

**Point of Sale & Bill Printing System for Lava Cafe Food & Juice Bar**

![Theme](https://img.shields.io/badge/Theme-Yellow%20%7C%20Black%20%7C%20White-FFC107?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20PostgreSQL-121212?style=for-the-badge)

---

## 📁 Project Structure

```
Lava-Cafe-Bill-Printing-System/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # PostgreSQL connection pool
│   │   │   └── initDb.js          # Database init & seed data
│   │   ├── controllers/
│   │   │   ├── authController.js  # Login, profile, password
│   │   │   ├── productController.js # Product CRUD + Categories
│   │   │   ├── orderController.js  # Orders, invoice gen, dashboard
│   │   │   ├── userController.js   # User management
│   │   │   └── reportController.js # Daily/monthly reports
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT auth + role guard
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── users.js
│   │   │   └── reports.js
│   │   └── server.js              # Express app entry
│   ├── .env                       # Environment variables
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── LiveClock.js    # Real-time clock widget
    │   │   └── layout/
    │   │       └── Layout.js       # Sidebar + AppBar layout
    │   ├── context/
    │   │   └── AuthContext.js      # Auth state management
    │   ├── pages/
    │   │   ├── Auth/Login.js       # Login screen
    │   │   ├── Dashboard/Dashboard.js # Stats + Charts
    │   │   ├── POS/
    │   │   │   ├── POSBilling.js   # Main POS screen
    │   │   │   └── Receipt.js      # Thermal receipt template
    │   │   ├── Products/Products.js # Product management
    │   │   ├── Reports/Reports.js   # Sales reports
    │   │   ├── Users/Users.js       # User management
    │   │   └── Settings/Settings.js # Settings
    │   ├── utils/
    │   │   └── api.js              # Axios client with auth
    │   ├── theme.js                # MUI Yellow/Black theme
    │   ├── App.js                  # Router + protected routes
    │   └── index.js
    └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- npm

### 1. Database Setup

```sql
-- In PostgreSQL, create the database:
CREATE DATABASE lava_cafe_pos;
```

### 2. Backend Setup

```bash
cd backend
npm install

# Edit .env file - set your PostgreSQL password:
# DB_PASSWORD=your_postgres_password

# Initialize database with tables & seed data:
npm run db:init

# Start backend:
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🔐 Default Login Credentials

| Role    | Username | Password  |
|---------|----------|-----------|
| Admin   | admin    | admin123  |
| Cashier | kasun    | kasun123  |

---

## 🎨 Color Theme

| Purpose     | Color              | Hex       |
|-------------|-------------------|-----------|
| Primary     | Yellow            | `#FFC107` |
| Background  | Near Black        | `#0A0A0A` |
| Surface     | Dark Gray         | `#1A1A1A` |
| Sidebar     | Black             | `#121212` |
| Text        | White             | `#FFFFFF` |
| Success     | Green             | `#4CAF50` |
| Danger      | Red               | `#F44336` |

---

## 📱 Features

### ✅ Phase 1 (Implemented)
- 🔐 JWT Authentication with role-based access (Admin / Manager / Cashier)
- 🏠 Dashboard with real-time stats, weekly chart, top products
- 🧾 **POS Billing Screen** — product grid, cart management, order types (Dine In / Take Away / Delivery), table selection
- 🖨️ **Thermal Receipt Printing** (80mm format) — Invoice No: `LC-2026-00001`
- 🍔 Product Management — Add/Edit/Delete, categories, icons, stock tracking
- 📈 Reports — Daily sales, hourly charts, top items, cashier tracking
- 👥 User Management — Create users, assign roles/shifts, reset passwords
- ⚙️ Settings — Change password, theme info
- ⏰ Live Clock — Real-time date & time in header

### 🔜 Phase 2 (Planned)
- 📦 Inventory / Stock Management
- 📊 Monthly Reports with export

### 🔮 Phase 3 (Future)
- 📱 Mobile App
- 💳 QR Payments
- 🌐 Online Orders
- 🎁 Customer Loyalty Points

---

## 🖨️ Receipt Format

```
=========================
        🌋 LAVA CAFE
  FOOD & JUICE BAR
  No 25, Main Street, Negombo
=========================

Invoice: LC-2026-00001
Date: 31/05/2026
Time: 10:25 AM
Cashier: Kasun Perera
Order Type: Dine In
Table: T05

─────────────────────────
Item          Qty   Total
─────────────────────────
Chicken Burger  2   1700
Orange Juice    1    350
─────────────────────────
Subtotal      2050
Discount       100
Grand Total   1950

Cash          2000
Balance         50

** Thank You! **
  Visit Again
=========================
```

---

## 🧰 Tech Stack

| Layer     | Technology       |
|-----------|-----------------|
| Frontend  | React.js 18      |
| UI        | Material UI v5   |
| Charts    | Recharts         |
| Routing   | React Router v6  |
| HTTP      | Axios            |
| Printing  | react-to-print   |
| Backend   | Node.js + Express|
| Database  | PostgreSQL       |
| Auth      | JWT + bcrypt     |

---

*Built with ❤️ for Lava Cafe Food & Juice Bar*