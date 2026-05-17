# 🚌 Kenya Express Coaches — Bus Hiring System

A full-stack bus booking web application for Kenya, built with React (frontend), Node.js/Express (backend), and PostgreSQL (database).

## Quick Start

### 1. Database Setup
```bash
psql -U postgres -f setup.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and Gmail settings
npm install
npm run dev
# → Runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# → Runs on http://localhost:5173
```

## Demo M-PESA Code
Use this code at the payment step:
```
QHJ2XKTYP1
```

## M-PESA Till Number
```
247247
```

## Default DB Credentials
- **User**: `busapp_user`
- **Password**: `BusApp@2024#Kenya`
- **Database**: `busapp_db`

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express, express-validator, Nodemailer
- **Database**: PostgreSQL (pg)

See `report.md` for full architecture documentation.
