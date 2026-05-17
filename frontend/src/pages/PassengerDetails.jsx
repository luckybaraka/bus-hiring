import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, CreditCard, ArrowRight, AlertCircle } from 'lucide-react';
import { bookingService } from '../services/api.js';
import { useBooking } from '../context/BookingContext.jsx';
import toast from 'react-hot-toast';

function fmtTime(dt) {
  return new Date(dt).toLocaleTimeString('en-KE', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Nairobi',
  });
}
function fmtKES(n) {
  return `KES ${parseFloat(n).toLocaleString('en-KE')}`;
}

export default function PassengerDetails() {
  const navigate = useNavigate();
  const { selectedTrip, selectedSeat, setPassengerDetails, setPendingBooking } = useBooking();

  const [form, setForm] = useState({
    passenger_name:  '',
    passenger_email: '',
    passenger_phone: '',
    passenger_id_no: '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  // Guard: redirect if missing context
  if (!selectedTrip || !selectedSeat) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Session expired or missing data</h2>
        <p className="text-gray-500 mb-6">Please start your booking from the beginning.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.passenger_name.trim() || form.passenger_name.trim().length < 3)
      e.passenger_name = 'Full name must be at least 3 characters';
    if (!form.passenger_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.passenger_email))
      e.passenger_email = 'Enter a valid email address';
    if (!form.passenger_phone || !/^(\+254|0)[17]\d{8}$/.test(form.passenger_phone.replace(/\s/g, '')))
      e.passenger_phone = 'Enter a valid Kenyan number (e.g. 0712345678)';
    if (!form.passenger_id_no.trim() || form.passenger_id_no.trim().length < 5)
      e.passenger_id_no = 'ID/Passport number must be at least 5 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => { const x = {...prev}; delete x[field]; return x; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await bookingService.create({
        trip_id:         selectedTrip.id,
        seat_id:         selectedSeat.id,
        passenger_name:  form.passenger_name.trim(),
        passenger_email: form.passenger_email.trim().toLowerCase(),
        passenger_phone: form.passenger_phone.trim(),
        passenger_id_no: form.passenger_id_no.trim(),
      });
      setPassengerDetails(form);
      setPendingBooking(res.data);
      navigate('/receipt-preview');
    } catch (err) {
      toast.error(err.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── FORM ─────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Passenger Details</h1>
            <p className="text-sm text-gray-500 mb-6">Enter the traveller's details exactly as on their ID</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <FieldGroup
                label="Full Name"
                icon={User}
                error={errors.passenger_name}
              >
                <input
                  type="text"
                  placeholder="e.g. John Kamau Mwangi"
                  value={form.passenger_name}
                  onChange={handleChange('passenger_name')}
                  className={`input-field ${errors.passenger_name ? 'border-red-400 focus:border-red-400' : ''}`}
                />
              </FieldGroup>

              {/* Email */}
              <FieldGroup
                label="Email Address"
                icon={Mail}
                error={errors.passenger_email}
                hint="Your booking confirmation and receipt will be sent here"
              >
                <input
                  type="email"
                  placeholder="e.g. john.kamau@email.com"
                  value={form.passenger_email}
                  onChange={handleChange('passenger_email')}
                  className={`input-field ${errors.passenger_email ? 'border-red-400' : ''}`}
                />
              </FieldGroup>

              {/* Phone */}
              <FieldGroup
                label="Phone Number"
                icon={Phone}
                error={errors.passenger_phone}
                hint="Kenyan number format: 0712345678 or +254712345678"
              >
                <input
                  type="tel"
                  placeholder="e.g. 0712 345 678"
                  value={form.passenger_phone}
                  onChange={handleChange('passenger_phone')}
                  className={`input-field ${errors.passenger_phone ? 'border-red-400' : ''}`}
                />
              </FieldGroup>

              {/* ID Number */}
              <FieldGroup
                label="National ID / Passport Number"
                icon={CreditCard}
                error={errors.passenger_id_no}
                hint="Must match the ID you'll carry on travel day"
              >
                <input
                  type="text"
                  placeholder="e.g. 12345678 or A12345678"
                  value={form.passenger_id_no}
                  onChange={handleChange('passenger_id_no')}
                  className={`input-field ${errors.passenger_id_no ? 'border-red-400' : ''}`}
                />
              </FieldGroup>

              <button type="submit" disabled={loading} className="btn-primary w-full text-base mt-2 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating booking…
                  </>
                ) : (
                  <>Review Receipt <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── TRIP SUMMARY ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 border-l-4 border-[#006400]">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-4">Trip Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Route</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1">
                  {selectedTrip.origin_name}
                  <ArrowRight size={12} className="text-[#006400]" />
                  {selectedTrip.destination_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Departure</span>
                <span className="font-semibold">{fmtTime(selectedTrip.departure_datetime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Arrival</span>
                <span className="font-semibold">{fmtTime(selectedTrip.arrival_datetime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bus</span>
                <span className="font-semibold font-mono">{selectedTrip.plate_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Driver</span>
                <span className="font-semibold">{selectedTrip.driver_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Seat</span>
                <span className="font-bold text-[#006400]">
                  {selectedSeat.seat_number} ({selectedSeat.position})
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between">
                <span className="font-semibold text-gray-700">Amount to Pay</span>
                <span className="text-xl font-bold text-[#006400]">{fmtKES(selectedTrip.price_kes)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-xs font-semibold flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              Your seat will be held for 15 minutes while you complete your booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, icon: Icon, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
        <Icon size={14} className="text-[#006400]" />
        {label}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-gray-400 text-xs mt-1">{hint}</p>
      )}
    </div>
  );
}
