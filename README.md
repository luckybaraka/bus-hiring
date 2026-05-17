# 🚌 Kenya Express Coaches — Bus Hiring System

A full-stack bus booking web app for Kenya: React + Vite frontend, Node.js/Express REST API, PostgreSQL database. Lets a passenger search routes (e.g. Nairobi → Mombasa), pick a seat, enter passenger details, pay via a demo M-PESA flow, and receive a booking reference.

---

## Prerequisites

Install these before you start:

| Tool       | Version       | Notes                                                |
| ---------- | ------------- | ---------------------------------------------------- |
| Node.js    | 18 LTS or newer | `node -v` to verify                                |
| npm        | 9+            | Ships with Node                                      |
| PostgreSQL | 14+ (18 tested) | Make sure `psql` is on your `PATH`                 |
| Git        | any           | To clone the repo                                    |

You will also need the **postgres superuser password** (set when you installed PostgreSQL) — `setup.sql` connects as `postgres` to create the application database and role.

---

## 1. Clone the repository

```bash
git clone <repo-url> bus-hiring-system
cd bus-hiring-system
```

---

## 2. Database setup

### 2a. Run the setup script

The script creates a role `busapp_user`, a database `busapp_db`, all tables and indexes, and seeds them with 20 Kenyan cities, 24 routes, 8 drivers, 8 buses (with auto-generated seats), and 14 days of upcoming trips.

**Linux / macOS / Git Bash:**
```bash
psql -U postgres -f setup.sql
```

**Windows PowerShell** (recommended — forces UTF-8 so route names like *Nairobi – Mombasa Express* are stored correctly):
```powershell
$env:PGCLIENTENCODING = 'UTF8'
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f setup.sql
```

Enter the postgres superuser password when prompted. Expected end-of-run output:
```
============================================================
 Setup Complete!
 Database  : busapp_db
 User      : busapp_user
 Password  : BusApp@2024#Kenya
============================================================
```

### 2b. Verify the seed

```bash
psql -U busapp_user -h localhost -d busapp_db -c "SELECT COUNT(*) FROM cities;"
psql -U busapp_user -h localhost -d busapp_db -c "SELECT id, route_name FROM routes LIMIT 3;"
```

Password when prompted: `BusApp@2024#Kenya`. You should see 20 cities and route names with proper en-dashes.

---

## 3. Backend setup

```bash
cd backend
cp .env.example .env       # Windows PowerShell: Copy-Item .env.example .env
npm install
```

### Configure `backend/.env`

Open `.env` and review/edit these values:

```ini
PORT=5000                    # Port the API listens on
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=busapp_db
DB_USER=busapp_user
DB_PASSWORD="BusApp@2024#Kenya"

# Optional — emails are sent on booking confirmation
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password-here    # Gmail App Password (not your login)
EMAIL_FROM=Kenya Bus Hire <your-gmail@gmail.com>

# M-PESA demo
MPESA_TILL_NUMBER=247247
MPESA_DUMMY_CODE=QHJ2XKTYP1
```

> **Gmail app password:** Google Account → Security → 2-Step Verification → App passwords → Generate. Leave the defaults if you don't care about email — payment will still succeed; only the confirmation email will fail silently.

### Run the backend

```bash
npm run dev      # auto-reload with nodemon
# or
npm start        # plain node
```

Expected:
```
🚌  Kenya Bus Hire API running on http://localhost:5000
    Health check: http://localhost:5000/health
```

Quick check from another terminal:
```bash
curl http://localhost:5000/health
# {"status":"OK","timestamp":"..."}
```

---

## 4. Frontend setup

> **Important:** the Vite dev server proxies `/api/*` requests to the backend. The target in `frontend/vite.config.js` **must match the backend `PORT`** in `backend/.env`. If you changed `PORT` from the default `5000` (e.g. to `2020`), update `vite.config.js` to match:
>
> ```js
> proxy: {
>   '/api': {
>     target: 'http://localhost:5000',   // ← change to your backend PORT
>     changeOrigin: true,
>   },
> },
> ```

Then in a **separate terminal**:

```bash
cd frontend
npm install
npm run dev
```

Expected:
```
  VITE v5  ready in ... ms
  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser.

---

## 5. Testing a full booking

Walk through the UI:

1. **Home** — pick *From: Nairobi*, *To: Mombasa*, *Date: tomorrow* (or any of the next 14 days), click **Search Buses**.
2. **Search Results** — pick one of the listed trips, click **Select Seat**.
3. **Trip Details** — pick any unoccupied seat on the seat map, click **Continue**.
4. **Passenger Details** — fill in:
   - Name: any 3+ characters
   - Email: any valid email
   - Phone: Kenyan format, e.g. `0712345678` or `+254712345678`
   - National ID / Passport: any 5+ characters
5. **Payment** — enter the demo M-PESA code:
   ```
   QHJ2XKTYP1
   ```
   Any other 10-char alphanumeric code will be rejected with a format/auth message.
6. **Confirmation** — you'll see the booking reference (e.g. `BUS-AB12CD34`) and a printable receipt.

You can also smoke-test the API directly without the UI:

```bash
# 1. List cities
curl http://localhost:5000/api/cities

# 2. Search trips
curl "http://localhost:5000/api/trips/search?from=1&to=2&date=2026-05-18"

# 3. Get seat map for trip #1
curl http://localhost:5000/api/trips/1/seats

# 4. Create a pending booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"trip_id":1,"seat_id":1,"passenger_name":"Test User","passenger_email":"t@e.com","passenger_phone":"0712345678","passenger_id_no":"12345678"}'

# 5. Confirm payment (use the reference returned by step 4)
curl -X POST http://localhost:5000/api/payments/validate \
  -H "Content-Type: application/json" \
  -d '{"booking_reference":"BUS-XXXXXXXX","mpesa_code":"QHJ2XKTYP1"}'
```

---

## Demo credentials

| Item             | Value                  |
| ---------------- | ---------------------- |
| M-PESA code      | `QHJ2XKTYP1`           |
| M-PESA till      | `247247`               |
| DB user          | `busapp_user`          |
| DB password      | `BusApp@2024#Kenya`    |
| DB name          | `busapp_db`            |

---

## Project layout

```
bus-hiring-system/
├── setup.sql              # Database schema + seed (idempotent — drops & recreates DB)
├── backend/
│   ├── server.js          # Express entry point
│   ├── .env.example       # Copy to .env
│   └── src/
│       ├── config/database.js
│       ├── controllers/   # cities, trips, bookings, payments
│       ├── middleware/    # express-validator rules
│       ├── routes/        # /api/cities, /api/trips, /api/bookings, /api/payments
│       └── utils/emailService.js
└── frontend/
    ├── vite.config.js     # Dev proxy → backend
    └── src/
        ├── pages/         # Home, SearchResults, TripDetails, PassengerDetails, Payment, Confirmation, ReceiptPreview
        ├── components/    # Navbar, Footer
        ├── context/BookingContext.jsx
        └── services/api.js
```

---

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, lucide-react, react-hot-toast
- **Backend:** Node.js, Express, express-validator, Nodemailer, pg
- **Database:** PostgreSQL 14+ (tested on 18)

---

## Troubleshooting

**Frontend loads but shows "Failed to fetch" / cities list is empty.**
The Vite proxy target doesn't match the backend port. Check that `backend/.env` `PORT=` and `frontend/vite.config.js` `target:` are the same, then restart both servers.

**Route names show as `Nairobi â€" Mombasa` instead of `Nairobi – Mombasa`.**
You ran `setup.sql` on Windows without forcing UTF-8 — the en-dashes got double-encoded. Re-run with `$env:PGCLIENTENCODING = 'UTF8'` set first (see section 2a). The current `setup.sql` already pins `client_encoding` after `\c busapp_db`, so a re-import fixes it cleanly.

**`psql: error: connection to server at "localhost" ... fe_sendauth: no password supplied`.**
Either set `PGPASSWORD` in the environment or create `~/.pgpass` (Linux/macOS) / `%APPDATA%\postgresql\pgpass.conf` (Windows). For the postgres superuser, use the password you set when installing PostgreSQL.

**Port 5000 is already in use.**
Either kill the process holding it, or change `PORT=` in `backend/.env` to a free port (e.g. `2020`) **and** update `frontend/vite.config.js` to match.

**Confirmation email never arrives.**
Expected if you didn't set `EMAIL_USER`/`EMAIL_PASS` in `.env`. The error is logged on the backend and is non-fatal — the booking itself succeeds.

**Seats already booked when I open the page.**
Each trip's `bus_seats` map is shared across all bookings for that trip. To reset, either re-run `setup.sql` (destructive) or `DELETE FROM bookings;` in psql.

---

See `report.md` for full architecture documentation.
