import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, Clock, Users, Bus, Star, ChevronRight, Filter } from 'lucide-react';
import { tripService } from '../services/api.js';
import { useBooking } from '../context/BookingContext.jsx';
import toast from 'react-hot-toast';

function fmtTime(dt) {
  return new Date(dt).toLocaleTimeString('en-KE', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Nairobi',
  });
}
function fmtDuration(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
function fmtKES(n) {
  return `KES ${parseFloat(n).toLocaleString('en-KE')}`;
}

const BUS_TYPE_BADGE = {
  VIP:     'bg-purple-100 text-purple-700',
  Luxury:  'bg-yellow-100 text-yellow-700',
  Standard:'bg-blue-100 text-blue-700',
};

export default function SearchResults() {
  const navigate     = useNavigate();
  const [params]     = useSearchParams();
  const { setSelectedTrip, setSearchParams } = useBooking();

  const [trips,   setTrips]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all'); // all | morning | afternoon | evening | night

  const from = params.get('from');
  const to   = params.get('to');
  const date = params.get('date');

  useEffect(() => {
    if (!from || !to || !date) { navigate('/'); return; }
    setLoading(true);
    tripService.search(from, to, date)
      .then(res => setTrips(res.data))
      .catch(() => toast.error('Failed to load trips. Please try again.'))
      .finally(() => setLoading(false));
  }, [from, to, date]);

  const filteredTrips = trips.filter(t => {
    const hour = new Date(t.departure_datetime).getHours();
    if (filter === 'morning')   return hour >= 5  && hour < 12;
    if (filter === 'afternoon') return hour >= 12 && hour < 17;
    if (filter === 'evening')   return hour >= 17 && hour < 21;
    if (filter === 'night')     return hour >= 21 || hour < 5;
    return true;
  });

  const handleSelect = (trip) => {
    setSelectedTrip(trip);
    navigate(`/trip/${trip.id}`);
  };

  // Find city names from first result
  const originName = trips[0]?.origin_name || '...';
  const destName   = trips[0]?.destination_name || '...';
  const fmtDate    = date ? new Date(date + 'T12:00:00').toLocaleDateString('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }) : '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-[#006400]">Home</Link>
          <ChevronRight size={14} />
          <span>Search Results</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {originName} <ArrowRight size={20} className="text-[#006400]" /> {destName}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">📅 {fmtDate} · {trips.length} trips found</p>
          </div>
          <Link to="/" className="btn-secondary !py-2 !px-4 text-sm self-start">
            ← Change Search
          </Link>
        </div>
      </div>

      {/* Time Filter Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { key: 'all',       label: 'All Times' },
          { key: 'morning',   label: '🌅 Morning (5–12)' },
          { key: 'afternoon', label: '☀️ Afternoon (12–17)' },
          { key: 'evening',   label: '🌇 Evening (17–21)' },
          { key: 'night',     label: '🌙 Night (21+)' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${filter === f.key
                ? 'bg-[#006400] text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#006400] hover:text-[#006400]'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Trip List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-[#006400] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-500">Searching available buses…</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🚌</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No buses found</h3>
          <p className="text-gray-500 mb-6">
            {trips.length === 0
              ? 'No buses are available for this route and date.'
              : `No buses match the selected time filter. Try "All Times".`}
          </p>
          <Link to="/" className="btn-primary">Search Different Route</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map(trip => (
            <TripCard key={trip.id} trip={trip} onSelect={handleSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function TripCard({ trip, onSelect }) {
  const durationMin = trip.estimated_duration_min ||
    Math.round((new Date(trip.arrival_datetime) - new Date(trip.departure_datetime)) / 60000);

  const stops = Array.isArray(trip.stops) ? trip.stops : JSON.parse(trip.stops || '[]');
  const amenities = Array.isArray(trip.amenities) ? trip.amenities : JSON.parse(trip.amenities || '[]');

  return (
    <div className="card overflow-hidden hover:shadow-card-hover transition-all duration-200 animate-fade-up">
      {/* Bus type badge bar */}
      <div className={`h-1.5 ${trip.bus_type === 'VIP' ? 'bg-purple-500' : trip.bus_type === 'Luxury' ? 'bg-yellow-400' : 'bg-blue-400'}`} />

      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Times */}
          <div className="flex items-center gap-4 flex-1">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 font-mono">{fmtTime(trip.departure_datetime)}</p>
              <p className="text-xs text-gray-500 font-medium">{trip.origin_name}</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <Clock size={11} /> {fmtDuration(durationMin)}
              </p>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-0.5 bg-gray-200" />
                <Bus size={14} className="text-[#006400]" />
                <div className="flex-1 h-0.5 bg-gray-200" />
              </div>
              {stops.length > 0 && (
                <p className="text-[10px] text-gray-400 mt-1 text-center">
                  {stops.slice(0,2).join(' · ')}{stops.length > 2 ? ` +${stops.length-2}` : ''}
                </p>
              )}
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 font-mono">{fmtTime(trip.arrival_datetime)}</p>
              <p className="text-xs text-gray-500 font-medium">{trip.destination_name}</p>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:min-w-[140px]">
            <div className="text-right">
              <p className="text-xl font-bold text-[#006400]">{fmtKES(trip.price_kes)}</p>
              <p className="text-xs text-gray-400">per person</p>
            </div>
            <button
              onClick={() => onSelect(trip)}
              className="btn-primary !py-2 !px-5 text-sm whitespace-nowrap"
            >
              Select →
            </button>
          </div>
        </div>

        {/* Bus & Seat Info */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <span className={`badge ${BUS_TYPE_BADGE[trip.bus_type] || BUS_TYPE_BADGE.Standard}`}>
            {trip.bus_type}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            🚌 {trip.plate_number} · {trip.bus_model}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Users size={12} />
            {trip.available_seats} seats available
          </span>
          {amenities.slice(0, 3).map(a => (
            <span key={a} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
              {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
