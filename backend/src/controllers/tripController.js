const db = require('../config/database');

/* ─── Search trips ────────────────────────────────────────
   GET /api/trips/search?from=1&to=2&date=2025-06-01
──────────────────────────────────────────────────────── */
exports.searchTrips = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({
        success: false,
        message: 'from, to, and date query params are required',
      });
    }

    const sql = `
      SELECT
        t.id,
        t.departure_datetime,
        t.arrival_datetime,
        t.price_kes,
        t.status,
        r.route_name,
        r.distance_km,
        r.estimated_duration_min,
        r.stops,
        oc.name  AS origin_name,
        oc.county AS origin_county,
        dc.name  AS destination_name,
        dc.county AS destination_county,
        b.plate_number,
        b.model      AS bus_model,
        b.capacity,
        b.bus_type,
        b.amenities,
        d.full_name  AS driver_name,
        d.license_number AS driver_license,
        d.years_experience,
        -- available seats = capacity minus confirmed bookings for this trip
        (b.capacity - COUNT(bk.id) FILTER (WHERE bk.status = 'confirmed')) AS available_seats
      FROM trips t
      JOIN routes  r  ON r.id = t.route_id
      JOIN cities  oc ON oc.id = r.origin_city_id
      JOIN cities  dc ON dc.id = r.destination_city_id
      JOIN buses   b  ON b.id  = t.bus_id
      JOIN drivers d  ON d.id  = t.driver_id
      LEFT JOIN bookings bk ON bk.trip_id = t.id
      WHERE r.origin_city_id      = $1
        AND r.destination_city_id = $2
        AND DATE(t.departure_datetime AT TIME ZONE 'Africa/Nairobi') = $3::DATE
        AND t.status = 'scheduled'
      GROUP BY
        t.id, r.route_name, r.distance_km, r.estimated_duration_min, r.stops,
        oc.name, oc.county, dc.name, dc.county,
        b.plate_number, b.model, b.capacity, b.bus_type, b.amenities,
        d.full_name, d.license_number, d.years_experience
      ORDER BY t.departure_datetime
    `;

    const { rows } = await db.query(sql, [from, to, date]);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('searchTrips error:', err);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

/* ─── Get trip by ID ─────────────────────────────────────── */
exports.getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        t.id,
        t.departure_datetime,
        t.arrival_datetime,
        t.price_kes,
        t.status,
        r.route_name,
        r.distance_km,
        r.estimated_duration_min,
        r.stops,
        oc.name  AS origin_name,
        oc.county AS origin_county,
        dc.name  AS destination_name,
        dc.county AS destination_county,
        b.plate_number,
        b.model      AS bus_model,
        b.capacity,
        b.bus_type,
        b.amenities,
        d.full_name  AS driver_name,
        d.license_number AS driver_license,
        d.phone      AS driver_phone,
        d.years_experience,
        (b.capacity - COUNT(bk.id) FILTER (WHERE bk.status = 'confirmed')) AS available_seats
      FROM trips t
      JOIN routes  r  ON r.id = t.route_id
      JOIN cities  oc ON oc.id = r.origin_city_id
      JOIN cities  dc ON dc.id = r.destination_city_id
      JOIN buses   b  ON b.id  = t.bus_id
      JOIN drivers d  ON d.id  = t.driver_id
      LEFT JOIN bookings bk ON bk.trip_id = t.id
      WHERE t.id = $1
      GROUP BY
        t.id, r.route_name, r.distance_km, r.estimated_duration_min, r.stops,
        oc.name, oc.county, dc.name, dc.county,
        b.plate_number, b.model, b.capacity, b.bus_type, b.amenities,
        d.full_name, d.license_number, d.phone, d.years_experience
    `;

    const { rows } = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getTripById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch trip' });
  }
};

/* ─── Get seats for a trip ───────────────────────────────── */
exports.getTripSeats = async (req, res) => {
  try {
    const { id } = req.params;

    // First, verify trip exists
    const tripCheck = await db.query(
      'SELECT bus_id FROM trips WHERE id = $1', [id]
    );
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const busId = tripCheck.rows[0].bus_id;

    const sql = `
      SELECT
        bs.id,
        bs.seat_number,
        bs.row_num,
        bs.col_letter,
        bs.position,
        CASE WHEN bk.id IS NOT NULL THEN true ELSE false END AS is_booked
      FROM bus_seats bs
      LEFT JOIN bookings bk
             ON bk.seat_id = bs.id
            AND bk.trip_id = $1
            AND bk.status  = 'confirmed'
      WHERE bs.bus_id = $2
      ORDER BY bs.row_num, bs.col_letter
    `;

    const { rows } = await db.query(sql, [id, busId]);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getTripSeats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch seats' });
  }
};
