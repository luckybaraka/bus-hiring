const db           = require('../config/database');
const emailService = require('../utils/emailService');

// ─── MPESA validation constants ───────────────────────────
const MPESA_VALID_CODE  = (process.env.MPESA_DUMMY_CODE || 'QHJ2XKTYP1').toUpperCase();
const MPESA_TILL_NUMBER = process.env.MPESA_TILL_NUMBER || '247247';

/* ─── Validate MPESA code format ─────────────────────────── */
function validateCodeFormat(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, message: 'M-PESA code is required' };
  }

  const cleaned = code.trim().toUpperCase();

  // Rule 1: Exactly 10 characters
  if (cleaned.length !== 10) {
    return {
      valid: false,
      message: `M-PESA code must be exactly 10 characters. You entered ${cleaned.length}.`,
    };
  }

  // Rule 2: Alphanumeric only — A-Z and 0-9
  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    return {
      valid: false,
      message: 'M-PESA code must contain only letters (A–Z) and numbers (0–9). No spaces or symbols.',
    };
  }

  // Rule 3: Must start with a letter
  if (!/^[A-Z]/.test(cleaned)) {
    return {
      valid: false,
      message: 'M-PESA code must start with a letter.',
    };
  }

  // Rule 4: Must contain at least 2 digits
  const digits = cleaned.replace(/[^0-9]/g, '');
  if (digits.length < 2) {
    return {
      valid: false,
      message: 'M-PESA code must contain at least 2 numeric digits.',
    };
  }

  // Rule 5: Must contain at least 4 letters
  const letters = cleaned.replace(/[^A-Z]/g, '');
  if (letters.length < 4) {
    return {
      valid: false,
      message: 'M-PESA code must contain at least 4 letters.',
    };
  }

  return { valid: true, cleaned };
}

/* ─── POST /api/payments/validate ───────────────────────── */
exports.validatePayment = async (req, res) => {
  try {
    const { booking_reference, mpesa_code } = req.body;

    if (!booking_reference) {
      return res.status(400).json({ success: false, message: 'booking_reference is required' });
    }

    // ── Step 1: Format validation ─────────────────────────
    const formatCheck = validateCodeFormat(mpesa_code);
    if (!formatCheck.valid) {
      return res.status(400).json({ success: false, message: formatCheck.message });
    }

    const cleanCode = formatCheck.cleaned;

    // ── Step 2: Code authenticity check (demo — one accepted code) ──
    if (cleanCode !== MPESA_VALID_CODE) {
      return res.status(400).json({
        success: false,
        message: 'Transaction code not found in M-PESA records. Please verify the code and try again.',
      });
    }

    // ── Step 3: Fetch booking ─────────────────────────────
    const bookingRef = booking_reference.trim().toUpperCase();
    const bookingRes = await db.query(
      `SELECT bk.*, bs.seat_number, bs.position AS seat_position,
              t.departure_datetime, t.arrival_datetime, t.price_kes,
              r.route_name, r.stops,
              oc.name AS origin_name, dc.name AS destination_name,
              b.plate_number, b.model AS bus_model, b.bus_type, b.amenities,
              d.full_name AS driver_name, d.phone AS driver_phone,
              d.license_number AS driver_license_number,
              d.years_experience AS driver_years_experience
       FROM bookings bk
       JOIN bus_seats bs ON bs.id = bk.seat_id
       JOIN trips     t  ON t.id  = bk.trip_id
       JOIN routes    r  ON r.id  = t.route_id
       JOIN cities    oc ON oc.id = r.origin_city_id
       JOIN cities    dc ON dc.id = r.destination_city_id
       JOIN buses     b  ON b.id  = t.bus_id
       JOIN drivers   d  ON d.id  = t.driver_id
       WHERE bk.booking_reference = $1`,
      [bookingRef]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking reference not found' });
    }

    const booking = bookingRes.rows[0];

    if (booking.status === 'confirmed') {
      return res.status(409).json({ success: false, message: 'This booking is already confirmed' });
    }

    if (booking.status === 'cancelled') {
      return res.status(409).json({ success: false, message: 'This booking has been cancelled' });
    }

    // ── Step 4: Confirm the booking ───────────────────────
    const updateRes = await db.query(
      `UPDATE bookings
       SET status = 'confirmed', mpesa_code = $1, confirmed_at = NOW()
       WHERE booking_reference = $2
       RETURNING confirmed_at`,
      [cleanCode, bookingRef]
    );

    const confirmedBooking = {
      ...booking,
      status: 'confirmed',
      mpesa_code: cleanCode,
      confirmed_at: updateRes.rows[0].confirmed_at,
    };

    // ── Step 5: Send confirmation email (non-blocking) ────
    emailService.sendConfirmationEmail(confirmedBooking).catch((err) => {
      console.error('Email delivery failed (non-fatal):', err.message);
    });

    res.json({
      success: true,
      message: 'Payment confirmed! Your booking is now active.',
      data: confirmedBooking,
    });
  } catch (err) {
    console.error('validatePayment error:', err);
    res.status(500).json({ success: false, message: 'Payment validation failed. Please try again.' });
  }
};
