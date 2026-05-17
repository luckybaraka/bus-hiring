const nodemailer = require('nodemailer');

/* ─── Create SMTP transporter ────────────────────────────── */
function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/* ─── Format date helpers ────────────────────────────────── */
function fmtDate(dt) {
  return new Date(dt).toLocaleDateString('en-KE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Africa/Nairobi',
  });
}

function fmtTime(dt) {
  return new Date(dt).toLocaleTimeString('en-KE', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Africa/Nairobi',
  });
}

function fmtKES(amount) {
  return `KES ${parseFloat(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
}

/* ─── HTML email template ────────────────────────────────── */
function buildEmailHTML(booking) {
  const stops = Array.isArray(booking.stops) ? booking.stops : JSON.parse(booking.stops || '[]');
  const amenities = Array.isArray(booking.amenities)
    ? booking.amenities
    : JSON.parse(booking.amenities || '[]');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Booking Confirmation – ${booking.booking_reference}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr><td align="center">

      <!-- Card -->
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);">

        <!-- Header Banner -->
        <tr>
          <td style="background:linear-gradient(135deg,#006400 0%,#228B22 60%,#32CD32 100%);padding:36px 40px;text-align:center;">
            <div style="font-size:28px;margin-bottom:4px;">🚌</div>
            <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">
              Kenya Bus Hire
            </h1>
            <p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:14px;letter-spacing:1px;text-transform:uppercase;">
              Booking Confirmation
            </p>
          </td>
        </tr>

        <!-- Status Badge -->
        <tr>
          <td style="background:#f8fffe;padding:20px 40px;border-bottom:1px solid #e8f5e9;text-align:center;">
            <span style="display:inline-block;background:#e8f5e9;color:#2e7d32;font-weight:700;font-size:13px;padding:8px 20px;border-radius:999px;letter-spacing:1px;">
              ✅ &nbsp;CONFIRMED
            </span>
            <p style="color:#555;margin:12px 0 0;font-size:13px;">
              Your ticket has been issued. Have a safe journey!
            </p>
          </td>
        </tr>

        <!-- Booking Reference -->
        <tr>
          <td style="padding:28px 40px 0;text-align:center;">
            <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Booking Reference</p>
            <p style="font-size:28px;font-weight:900;letter-spacing:3px;color:#006400;margin:0;font-family:monospace;">
              ${booking.booking_reference}
            </p>
          </td>
        </tr>

        <!-- Divider with Bus Icon -->
        <tr>
          <td style="padding:24px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-top:2px dashed #c8e6c9;width:45%;"></td>
                <td style="text-align:center;width:10%;font-size:20px;padding:0 8px;">🎟️</td>
                <td style="border-top:2px dashed #c8e6c9;width:45%;"></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Route Info -->
        <tr>
          <td style="padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fffe;border-radius:12px;padding:20px;border:1px solid #c8e6c9;">
              <tr>
                <td style="text-align:center;width:40%;">
                  <p style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">FROM</p>
                  <p style="font-size:22px;font-weight:800;color:#1a1a2e;margin:0;">${booking.origin_name}</p>
                  <p style="color:#006400;font-weight:700;font-size:16px;margin:4px 0 0;">${fmtTime(booking.departure_datetime)}</p>
                </td>
                <td style="text-align:center;width:20%;">
                  <div style="font-size:24px;">→</div>
                  <p style="color:#888;font-size:11px;margin:4px 0 0;">${Math.round(
                    (new Date(booking.arrival_datetime) - new Date(booking.departure_datetime)) / 60000
                  )} mins</p>
                </td>
                <td style="text-align:center;width:40%;">
                  <p style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">TO</p>
                  <p style="font-size:22px;font-weight:800;color:#1a1a2e;margin:0;">${booking.destination_name}</p>
                  <p style="color:#006400;font-weight:700;font-size:16px;margin:4px 0 0;">${fmtTime(booking.arrival_datetime)}</p>
                </td>
              </tr>
              <tr>
                <td colspan="3" style="text-align:center;padding-top:12px;border-top:1px dashed #c8e6c9;margin-top:12px;">
                  <p style="color:#555;font-size:13px;margin:0;">
                    📅 &nbsp;<strong>${fmtDate(booking.departure_datetime)}</strong>
                  </p>
                  ${stops.length ? `<p style="color:#888;font-size:12px;margin:6px 0 0;">Stops: ${stops.join(' → ')}</p>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Two-column: Passenger & Bus Info -->
        <tr>
          <td style="padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr valign="top">

                <!-- Passenger Details -->
                <td width="48%" style="background:#fafafa;border-radius:10px;padding:18px;border:1px solid #eee;">
                  <p style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;margin:0 0 14px;font-weight:700;">
                    👤 Passenger
                  </p>
                  <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#1a1a2e;">${booking.passenger_name}</p>
                  <p style="margin:0 0 4px;font-size:13px;color:#555;">📧 ${booking.passenger_email}</p>
                  <p style="margin:0 0 4px;font-size:13px;color:#555;">📱 ${booking.passenger_phone}</p>
                  <p style="margin:0;font-size:13px;color:#555;">🪪 ID: ${booking.passenger_id_no}</p>
                  <p style="margin:12px 0 0;font-size:14px;color:#006400;font-weight:700;">
                    💺 Seat ${booking.seat_number}
                    <span style="font-size:12px;color:#888;font-weight:400;">(${booking.seat_position})</span>
                  </p>
                </td>

                <td width="4%"></td>

                <!-- Bus & Driver Details -->
                <td width="48%" style="background:#fafafa;border-radius:10px;padding:18px;border:1px solid #eee;">
                  <p style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;margin:0 0 14px;font-weight:700;">
                    🚌 Bus Details
                  </p>
                  <p style="margin:0 0 4px;font-size:13px;color:#555;">
                    <strong>Plate:</strong> ${booking.plate_number}
                  </p>
                  <p style="margin:0 0 4px;font-size:13px;color:#555;">
                    <strong>Model:</strong> ${booking.bus_model}
                  </p>
                  <p style="margin:0 0 4px;font-size:13px;color:#555;">
                    <strong>Class:</strong> ${booking.bus_type}
                  </p>
                  <p style="margin:12px 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:700;">
                    🧑‍✈️ Driver
                  </p>
                  <p style="margin:0;font-size:13px;color:#555;">${booking.driver_name}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Payment Info -->
        <tr>
          <td style="padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8f5e9;border-radius:10px;padding:18px;border:1px solid #c8e6c9;">
              <tr>
                <td>
                  <p style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#2e7d32;margin:0 0 12px;font-weight:700;">
                    💳 Payment Receipt
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#555;font-size:13px;">Amount Paid</td>
                      <td style="text-align:right;font-size:18px;font-weight:800;color:#006400;">${fmtKES(booking.amount_kes)}</td>
                    </tr>
                    <tr>
                      <td style="color:#555;font-size:13px;padding-top:6px;">M-PESA Code</td>
                      <td style="text-align:right;font-size:14px;font-weight:700;color:#1a1a2e;font-family:monospace;padding-top:6px;">${booking.mpesa_code}</td>
                    </tr>
                    <tr>
                      <td style="color:#555;font-size:13px;padding-top:6px;">Payment Method</td>
                      <td style="text-align:right;font-size:13px;color:#555;padding-top:6px;">Lipa na M-PESA</td>
                    </tr>
                    <tr>
                      <td style="color:#555;font-size:13px;padding-top:6px;">Status</td>
                      <td style="text-align:right;padding-top:6px;">
                        <span style="background:#2e7d32;color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;">PAID</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Important Notes -->
        <tr>
          <td style="padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border-radius:10px;padding:16px 20px;border:1px solid #ffe082;">
              <tr>
                <td>
                  <p style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#f57f17;margin:0 0 10px;font-weight:700;">
                    ⚠️ Important Information
                  </p>
                  <ul style="margin:0;padding-left:18px;color:#555;font-size:13px;line-height:1.8;">
                    <li>Please arrive at the bus station at least <strong>30 minutes</strong> before departure.</li>
                    <li>Carry a valid National ID or Passport matching your booking details.</li>
                    <li>This ticket is non-transferable and non-refundable after 2 hours of booking.</li>
                    <li>Present this email or your booking reference <strong>${booking.booking_reference}</strong> at boarding.</li>
                    <li>Luggage limit: 20 kg. Excess luggage will be charged at the terminal.</li>
                  </ul>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1a1a2e;padding:24px 40px;text-align:center;">
            <p style="color:#aaa;font-size:13px;margin:0 0 8px;">
              Need help? Contact us at
              <a href="mailto:${process.env.COMPANY_EMAIL || 'bookings@kenyabushires.co.ke'}" style="color:#4caf50;text-decoration:none;">
                ${process.env.COMPANY_EMAIL || 'bookings@kenyabushires.co.ke'}
              </a>
              or call
              <a href="tel:${process.env.COMPANY_PHONE || '+254700000000'}" style="color:#4caf50;text-decoration:none;">
                ${process.env.COMPANY_PHONE || '+254 700 000 000'}
              </a>
            </p>
            <p style="color:#666;font-size:12px;margin:0;">
              © ${new Date().getFullYear()} Kenya Bus Hire. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;
}

/* ─── Send confirmation email ────────────────────────────── */
exports.sendConfirmationEmail = async (booking) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️  Email not configured — skipping email send. Set EMAIL_USER and EMAIL_PASS in .env');
      return;
    }

    const transporter = createTransporter();
    const html        = buildEmailHTML(booking);

    const info = await transporter.sendMail({
      from:    process.env.EMAIL_FROM || `Kenya Bus Hire <${process.env.EMAIL_USER}>`,
      to:      booking.passenger_email,
      subject: `✅ Booking Confirmed – ${booking.booking_reference} | Kenya Bus Hire`,
      html,
      text: `Your booking ${booking.booking_reference} is confirmed.\n`
          + `Route: ${booking.origin_name} → ${booking.destination_name}\n`
          + `Departure: ${fmtDate(booking.departure_datetime)} at ${fmtTime(booking.departure_datetime)}\n`
          + `Seat: ${booking.seat_number}\n`
          + `Amount: KES ${booking.amount_kes}\n`
          + `M-PESA Code: ${booking.mpesa_code}\n`,
    });

    console.log(`📧  Email sent to ${booking.passenger_email} — Message ID: ${info.messageId}`);
  } catch (err) {
    console.error('Email error:', err.message);
    throw err;
  }
};

/* ─── Helper re-exports (used in email template) ─────────── */
function fmtDate(dt) {
  return new Date(dt).toLocaleDateString('en-KE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Africa/Nairobi',
  });
}
function fmtTime(dt) {
  return new Date(dt).toLocaleTimeString('en-KE', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Africa/Nairobi',
  });
}
