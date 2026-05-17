import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Bus, User, Clock, MapPin, Wifi, Zap, Wind, Tv, Coffee, CheckCircle } from 'lucide-react';
import { tripService } from '../services/api.js';
import { useBooking } from '../context/BookingContext.jsx';
import toast from 'react-hot-toast';

function fmtTime(dt) {
  return new Date(dt).toLocaleTimeString('en-KE', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Nairobi',
  });
}
function fmtDate(dt) {
  return new Date(dt).toLocaleDateString('en-KE', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Nairobi',
  });
}
function fmtKES(n) {
  return `KES ${parseFloat(n).toLocaleString('en-KE')}`;
}

const AMENITY_ICONS = {
  'WiFi': Wifi,
  'USB Charging': Zap,
  'Air Conditioning': Wind,
  'TV Screen': Tv,
  'Snacks Service': Coffee,
};

export default function TripDetails() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { setSelectedTrip, setSelectedSeat, selectedSeat } = useBooking();

  const [trip,    setTrip]    = useState(null);
  const [seats,   setSeats]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tripService.getById(id),
      tripService.getSeats(id),
    ])
      .then(([tripRes, seatsRes]) => {
        setTrip(tripRes.data);
        setSelectedTrip(tripRes.data);
        setSeats(seatsRes.data);
      })
      .catch(() => toast.error('Failed to load trip details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSeatClick = (seat) => {
    if (seat.is_booked) return;
    setSelectedSeat(seat);
  };

  const handleContinue = () => {
    if (!selectedSeat) { toast.error('Please select a seat to continue'); return; }
    navigate('/passenger-details');
  };

  if (loading) return (
    <div className="text-center py-24">
      <div className="inline-block w-10 h-10 border-4 border-[#006400] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-gray-500">Loading trip details…</p>
    </div>
  );

  if (!trip) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Trip not found. <Link to="/" className="text-[#006400]">Go home</Link></p>
    </div>
  );

  const stops       = Array.isArray(trip.stops)     ? trip.stops     : JSON.parse(trip.stops     || '[]');
  const amenities   = Array.isArray(trip.amenities) ? trip.amenities : JSON.parse(trip.amenities || '[]');
  const durationMin = Math.round((new Date(trip.arrival_datetime) - new Date(trip.departure_datetime)) / 60000);
  const hours       = Math.floor(durationMin / 60);
  const minutes     = durationMin % 60;

  // Group seats into rows for the seat map
  const maxRow = seats.reduce((m, s) => Math.max(m, s.row_num), 0);
  const seatGrid = Array.from({ length: maxRow }, (_, i) =>
    ['A', 'B', 'C', 'D'].map(col =>
      seats.find(s => s.row_num === i + 1 && s.col_letter === col) || null
    )
  );

  const available = seats.filter(s => !s.is_booked).length;
  const occupied  = seats.filter(s =>  s.is_booked).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-[#006400]">Home</Link>
        <span>›</span>
        <button onClick={() => navigate(-1)} className="hover:text-[#006400]">Search Results</button>
        <span>›</span>
        <span className="text-gray-700">Select Seat</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── LEFT: Trip Info ──────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Route Card */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={`badge ${
                trip.bus_type === 'VIP' ? 'bg-purple-100 text-purple-700' :
                trip.bus_type === 'Luxury' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>{trip.bus_type}</div>
            </div>

            {/* Times */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold font-mono text-gray-900">{fmtTime(trip.departure_datetime)}</p>
                <p className="font-semibold text-[#006400]">{trip.origin_name}</p>
                <p className="text-xs text-gray-400">{fmtDate(trip.departure_datetime)}</p>
              </div>
              <div className="flex flex-col items-center px-2">
                <p className="text-xs text-gray-400 mb-1">{hours}h{minutes ? ` ${minutes}m` : ''}</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#006400] rounded-full" />
                  <div className="w-12 h-0.5 bg-gray-300" />
                  <ArrowRight size={14} className="text-[#006400]" />
                  <div className="w-12 h-0.5 bg-gray-300" />
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                </div>
                <p className="text-xs text-gray-400 mt-1">{stops.length} stops</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold font-mono text-gray-900">{fmtTime(trip.arrival_datetime)}</p>
                <p className="font-semibold text-red-500">{trip.destination_name}</p>
                <p className="text-xs text-gray-400">{fmtDate(trip.arrival_datetime)}</p>
              </div>
            </div>

            {/* Stops */}
            {stops.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <MapPin size={11} /> Route Stops
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{trip.origin_name}</span>
                  {stops.map(s => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{trip.destination_name}</span>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-gray-500 text-sm">Price per seat</span>
              <span className="text-2xl font-bold text-[#006400]">{fmtKES(trip.price_kes)}</span>
            </div>
          </div>

          {/* Bus & Driver */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Bus size={14} /> Bus & Driver
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plate Number</span>
                <span className="font-bold text-gray-900 font-mono">{trip.plate_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Model</span>
                <span className="font-medium text-gray-700">{trip.bus_model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Seats</span>
                <span className="font-medium text-gray-700">{trip.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Available Seats</span>
                <span className="font-bold text-[#006400]">{available} available</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#006400] rounded-full flex items-center justify-center text-white font-bold">
                    {trip.driver_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{trip.driver_name}</p>
                    <p className="text-xs text-gray-500">Driver · {trip.years_experience} yrs experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">✨ Amenities</h3>
              <div className="grid grid-cols-2 gap-2">
                {amenities.map(a => {
                  const Icon = AMENITY_ICONS[a] || CheckCircle;
                  return (
                    <div key={a} className="flex items-center gap-2 text-sm text-gray-600">
                      <Icon size={13} className="text-[#006400] shrink-0" />
                      <span>{a}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Seat Map ──────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Choose Your Seat</h2>
                <p className="text-sm text-gray-500">{available} of {trip.capacity} seats available</p>
              </div>
              {selectedSeat && (
                <div className="bg-[#006400] text-white px-3 py-1.5 rounded-xl text-sm font-semibold">
                  Seat {selectedSeat.seat_number} selected
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-5 text-xs font-medium">
              {[
                { cls: 'seat-available', label: 'Available' },
                { cls: 'seat-selected',  label: 'Your Selection' },
                { cls: 'seat-occupied',  label: 'Occupied' },
              ].map(({ cls, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 flex items-center justify-center text-[10px] ${cls}`} />
                  <span className="text-gray-600">{label}</span>
                </div>
              ))}
            </div>

            {/* Bus outline */}
            <div className="border-2 border-gray-200 rounded-2xl p-4 bg-gray-50">
              {/* Driver area */}
              <div className="flex justify-end mb-4 pr-2">
                <div className="flex items-center gap-2 bg-gray-200 px-3 py-1.5 rounded-xl text-xs text-gray-600 font-medium">
                  <User size={12} /> Driver
                </div>
              </div>

              {/* Seat rows */}
              <div className="space-y-2">
                {seatGrid.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex items-center gap-2">
                    {/* Row label */}
                    <span className="text-xs text-gray-400 w-5 text-center font-mono">{rowIdx + 1}</span>

                    {/* Left pair (A, B) */}
                    <div className="flex gap-1.5">
                      {[row[0], row[1]].map(seat => seat ? (
                        <SeatButton
                          key={seat.id}
                          seat={seat}
                          selected={selectedSeat?.id === seat.id}
                          onClick={() => handleSeatClick(seat)}
                        />
                      ) : (
                        <div key={Math.random()} className="w-9 h-9" />
                      ))}
                    </div>

                    {/* Aisle gap */}
                    <div className="w-4" />

                    {/* Right pair (C, D) */}
                    <div className="flex gap-1.5">
                      {[row[2], row[3]].map(seat => seat ? (
                        <SeatButton
                          key={seat.id}
                          seat={seat}
                          selected={selectedSeat?.id === seat.id}
                          onClick={() => handleSeatClick(seat)}
                        />
                      ) : (
                        <div key={Math.random()} className="w-9 h-9" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bus back */}
              <div className="mt-4 h-3 bg-gray-200 rounded-b-xl" />
            </div>

            {/* Seat info + CTA */}
            <div className="mt-5">
              {selectedSeat ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#006400]">Seat {selectedSeat.seat_number} ({selectedSeat.position})</p>
                    <p className="text-sm text-gray-500">Row {selectedSeat.row_num} · {
                      selectedSeat.col_letter === 'A' || selectedSeat.col_letter === 'D'
                        ? '🪟 Window seat' : '💨 Aisle seat'
                    }</p>
                  </div>
                  <span className="text-xl font-bold text-[#006400]">{fmtKES(trip.price_kes)}</span>
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm mb-4 py-3 bg-gray-50 rounded-xl">
                  Click on an available seat (green) to select it
                </p>
              )}

              <button
                onClick={handleContinue}
                disabled={!selectedSeat}
                className="btn-primary w-full text-base"
              >
                Continue to Passenger Details →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeatButton({ seat, selected, onClick }) {
  if (!seat) return null;
  const cls = selected ? 'seat-selected' : seat.is_booked ? 'seat-occupied' : 'seat-available';
  return (
    <button
      onClick={onClick}
      disabled={seat.is_booked}
      title={seat.is_booked ? `Seat ${seat.seat_number} — Occupied` : `Seat ${seat.seat_number} — ${seat.position}`}
      className={`w-9 h-9 flex items-center justify-center text-[11px] font-bold ${cls}`}
    >
      {seat.seat_number}
    </button>
  );
}
