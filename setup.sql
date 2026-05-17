-- ============================================================
-- KENYA BUS HIRE SYSTEM - Database Setup Script
-- ============================================================
-- Database Name  : busapp_db
-- Database User  : busapp_user
-- User Password  : BusApp@2024#Kenya
-- ============================================================
-- HOW TO RUN:
--   psql -U postgres -f setup.sql
-- ============================================================

-- Force psql to read this file as UTF-8 (fixes garbled en-dashes
-- on Windows consoles that default client_encoding to WIN1252).
\encoding UTF8

\echo '============================================================'
\echo ' Kenya Bus Hire System — Database Setup Starting...'
\echo '============================================================'

-- ─────────────────────────────────────────────────────────
-- 1. CREATE USER
-- ─────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'busapp_user'
  ) THEN
    CREATE USER busapp_user WITH PASSWORD 'BusApp@2024#Kenya';
    RAISE NOTICE 'User busapp_user created.';
  ELSE
    ALTER USER busapp_user WITH PASSWORD 'BusApp@2024#Kenya';
    RAISE NOTICE 'User busapp_user already exists — password updated.';
  END IF;
END
$$;

-- ─────────────────────────────────────────────────────────
-- 2. CREATE DATABASE
-- ─────────────────────────────────────────────────────────
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'busapp_db' AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS busapp_db;
CREATE DATABASE busapp_db
  OWNER     busapp_user
  ENCODING  'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE   'en_US.UTF-8'
  TEMPLATE  template0;

GRANT ALL PRIVILEGES ON DATABASE busapp_db TO busapp_user;

\echo ' Database busapp_db created and ownership granted to busapp_user.'

-- ─────────────────────────────────────────────────────────
-- 3. CONNECT TO THE DATABASE
-- ─────────────────────────────────────────────────────────
\c busapp_db

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO busapp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES    TO busapp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO busapp_user;

-- ─────────────────────────────────────────────────────────
-- 4. CREATE TABLES
-- ─────────────────────────────────────────────────────────

-- CITIES
CREATE TABLE cities (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL UNIQUE,
  county     VARCHAR(100)  NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ROUTES
CREATE TABLE routes (
  id                      SERIAL PRIMARY KEY,
  origin_city_id          INTEGER       NOT NULL REFERENCES cities(id),
  destination_city_id     INTEGER       NOT NULL REFERENCES cities(id),
  route_name              VARCHAR(200)  NOT NULL,
  distance_km             NUMERIC(8,2)  NOT NULL,
  estimated_duration_min  INTEGER       NOT NULL,
  stops                   JSONB         NOT NULL DEFAULT '[]',
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_different_cities CHECK (origin_city_id <> destination_city_id)
);

-- DRIVERS
CREATE TABLE drivers (
  id              SERIAL PRIMARY KEY,
  full_name       VARCHAR(100) NOT NULL,
  license_number  VARCHAR(20)  NOT NULL UNIQUE,
  phone           VARCHAR(20)  NOT NULL,
  years_experience INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- BUSES
CREATE TABLE buses (
  id           SERIAL PRIMARY KEY,
  plate_number VARCHAR(20)  NOT NULL UNIQUE,
  model        VARCHAR(100) NOT NULL,
  capacity     INTEGER      NOT NULL CHECK (capacity > 0),
  bus_type     VARCHAR(50)  NOT NULL DEFAULT 'Standard',  -- Standard, Luxury, VIP
  amenities    JSONB        NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- BUS SEATS
CREATE TABLE bus_seats (
  id          SERIAL PRIMARY KEY,
  bus_id      INTEGER     NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  row_num     INTEGER     NOT NULL,
  col_letter  CHAR(1)     NOT NULL,
  position    VARCHAR(10) NOT NULL,  -- window, aisle
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bus_id, seat_number)
);

-- TRIPS
CREATE TABLE trips (
  id                 SERIAL PRIMARY KEY,
  route_id           INTEGER       NOT NULL REFERENCES routes(id),
  bus_id             INTEGER       NOT NULL REFERENCES buses(id),
  driver_id          INTEGER       NOT NULL REFERENCES drivers(id),
  departure_datetime TIMESTAMPTZ   NOT NULL,
  arrival_datetime   TIMESTAMPTZ   NOT NULL,
  price_kes          NUMERIC(10,2) NOT NULL CHECK (price_kes > 0),
  status             VARCHAR(20)   NOT NULL DEFAULT 'scheduled',
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_trip_status   CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
  CONSTRAINT chk_arrival_after CHECK (arrival_datetime > departure_datetime)
);

-- BOOKINGS
CREATE TABLE bookings (
  id                 SERIAL PRIMARY KEY,
  booking_reference  VARCHAR(25)   NOT NULL UNIQUE,
  trip_id            INTEGER       NOT NULL REFERENCES trips(id),
  seat_id            INTEGER       NOT NULL REFERENCES bus_seats(id),
  passenger_name     VARCHAR(100)  NOT NULL,
  passenger_email    VARCHAR(150)  NOT NULL,
  passenger_phone    VARCHAR(20)   NOT NULL,
  passenger_id_no    VARCHAR(30)   NOT NULL,
  amount_kes         NUMERIC(10,2) NOT NULL,
  mpesa_code         VARCHAR(20),
  status             VARCHAR(20)   NOT NULL DEFAULT 'pending',
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  confirmed_at       TIMESTAMPTZ,
  CONSTRAINT chk_booking_status CHECK (status IN ('pending','confirmed','cancelled')),
  UNIQUE (trip_id, seat_id)  -- one booking per seat per trip
);

-- ─────────────────────────────────────────────────────────
-- 5. INDEXES
-- ─────────────────────────────────────────────────────────
CREATE INDEX idx_trips_route          ON trips(route_id);
CREATE INDEX idx_trips_departure      ON trips(departure_datetime);
CREATE INDEX idx_trips_status         ON trips(status);
CREATE INDEX idx_bookings_reference   ON bookings(booking_reference);
CREATE INDEX idx_bookings_trip        ON bookings(trip_id);
CREATE INDEX idx_bookings_email       ON bookings(passenger_email);
CREATE INDEX idx_bus_seats_bus        ON bus_seats(bus_id);
CREATE INDEX idx_routes_origin        ON routes(origin_city_id);
CREATE INDEX idx_routes_destination   ON routes(destination_city_id);

-- ─────────────────────────────────────────────────────────
-- 6. SEED DATA — CITIES
-- ─────────────────────────────────────────────────────────
INSERT INTO cities (name, county) VALUES
  ('Nairobi',   'Nairobi'),
  ('Mombasa',   'Mombasa'),
  ('Kisumu',    'Kisumu'),
  ('Nakuru',    'Nakuru'),
  ('Eldoret',   'Uasin Gishu'),
  ('Thika',     'Kiambu'),
  ('Nyeri',     'Nyeri'),
  ('Meru',      'Meru'),
  ('Garissa',   'Garissa'),
  ('Malindi',   'Kilifi'),
  ('Kitale',    'Trans Nzoia'),
  ('Kericho',   'Kericho'),
  ('Kisii',     'Kisii'),
  ('Kakamega',  'Kakamega'),
  ('Voi',       'Taita-Taveta'),
  ('Embu',      'Embu'),
  ('Nanyuki',   'Laikipia'),
  ('Naivasha',  'Nakuru'),
  ('Machakos',  'Machakos'),
  ('Bungoma',   'Bungoma');

-- ─────────────────────────────────────────────────────────
-- 7. SEED DATA — ROUTES
-- ─────────────────────────────────────────────────────────
INSERT INTO routes (origin_city_id, destination_city_id, route_name, distance_km, estimated_duration_min, stops)
VALUES
  -- Nairobi ↔ Mombasa
  (1,2,'Nairobi – Mombasa Express',480,480,
   '["Machakos Junction","Mtito Andei","Voi","Mariakani"]'),
  (2,1,'Mombasa – Nairobi Express',480,480,
   '["Mariakani","Voi","Mtito Andei","Machakos Junction"]'),

  -- Nairobi ↔ Kisumu
  (1,3,'Nairobi – Kisumu Highway',350,360,
   '["Nakuru","Kericho","Kisumu"]'),
  (3,1,'Kisumu – Nairobi Highway',350,360,
   '["Kericho","Nakuru","Nairobi"]'),

  -- Nairobi ↔ Nakuru
  (1,4,'Nairobi – Nakuru Expressway',160,150,
   '["Naivasha","Gilgil"]'),
  (4,1,'Nakuru – Nairobi Expressway',160,150,
   '["Gilgil","Naivasha"]'),

  -- Nairobi ↔ Eldoret
  (1,5,'Nairobi – Eldoret Route',312,300,
   '["Nakuru","Timboroa"]'),
  (5,1,'Eldoret – Nairobi Route',312,300,
   '["Timboroa","Nakuru"]'),

  -- Nairobi ↔ Meru
  (1,8,'Nairobi – Meru Road',236,240,
   '["Thika","Embu"]'),
  (8,1,'Meru – Nairobi Road',236,240,
   '["Embu","Thika"]'),

  -- Nairobi ↔ Nyeri
  (1,7,'Nairobi – Nyeri Road',156,150,
   '["Thika","Karatina"]'),
  (7,1,'Nyeri – Nairobi Road',156,150,
   '["Karatina","Thika"]'),

  -- Mombasa ↔ Malindi
  (2,10,'Mombasa – Malindi Coast Road',119,120,
   '["Kilifi","Watamu"]'),
  (10,2,'Malindi – Mombasa Coast Road',119,120,
   '["Watamu","Kilifi"]'),

  -- Nairobi ↔ Garissa
  (1,9,'Nairobi – Garissa Road',368,360,
   '["Thika","Mwingi"]'),
  (9,1,'Garissa – Nairobi Road',368,360,
   '["Mwingi","Thika"]'),

  -- Kisumu ↔ Kakamega
  (3,14,'Kisumu – Kakamega Road',56,75,
   '["Luanda"]'),
  (14,3,'Kakamega – Kisumu Road',56,75,
   '["Luanda"]'),

  -- Nakuru ↔ Eldoret
  (4,5,'Nakuru – Eldoret Route',152,150,
   '["Timboroa","Burnt Forest"]'),
  (5,4,'Eldoret – Nakuru Route',152,150,
   '["Burnt Forest","Timboroa"]'),

  -- Nairobi ↔ Kitale
  (1,11,'Nairobi – Kitale Express',385,360,
   '["Nakuru","Eldoret"]'),
  (11,1,'Kitale – Nairobi Express',385,360,
   '["Eldoret","Nakuru"]'),

  -- Kisumu ↔ Kisii
  (3,13,'Kisumu – Kisii Road',113,120,
   '["Ahero","Awendo"]'),
  (13,3,'Kisii – Kisumu Road',113,120,
   '["Awendo","Ahero"]');

-- ─────────────────────────────────────────────────────────
-- 8. SEED DATA — DRIVERS
-- ─────────────────────────────────────────────────────────
INSERT INTO drivers (full_name, license_number, phone, years_experience) VALUES
  ('John Kamau Waweru',   'DL-001234-KE', '0712 345 678', 12),
  ('Mary Njeri Mugo',     'DL-005678-KE', '0723 456 789', 8),
  ('Peter Ochieng Otieno','DL-009012-KE', '0734 567 890', 15),
  ('Grace Wanjiku Karuri','DL-003456-KE', '0745 678 901', 6),
  ('James Mwangi Kariuki','DL-007890-KE', '0756 789 012', 20),
  ('Sarah Akinyi Onyango','DL-002345-KE', '0767 890 123', 9),
  ('David Kiplagat Korir','DL-006789-KE', '0778 901 234', 11),
  ('Rose Anyango Adhiambo','DL-001122-KE','0789 012 345', 7);

-- ─────────────────────────────────────────────────────────
-- 9. SEED DATA — BUSES
-- ─────────────────────────────────────────────────────────
INSERT INTO buses (plate_number, model, capacity, bus_type, amenities) VALUES
  ('KBZ 123A','King Long Executive 44',44,'Luxury',
   '["Air Conditioning","USB Charging","Reclining Seats","WiFi","TV Screen"]'),
  ('KCA 456B','Isuzu Comfort 33',33,'Standard',
   '["Air Conditioning","Reclining Seats","USB Charging"]'),
  ('KBX 789C','Volvo B9R Luxury 50',50,'VIP',
   '["Air Conditioning","USB Charging","Reclining Seats","WiFi","TV Screen","Onboard Restroom","Snacks Service"]'),
  ('KDD 012D','Scania K410 Premium 44',44,'Luxury',
   '["Air Conditioning","USB Charging","Reclining Seats","WiFi","Leg Rest"]'),
  ('KBE 345E','Mercedes Benz Tourismo 33',33,'Standard',
   '["Air Conditioning","Reclining Seats"]'),
  ('KCF 678F','Higer Bus KLQ6119 50',50,'Standard',
   '["Air Conditioning","USB Charging","Reclining Seats","TV Screen"]'),
  ('KBG 901G','Yutong ZK6122H Express 44',44,'Luxury',
   '["Air Conditioning","USB Charging","Reclining Seats","WiFi","TV Screen","Blankets"]'),
  ('KCH 234H','Golden Dragon XML6125 33',33,'Standard',
   '["Air Conditioning","Reclining Seats","USB Charging"]');

-- ─────────────────────────────────────────────────────────
-- 10. SEED DATA — BUS SEATS
-- ─────────────────────────────────────────────────────────
-- Generate seats for each bus using a stored function
DO $$
DECLARE
  bus_rec    RECORD;
  rows_count INTEGER;
  row_i      INTEGER;
  col_i      INTEGER;
  cols       CHAR[] := ARRAY['A','B','C','D'];
  pos        VARCHAR(10);
  seat_no    VARCHAR(10);
BEGIN
  FOR bus_rec IN SELECT id, capacity FROM buses LOOP
    rows_count := bus_rec.capacity / 4;

    FOR row_i IN 1..rows_count LOOP
      FOR col_i IN 1..4 LOOP
        seat_no := row_i::TEXT || cols[col_i];

        -- A = left window, B = left aisle, C = right aisle, D = right window
        IF cols[col_i] IN ('A','D') THEN
          pos := 'window';
        ELSE
          pos := 'aisle';
        END IF;

        INSERT INTO bus_seats (bus_id, seat_number, row_num, col_letter, position)
        VALUES (bus_rec.id, seat_no, row_i, cols[col_i], pos);
      END LOOP;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Seats generated for all buses.';
END
$$;

-- ─────────────────────────────────────────────────────────
-- 11. SEED DATA — TRIPS (next 14 days, always in future)
-- ─────────────────────────────────────────────────────────
DO $$
DECLARE
  day_offset INTEGER;
BEGIN
  FOR day_offset IN 1..14 LOOP

    -- Nairobi → Mombasa  (route 1, 8 hrs)
    INSERT INTO trips (route_id,bus_id,driver_id,departure_datetime,arrival_datetime,price_kes,status)
    VALUES
      (1,1,1, ((CURRENT_DATE + day_offset)||' 06:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 14:00:00')::timestamptz, 1500.00, 'scheduled'),
      (1,3,3, ((CURRENT_DATE + day_offset)||' 08:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 16:00:00')::timestamptz, 2500.00, 'scheduled'),
      (1,7,7, ((CURRENT_DATE + day_offset)||' 22:00:00')::timestamptz, ((CURRENT_DATE + day_offset + 1)||' 06:00:00')::timestamptz, 1800.00, 'scheduled');

    -- Mombasa → Nairobi (route 2)
    INSERT INTO trips (route_id,bus_id,driver_id,departure_datetime,arrival_datetime,price_kes,status)
    VALUES
      (2,2,2, ((CURRENT_DATE + day_offset)||' 07:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 15:00:00')::timestamptz, 1500.00, 'scheduled'),
      (2,4,4, ((CURRENT_DATE + day_offset)||' 21:00:00')::timestamptz, ((CURRENT_DATE + day_offset + 1)||' 05:00:00')::timestamptz, 1800.00, 'scheduled');

    -- Nairobi → Kisumu (route 3, 6 hrs)
    INSERT INTO trips (route_id,bus_id,driver_id,departure_datetime,arrival_datetime,price_kes,status)
    VALUES
      (3,5,5, ((CURRENT_DATE + day_offset)||' 07:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 13:00:00')::timestamptz, 1200.00, 'scheduled'),
      (3,6,6, ((CURRENT_DATE + day_offset)||' 14:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 20:00:00')::timestamptz, 1200.00, 'scheduled');

    -- Kisumu → Nairobi (route 4)
    INSERT INTO trips (route_id,bus_id,driver_id,departure_datetime,arrival_datetime,price_kes,status)
    VALUES
      (4,8,8, ((CURRENT_DATE + day_offset)||' 06:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 12:00:00')::timestamptz, 1200.00, 'scheduled');

    -- Nairobi → Nakuru (route 5, 2.5 hrs)
    INSERT INTO trips (route_id,bus_id,driver_id,departure_datetime,arrival_datetime,price_kes,status)
    VALUES
      (5,1,1, ((CURRENT_DATE + day_offset)||' 07:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 09:30:00')::timestamptz, 600.00, 'scheduled'),
      (5,2,2, ((CURRENT_DATE + day_offset)||' 10:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 12:30:00')::timestamptz, 600.00, 'scheduled'),
      (5,5,5, ((CURRENT_DATE + day_offset)||' 15:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 17:30:00')::timestamptz, 600.00, 'scheduled');

    -- Nakuru → Nairobi (route 6)
    INSERT INTO trips (route_id,bus_id,driver_id,departure_datetime,arrival_datetime,price_kes,status)
    VALUES
      (6,3,3, ((CURRENT_DATE + day_offset)||' 08:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 10:30:00')::timestamptz, 600.00, 'scheduled'),
      (6,6,6, ((CURRENT_DATE + day_offset)||' 16:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 18:30:00')::timestamptz, 600.00, 'scheduled');

    -- Nairobi → Eldoret (route 7, 5 hrs)
    INSERT INTO trips (route_id,bus_id,driver_id,departure_datetime,arrival_datetime,price_kes,status)
    VALUES
      (7,4,4, ((CURRENT_DATE + day_offset)||' 07:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 12:00:00')::timestamptz, 1000.00, 'scheduled'),
      (7,7,7, ((CURRENT_DATE + day_offset)||' 20:00:00')::timestamptz, ((CURRENT_DATE + day_offset + 1)||' 01:00:00')::timestamptz, 1000.00, 'scheduled');

    -- Mombasa → Malindi (route 13, 2 hrs)
    INSERT INTO trips (route_id,bus_id,driver_id,departure_datetime,arrival_datetime,price_kes,status)
    VALUES
      (13,8,8, ((CURRENT_DATE + day_offset)||' 09:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 11:00:00')::timestamptz, 500.00, 'scheduled'),
      (13,2,2, ((CURRENT_DATE + day_offset)||' 14:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 16:00:00')::timestamptz, 500.00, 'scheduled');

    -- Nairobi → Nyeri (route 11, 2.5 hrs)
    INSERT INTO trips (route_id,bus_id,driver_id,departure_datetime,arrival_datetime,price_kes,status)
    VALUES
      (11,5,5, ((CURRENT_DATE + day_offset)||' 08:00:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 10:30:00')::timestamptz, 700.00, 'scheduled');

    -- Nairobi → Meru (route 9, 4 hrs)
    INSERT INTO trips (route_id,bus_id,driver_id,departure_datetime,arrival_datetime,price_kes,status)
    VALUES
      (9,6,6, ((CURRENT_DATE + day_offset)||' 07:30:00')::timestamptz, ((CURRENT_DATE + day_offset)||' 11:30:00')::timestamptz, 900.00, 'scheduled');

  END LOOP;

  RAISE NOTICE 'Trips generated for next 14 days.';
END
$$;

-- ─────────────────────────────────────────────────────────
-- 12. GRANT PERMISSIONS TO busapp_user ON ALL TABLES
-- ─────────────────────────────────────────────────────────
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO busapp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO busapp_user;

\echo '============================================================'
\echo ' Setup Complete!'
\echo ' Database  : busapp_db'
\echo ' User      : busapp_user'
\echo ' Password  : BusApp@2024#Kenya'
\echo '============================================================'
\echo ' Connection string:'
\echo '   postgresql://busapp_user:BusApp@2024#Kenya@localhost:5432/busapp_db'
\echo '============================================================'
