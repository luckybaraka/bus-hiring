const db              = require('../config/database');
const { validationResult } = require('express-validator');
const { v4: uuidv4 }  = require('uuid');

/* ─── Generate booking reference ─────────────────────────── */
function generateReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'BUS-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/* ─── Create a pending booking ───────────────────────────── */
exports.createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { trip_id, seat_id, passenger_name, passenger_email,
          passenger_phone, passenger_id_no } = req.body;

  const client = await require('../config/database').pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch trip price and verify it exists + is scheduled
    const tripRes = await client.query(
      `SELECT t.price_kes, t.status, b.capacity,
              (SELECT COUNT(*) FROM bookings bk
               WHERE bk.trip_id = t.id AND bk.status = 'confirmed') AS booked
       FROM trips t JOIN buses b ON b.id = t.bus_id WHERE t.id = $1`,
      [trip_id]
    );
    if (tripRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    const trip = tripRes.rows[0];
    if (trip.status !== 'scheduled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Trip is not available for booking' });
    }
    if (parseInt(trip.booked) >= parseInt(trip.capacity)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Bus is fully booked' });
    }

    // 2. Check seat belongs to the trip's bus and is not already booked
    const seatRes = await client.query(
      `SELECT bs.id FROM bus_seats bs
       JOIN trips t ON t.bus_id = bs.bus_id
       WHERE bs.id = $1 AND t.id = $2`,
      [seat_id, trip_id]
    );
    if (seatRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Seat not valid for this trip' });
    }

    const conflictRes = await client.query(
      `SELECT id FROM bookings
       WHERE trip_id = $1 AND seat_id = $2 AND status = 'confirmed'`,
      [trip_id, seat_id]
    );
    if (conflictRes.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Seat already booked. Please choose another seat.' });
    }

    // 3. Remove any stale pending booking for same trip+seat (older than 15 min)
    await client.query(
      `DELETE FROM bookings
       WHERE trip_id = $1 AND seat_id = $2 AND status = 'pending'
         AND created_at < NOW() - INTERVAL '15 minutes'`,
      [trip_id, seat_id]
    );

    // 4. Insert pending booking
    const reference = generateReference();
    const { rows } = await client.query(
      `INSERT INTO bookings
         (booking_reference, trip_id, seat_id, passenger_name, passenger_email,
          passenger_phone, passenger_id_no, amount_kes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending')
       RETURNING *`,
      [reference, trip_id, seat_id, passenger_name, passenger_email,
       passenger_phone, passenger_id_no, trip.price_kes]
    );

    await client.query('COMMIT');

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {          // unique violation
      return res.status(409).json({ success: false, message: 'Seat already taken' });
    }
    console.error('createBooking error:', err);
    res.status(500).json({ success: false, message: 'Booking failed. Please try again.' });
  } finally {
    client.release();
  }
};

/* ─── Get booking by reference ───────────────────────────── */
exports.getBookingByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    const sql = `
      SELECT
        bk.*,
        bs.seat_number,
        bs.position AS seat_position,
        t.departure_datetime,
        t.arrival_datetime,
        t.price_kes,
        r.route_name,
        r.stops,
        oc.name  AS origin_name,
        dc.name  AS destination_name,
        b.plate_number,
        b.model  AS bus_model,
        b.bus_type,
        b.amenities,
        d.full_name        AS driver_name,
        d.phone            AS driver_phone,
        d.license_number   AS driver_license_number,
        d.years_experience AS driver_years_experience
      FROM bookings bk
      JOIN bus_seats bs ON bs.id = bk.seat_id
      JOIN trips     t  ON t.id  = bk.trip_id
      JOIN routes    r  ON r.id  = t.route_id
      JOIN cities    oc ON oc.id = r.origin_city_id
      JOIN cities    dc ON dc.id = r.destination_city_id
      JOIN buses     b  ON b.id  = t.bus_id
      JOIN drivers   d  ON d.id  = t.driver_id
      WHERE bk.booking_reference = $1
    `;

    const { rows } = await db.query(sql, [reference.toUpperCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getBookingByReference error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch booking' });
  }
};
