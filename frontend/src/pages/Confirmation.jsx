import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import {
  CheckCircle2,
  MapPin,
  Clock,
  Bus,
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Download,
  Home,
  Share2,
  Printer,
} from 'lucide-react';

export default function Confirmation() {
  const navigate = useNavigate();
  const { confirmedBooking, resetBooking } = useBooking();
  const confettiRef = useRef(false);

  useEffect(() => {
    if (!confirmedBooking) {
      navigate('/');
      return;
    }
    // Simple confetti burst using CSS animation (no lib needed)
    if (!confettiRef.current) {
      confettiRef.current = true;
    }
  }, [confirmedBooking, navigate]);

  const handleNewBooking = () => {
    resetBooking();
    navigate('/');
  };

  if (!confirmedBooking) return null;

  const b = confirmedBooking;
  const departure = b.departure_datetime ? new Date(b.departure_datetime) : null;
  const arrival = b.arrival_datetime ? new Date(b.arrival_datetime) : null;
  const formatTime = (d) => d ? d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—';
  const formatDate = (d) => d ? d.toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const stopsText = Array.isArray(b.stops) ? b.stops.join(' • ') : (b.stops || '');
  const amount = Number(b.amount_kes ?? b.price_kes ?? 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10">
      <div className="max-w-2xl mx-auto px-4">

        {/* Success Header */}
        <div className="text-center mb-8 animate-fade-up">
          {/* Animated checkmark */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-32 h-32 bg-green-100 rounded-full animate-ping opacity-30" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle2 size={48} className="text-white animate-[check_0.5s_ease-in-out]" />
            </div>
          </div>

          <h1 className="text-4xl font-display font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 text-lg">Your seat is reserved. Safe travels! 🚌</p>

          {/* Booking Reference Badge */}
          <div className="inline-flex items-center gap-3 mt-4 bg-white border-2 border-green-300 rounded-2xl px-6 py-3 shadow-md">
            <span className="text-gray-500 text-sm font-medium">Booking Reference</span>
            <span className="font-mono font-bold text-xl text-green-700 tracking-wider">{b.booking_reference}</span>
          </div>
        </div>

        {/* Email Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3 animate-fade-up">
          <Mail size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-800 text-sm">Confirmation Email Sent</p>
            <p className="text-blue-600 text-sm mt-0.5">
              A detailed receipt has been sent to <strong>{b.passenger_email}</strong>. 
              Please check your inbox (and spam folder).
            </p>
          </div>
        </div>

        {/* Main Receipt Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6 animate-fade-up" id="confirmation-card">
          
          {/* Green header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-5 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-200 text-xs uppercase tracking-wider">Kenya Express Coaches</p>
                <p className="font-display font-bold text-xl mt-1">Travel Receipt</p>
              </div>
              <div className="text-right">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  ✓ CONFIRMED
                </span>
              </div>
            </div>
          </div>

          {/* Route Section */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Journey Details</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-800">{b.origin_name}</p>
                <p className="text-green-600 font-mono font-bold text-lg">{formatTime(departure)}</p>
                <p className="text-gray-400 text-xs mt-1">Departure</p>
              </div>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-3 h-3 rounded-full border-2 border-green-600" />
                <div className="w-px flex-1 min-h-[40px] bg-gradient-to-b from-green-600 to-emerald-600" />
                <Bus size={20} className="text-green-600 my-1" />
                <div className="w-px flex-1 min-h-[40px] bg-gradient-to-b from-emerald-600 to-green-800" />
                <div className="w-3 h-3 rounded-full bg-green-800" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-2xl font-bold text-gray-800">{b.destination_name}</p>
                <p className="text-green-700 font-mono font-bold text-lg">{formatTime(arrival)}</p>
                <p className="text-gray-400 text-xs mt-1">Arrival</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
              <Calendar size={15} />
              <span>{formatDate(departure)}</span>
            </div>
            {b.route_name && (
              <div className="mt-2 flex items-center gap-2 text-gray-500 text-sm">
                <Bus size={15} />
                <span className="text-xs">{b.route_name}</span>
              </div>
            )}
            {stopsText && (
              <div className="mt-2 flex items-center gap-2 text-gray-500 text-sm">
                <MapPin size={15} />
                <span className="text-xs">Stops: {stopsText}</span>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="p-6 grid grid-cols-2 gap-4 border-b border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Bus Details</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Bus size={14} className="text-green-600" />
                  <span className="font-mono font-bold text-gray-800">{b.plate_number}</span>
                </div>
                <p className="text-gray-600 text-sm">{b.bus_model}</p>
                <p className="text-gray-500 text-xs">{b.bus_type} Class</p>
                <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  Seat {b.seat_number}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Driver</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-green-600" />
                  <span className="font-semibold text-gray-800">{b.driver_name}</span>
                </div>
                {b.driver_phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-green-600" />
                    <span className="text-gray-600 text-sm">{b.driver_phone}</span>
                  </div>
                )}
                {b.driver_license_number && (
                  <p className="text-gray-500 text-xs">License: {b.driver_license_number}</p>
                )}
                {b.driver_years_experience != null && (
                  <p className="text-gray-500 text-xs">{b.driver_years_experience} yrs experience</p>
                )}
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Passenger Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User size={15} className="text-green-600" />
                <span className="text-gray-700">{b.passenger_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-green-600" />
                <span className="text-gray-700 truncate">{b.passenger_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-green-600" />
                <span className="text-gray-700">{b.passenger_phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard size={15} className="text-green-600" />
                <span className="text-gray-700">{b.passenger_id_no}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Payment Confirmation</h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Ticket Amount</span>
              <span className="font-bold text-gray-800">KES {amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">M-PESA Code</span>
              <span className="font-mono font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                {b.mpesa_code}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-dashed border-gray-200">
              <span className="font-bold text-gray-800 text-lg">Total Paid</span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-green-700 text-xl">KES {amount.toLocaleString()}</span>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
                  PAID ✓
                </span>
              </div>
            </div>
          </div>

          {/* Barcode-like footer */}
          <div className="bg-gray-50 border-t border-dashed border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Confirmed at</p>
              <p className="text-xs font-mono text-gray-600">
                {b.confirmed_at ? new Date(b.confirmed_at).toLocaleString('en-KE') : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Issued by</p>
              <p className="text-xs font-bold text-gray-600">Kenya Express Coaches</p>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 animate-fade-up">
          <h4 className="font-bold text-amber-800 mb-3 text-sm">📋 Important Travel Information</h4>
          <ul className="space-y-2 text-amber-700 text-sm">
            <li className="flex items-start gap-2"><span className="text-amber-500 font-bold flex-shrink-0">•</span>Please arrive at the terminal at least <strong>30 minutes before departure</strong>.</li>
            <li className="flex items-start gap-2"><span className="text-amber-500 font-bold flex-shrink-0">•</span>Carry a <strong>valid national ID or passport</strong> that matches your booking.</li>
            <li className="flex items-start gap-2"><span className="text-amber-500 font-bold flex-shrink-0">•</span>Show this confirmation or your <strong>booking reference</strong> to the conductor.</li>
            <li className="flex items-start gap-2"><span className="text-amber-500 font-bold flex-shrink-0">•</span>For assistance, call us at <strong>+254 700 123 456</strong>.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4 animate-fade-up">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            <Printer size={18} />
            Print Receipt
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Bus Booking Confirmed',
                  text: `My booking is confirmed! Ref: ${b.booking_reference}. Travelling from ${b.origin_name} to ${b.destination_name}.`,
                });
              } else {
                navigator.clipboard.writeText(`Booking Ref: ${b.booking_reference}`);
                alert('Booking reference copied to clipboard!');
              }
            }}
            className="flex items-center justify-center gap-2 py-3 border-2 border-green-200 rounded-xl text-green-700 font-semibold hover:bg-green-50 transition-colors"
          >
            <Share2 size={18} />
            Share Booking
          </button>
        </div>

        <button
          onClick={handleNewBooking}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all animate-fade-up"
        >
          <Home size={22} />
          Book Another Trip
        </button>
      </div>
    </div>
  );
}
