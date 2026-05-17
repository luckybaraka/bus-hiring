# Kenya Express Coaches — Bus Hiring System
## Technical Report

---

## 1. System Overview

Kenya Express Coaches is a full-stack web application that allows customers to search for and book intercity bus seats across Kenya. Customers can browse available routes, select seats, provide passenger details, review their receipt, and pay via M-PESA simulation — receiving an email confirmation upon successful booking.

---

## 2. Three-Tier Architecture

The system is structured using the classic **3-Tier Architecture**, which separates the application into three distinct layers:

```
┌──────────────────────────────────────────────┐
│           TIER 1: PRESENTATION               │
│         React + Vite (Port 5173)             │
│   Pages, Components, Context, API Service    │
└────────────────────┬─────────────────────────┘
                     │  HTTP (REST API via /api proxy)
┌────────────────────▼─────────────────────────┐
│            TIER 2: LOGIC / APPLICATION        │
│         Node.js + Express (Port 5000)        │
│   Routes, Controllers, Validators, Services  │
└────────────────────┬─────────────────────────┘
                     │  SQL Queries via pg Pool
┌────────────────────▼─────────────────────────┐
│             TIER 3: DATA                     │
│         PostgreSQL Database                  │
│   Tables: cities, routes, buses, trips,      │
│            bookings, drivers, bus_seats      │
└──────────────────────────────────────────────┘
```

### Tier 1 — Presentation (React Frontend)
The frontend is built with **React 18 + Vite**. It is responsible for all user interface concerns. It never talks to the database directly — it only communicates with the backend API. Key sub-components include:
- **Pages**: Home, SearchResults, TripDetails, PassengerDetails, ReceiptPreview, Payment, Confirmation
- **Context (BookingContext)**: Global state shared across all pages for the booking session
- **Services (api.js)**: Axios-based HTTP client that abstracts all API calls
- **Styling**: Tailwind CSS with a custom Kenyan colour theme (green, red, gold)

### Tier 2 — Application Logic (Node.js + Express Backend)
The backend handles all business logic including search, booking creation, payment validation, and email dispatch. It exposes a **RESTful API** consumed by the frontend. Key sub-components:
- **Routes**: `/api/cities`, `/api/trips`, `/api/bookings`, `/api/payments`
- **Controllers**: Handle request parsing, business logic, and DB queries
- **Validators**: express-validator middleware for input sanitisation
- **Email Service**: Nodemailer sends HTML receipt emails via Gmail SMTP
- **MPESA Validator**: Validates the 10-character code against 6 rules

### Tier 3 — Data (PostgreSQL)
All persistent data lives in a PostgreSQL database. The schema includes:

| Table | Purpose |
|-------|---------|
| `cities` | 20 major Kenyan cities |
| `routes` | 24+ routes with stops, distance, duration, price |
| `drivers` | 8 registered drivers with licence details |
| `buses` | 8 buses with plate numbers, capacity, amenities |
| `bus_seats` | Pre-generated seats per bus (rows × columns) |
| `trips` | Scheduled departures for the next 14 days |
| `bookings` | Customer bookings with status and MPESA code |

---

## 3. Technologies Used

| Technology | Role |
|-----------|------|
| **React 18** | Frontend UI library |
| **Vite** | Fast frontend dev server and bundler |
| **React Router v6** | Client-side routing across pages |
| **Tailwind CSS** | Utility-first CSS styling framework |
| **Axios** | HTTP client for API calls from the frontend |
| **lucide-react** | Icon library used throughout the UI |
| **react-hot-toast** | Notification toasts for user feedback |
| **Node.js** | JavaScript runtime for the backend server |
| **Express.js** | Minimal web framework for REST API |
| **express-validator** | Request input validation middleware |
| **pg (node-postgres)** | PostgreSQL client for Node.js |
| **nodemailer** | Email sending via Gmail SMTP |
| **uuid** | Generating unique booking references |
| **dotenv** | Loading environment variables |
| **PostgreSQL** | Relational database for all persistent data |

---

## 4. How the System Works — User Journey

### Step 1 — Home & Search
The customer visits the home page and selects their **origin city**, **destination city**, and **travel date**. They click "Search Buses" and are taken to the search results page.

```
Frontend → GET /api/cities (populate dropdowns)
Frontend → GET /api/trips/search?from=1&to=5&date=2025-06-01
Backend  → SQL JOIN (routes, cities, buses, drivers, bookings)
         → Returns available trips with seat counts
```

### Step 2 — Select a Trip
The results page shows all available buses for the route and date, including departure/arrival times, bus type, amenities, available seats, and price. The customer filters by time of day if desired and clicks "Select This Bus".

### Step 3 — Choose a Seat
The trip detail page shows a **visual seat map** in a 2-2 layout (A, B | aisle | C, D). Available seats are shown in green (clickable), occupied seats in grey (not clickable), and the selected seat turns dark green. The bus plate, model, total/available seats, and driver name are all displayed.

```
Frontend → GET /api/trips/:id/seats
Backend  → Returns all seats with is_booked flag
         → is_booked = confirmed booking exists for this seat on this trip
```

### Step 4 — Passenger Details
The customer fills in their full name, email address, Kenyan phone number (`+254` or `07xx`/`01xx` format), and ID/Passport number. On submit, the frontend calls:

```
Frontend → POST /api/bookings
         → { trip_id, seat_id, passenger_name, email, phone, id_no }
Backend  → Validates all fields with express-validator
         → Checks seat isn't already taken (confirmed booking)
         → Cleans stale "pending" bookings older than 15 minutes
         → Creates booking with status = 'pending'
         → Returns booking_reference (format: BUS-XXXXXXXX)
```

### Step 5 — Receipt Preview
Before paying, the customer sees a styled receipt preview showing all their trip and passenger details. They can go back to edit, print the preview, or proceed to payment.

### Step 6 — M-PESA Payment
The payment page shows:
- The MPESA **Till Number: 247247**
- Step-by-step payment instructions
- A demo code hint: **QHJ2XKTYP1**
- A code input field with live validation feedback

#### M-PESA Code Validation Rules
The system validates the code against 6 rules:
1. Must be exactly **10 characters**
2. Must contain only **letters and digits** (A-Z, 0-9)
3. Must **start with a letter**
4. Must contain at least **2 digits**
5. Must contain at least **4 letters**
6. Must **exactly match** the accepted demo code: `QHJ2XKTYP1`

```
Frontend → POST /api/payments/validate
         → { booking_reference, mpesa_code }
Backend  → Runs all 6 validation checks
         → On success: UPDATE bookings SET status='confirmed', mpesa_code=..., confirmed_at=NOW()
         → Triggers email dispatch (non-blocking)
         → Returns confirmed booking details
```

### Step 7 — Confirmation & Email
The confirmation page shows:
- A large animated green checkmark
- Full booking reference
- Complete receipt (route, times, bus, driver, passenger info, payment)
- Notice that a confirmation email has been sent
- Options to print, share, or book another trip

The HTML email (sent via Nodemailer + Gmail SMTP) includes:
- Company branding with green header
- Booking reference and route details
- Bus and driver information
- Passenger details
- MPESA payment receipt with code and amount
- Important travel instructions

---

## 5. Database Schema Summary

```sql
-- Seeded with 20 cities, 24+ routes, 8 drivers, 8 buses
-- Trips auto-generated for 14 days from setup date
-- Seats auto-generated per bus (rows × 4 seats per row)

bookings (
  id, booking_reference,   -- BUS-XXXXXXXX
  trip_id, seat_id,
  passenger_name, passenger_email, passenger_phone, passenger_id_no,
  status,                  -- 'pending' | 'confirmed' | 'cancelled'
  mpesa_code,
  confirmed_at, created_at
)
```

---

## 6. Setup & Running Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL 14+

### Database Setup
```bash
psql -U postgres -f setup.sql
```
This script creates the user, database, all tables, and seeds all initial data automatically.

### Backend Setup
```bash
cd backend
cp .env.example .env       # Edit .env with your settings
npm install
npm run dev                # Starts on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev                # Starts on port 5173
```

### Environment Variables (backend/.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=busapp_db
DB_USER=busapp_user
DB_PASSWORD=BusApp@2024#Kenya
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
MPESA_TILL_NUMBER=247247
MPESA_DUMMY_CODE=QHJ2XKTYP1
```

> **Email Note**: For Gmail, enable 2FA and generate an **App Password** under Google Account → Security → App Passwords. Email sending is optional — if not configured, the system still works but skips the email step.

---

## 7. M-PESA Code for Testing

For all booking tests, use this code at the payment step:

```
QHJ2XKTYP1
```

This is the only accepted code in the demo system. It passes all 6 validation rules.

---

*Report prepared for: Full-Stack Web Development Assignment*  
*System: Kenya Express Coaches — Bus Hiring Platform*  
*Stack: React + Node.js + PostgreSQL (3-Tier Architecture)*
