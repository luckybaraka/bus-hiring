import { useNavigate, Link } from 'react-router-dom';
import { Printer, ArrowRight, Bus, User, MapPin, Calendar, CreditCard, Edit3 } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';

function fmtTime(dt) {
  return new Date(dt).toLocaleTimeString('en-KE', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Nairobi',
  });
}
function fmtDate(dt) {
  return new Date(dt).toLocaleDateString('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi',
  });
}
function fmtKES(n) {
  return `KES ${parseFloat(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
}

export default function ReceiptPreview() {
  const navigate = useNavigate();
  const { selectedTrip, selectedSeat, passengerDetails, pendingBooking } = useBooking();

  if (!pendingBooking || !selectedTrip || !selectedSeat || !passengerDetails) {
    return (
      <div className="text-center py-20 px-4">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No booking data found</h2>
        <p className="text-gray-500 mb-6">Please start your booking from the beginning.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  const stops = Array.isArray(selectedTrip.stops)
    ? selectedTrip.stops : JSON.parse(selectedTrip.stops || '[]');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Review Your Booking</h1>
        <p className="text-gray-500 text-sm">Please review carefully before proceeding to payment. You can go back to edit any details.</p>
      </div>

      {/* ── RECEIPT CARD ────────────────────────────────── */}
      <div className="receipt-card card overflow-hidden mb-6" id="receipt">
        {/* Header */}
        <div className="bg-[#006400] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Bus size={20} className="text-[#006400]" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Kenya Bus Hire</h2>
              <p className="text-white/70 text-xs">Booking Receipt</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs mb-0.5">Reference</p>
            <p className="font-mono font-bold text-lg tracking-widest">{pendingBooking.booking_reference}</p>
          </div>
        </div>

        {/* Dashed separator */}
        <div className="border-t-2 border-dashed border-gray-200 mx-4 my-0" />

        {/* Route */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wide">FROM</p>
              <p className="text-2xl font-bold text-gray-900">{selectedTrip.origin_name}</p>
              <p className="text-lg font-bold text-[#006400] font-mono">{fmtTime(selectedTrip.departure_datetime)}</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full gap-1 mb-1">
                <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                <ArrowRight size={18} className="text-[#006400]" />
                <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              </div>
              <p className="text-xs text-gray-400">{stops.length > 0 ? `via ${stops[0]}${stops.length > 1 ? ` +${stops.length-1}` : ''}` : 'Direct'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wide">TO</p>
              <p className="text-2xl font-bold text-gray-900">{selectedTrip.destination_name}</p>
              <p className="text-lg font-bold text-red-500 font-mono">{fmtTime(selectedTrip.arrival_datetime)}</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-3 flex items-center justify-center gap-1.5">
            <Calendar size={13} />
            {fmtDate(selectedTrip.departure_datetime)}
          </p>
        </div>

        {/* Dashed separator */}
        <div className="border-t-2 border-dashed border-gray-200 mx-4" />

        {/* Details grid */}
        <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailItem icon="🚌" label="Bus Plate" value={selectedTrip.plate_number} mono />
          <DetailItem icon="🚌" label="Bus Model" value={selectedTrip.bus_model} />
          <DetailItem icon="💺" label="Seat Number" value={`${selectedSeat.seat_number} (${selectedSeat.position})`} highlight />
          <DetailItem icon="🧑‍✈️" label="Driver" value={selectedTrip.driver_name} />
        </div>

        {/* Dashed separator */}
        <div className="border-t-2 border-dashed border-gray-200 mx-4" />

        {/* Passenger */}
        <div className="px-6 py-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <User size={12} /> Passenger Information
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Full Name</p>
              <p className="font-semibold text-gray-900">{passengerDetails.passenger_name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Email</p>
              <p className="font-semibold text-gray-900 break-all">{passengerDetails.passenger_email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Phone</p>
              <p className="font-semibold text-gray-900">{passengerDetails.passenger_phone}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">ID / Passport</p>
              <p className="font-semibold text-gray-900">{passengerDetails.passenger_id_no}</p>
            </div>
          </div>
        </div>

        {/* Dashed separator */}
        <div className="border-t-2 border-dashed border-gray-200 mx-4" />

        {/* Amount */}
        <div className="px-6 py-5 bg-green-50 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Amount Due</p>
            <p className="text-3xl font-bold text-[#006400]">{fmtKES(selectedTrip.price_kes)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Payment Method</p>
            <p className="font-bold text-gray-700 flex items-center gap-1.5">
              📱 Lipa na M-PESA
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-100">
          <p className="text-center text-yellow-700 text-sm font-medium">
            ⏳ &nbsp;Awaiting payment — Complete payment to confirm this booking
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
        >
          <Edit3 size={16} /> Edit Details
        </button>

        <button
          onClick={() => window.print()}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 no-print"
        >
          <Printer size={16} /> Print Preview
        </button>

        <button
          onClick={() => navigate('/payment')}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          Proceed to Payment <ArrowRight size={18} />
        </button>
      </div>

      <p className="text-center text-gray-400 text-xs mt-4">
        ✅ This receipt will be finalized and emailed to you once payment is confirmed.
      </p>
    </div>
  );
}

function DetailItem({ icon, label, value, mono, highlight }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{icon} {label}</p>
      <p className={`font-semibold text-sm ${
        highlight ? 'text-[#006400]' : 'text-gray-900'
      } ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  );
}
