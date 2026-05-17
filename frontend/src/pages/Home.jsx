import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, Search, Shield, Clock, Star, Users } from 'lucide-react';
import { cityService } from '../services/api.js';
import { useBooking } from '../context/BookingContext.jsx';
import toast from 'react-hot-toast';

const POPULAR_ROUTES = [
  { from: 'Nairobi', to: 'Mombasa', price: 'From KES 1,500', duration: '8 hrs', emoji: '🌊' },
  { from: 'Nairobi', to: 'Kisumu',  price: 'From KES 1,200', duration: '6 hrs', emoji: '🌊' },
  { from: 'Nairobi', to: 'Nakuru',  price: 'From KES 600',   duration: '2.5 hrs', emoji: '🦒' },
  { from: 'Nairobi', to: 'Eldoret', price: 'From KES 1,000', duration: '5 hrs', emoji: '🏔️' },
  { from: 'Nairobi', to: 'Meru',    price: 'From KES 900',   duration: '4 hrs', emoji: '🌿' },
  { from: 'Mombasa', to: 'Malindi', price: 'From KES 500',   duration: '2 hrs', emoji: '🏖️' },
];

const FEATURES = [
  { icon: Shield, title: 'Safe & Verified',   desc: 'All drivers licensed & buses regularly inspected' },
  { icon: Clock,  title: 'On-Time Guarantee', desc: 'Real-time tracking and punctual departures' },
  { icon: Star,   title: 'Top Rated',         desc: 'Rated 4.8/5 by over 50,000 travellers' },
  { icon: Users,  title: '500K+ Passengers',  desc: 'Trusted by Kenyans across 20 cities' },
];

export default function Home() {
  const navigate   = useNavigate();
  const { setSearchParams } = useBooking();

  const [cities, setCities]   = useState([]);
  const [form, setForm]       = useState({ from: '', to: '', date: '' });
  const [loading, setLoading] = useState(false);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setForm(f => ({ ...f, date: tomorrow.toISOString().split('T')[0] }));
  }, []);

  useEffect(() => {
    cityService.getAll().then(res => setCities(res.data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.date) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.from === form.to) {
      toast.error('Origin and destination cannot be the same');
      return;
    }
    setSearchParams(form);
    navigate(`/search?from=${form.from}&to=${form.to}&date=${form.date}`);
  };

  const handleQuickRoute = (from, to) => {
    const fromCity = cities.find(c => c.name === from);
    const toCity   = cities.find(c => c.name === to);
    if (!fromCity || !toCity) { toast.error('Loading cities…'); return; }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = tomorrow.toISOString().split('T')[0];
    setSearchParams({ from: fromCity.id, to: toCity.id, date });
    navigate(`/search?from=${fromCity.id}&to=${toCity.id}&date=${date}`);
  };

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero-gradient min-h-[92vh] flex items-center">
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#006400]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-white/20">
              <span className="text-yellow-300">🇰🇪</span>
              <span>Connecting Kenya, One Journey at a Time</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-black text-white leading-[1.1] mb-4">
              Your Journey,<br />
              <span className="text-yellow-300">Your Way.</span>
            </h1>
            <p className="text-white/80 text-lg mb-10 leading-relaxed">
              Book intercity buses across Kenya in seconds. Comfortable seats, verified drivers, on-time departures — all in one place.
            </p>

            {/* ── SEARCH CARD ──────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 animate-fade-up">
              <h2 className="text-gray-700 font-semibold text-sm uppercase tracking-wider mb-4">
                🔍 Find Available Buses
              </h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* From */}
                  <div className="relative">
                    <label className="block text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">
                      From
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#006400]" />
                      <select
                        value={form.from}
                        onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                        className="input-field pl-9 appearance-none"
                        required
                      >
                        <option value="">Select origin</option>
                        {cities.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* To */}
                  <div className="relative">
                    <label className="block text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">
                      To
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                      <select
                        value={form.to}
                        onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                        className="input-field pl-9 appearance-none"
                        required
                      >
                        <option value="">Select destination</option>
                        {cities.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">
                      Travel Date
                    </label>
                    <div className="relative">
                      <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#006400]" />
                      <input
                        type="date"
                        value={form.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        className="input-field pl-9"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full text-base flex items-center justify-center gap-2">
                  <Search size={18} />
                  Search Available Buses
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm py-3 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-white/80 text-sm">
            {['500K+ Passengers', '20 Cities', '50+ Routes', '4.8★ Rating'].map(s => (
              <span key={s} className="font-medium">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Kenya Bus Hire?</h2>
            <p className="text-gray-500 mt-2">Everything you need for a comfortable journey</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors group">
                <div className="w-12 h-12 bg-[#006400] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ──────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Routes</h2>
              <p className="text-gray-500 mt-1">Most travelled routes across Kenya</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_ROUTES.map((route) => (
              <button
                key={`${route.from}-${route.to}`}
                onClick={() => handleQuickRoute(route.from, route.to)}
                className="card p-5 text-left hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 group w-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{route.emoji}</span>
                  <span className="badge-green">{route.duration}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-gray-900">{route.from}</span>
                  <ArrowRight size={16} className="text-[#006400] group-hover:translate-x-1 transition-transform" />
                  <span className="font-bold text-gray-900">{route.to}</span>
                </div>
                <p className="text-[#006400] font-semibold text-sm">{route.price}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">How It Works</h2>
          <p className="text-gray-500 mb-12">Book your seat in 4 simple steps</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { n: '1', icon: '🔍', title: 'Search',        desc: 'Enter your route and travel date' },
              { n: '2', icon: '💺', title: 'Pick a Seat',   desc: 'Choose from available seats on the bus' },
              { n: '3', icon: '📝', title: 'Fill Details',  desc: 'Enter your passenger information' },
              { n: '4', icon: '📱', title: 'Pay via MPESA', desc: 'Pay with Lipa na MPESA and get your e-ticket' },
            ].map(step => (
              <div key={step.n} className="relative">
                {step.n !== '4' && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-dashed bg-green-200 -translate-x-1/2 z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-50 border-2 border-green-200 rounded-2xl flex items-center justify-center text-2xl mb-3">
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-[#006400] mb-1">STEP {step.n}</span>
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
