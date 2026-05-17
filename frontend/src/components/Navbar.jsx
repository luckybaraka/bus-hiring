import { Link, useLocation } from 'react-router-dom';
import { Bus, Phone, Mail } from 'lucide-react';

const steps = [
  { path: '/search',            label: 'Search' },
  { path: '/trip/',             label: 'Select Trip' },
  { path: '/passenger-details', label: 'Details' },
  { path: '/receipt-preview',   label: 'Review' },
  { path: '/payment',           label: 'Payment' },
  { path: '/confirmation',      label: 'Confirmed' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const isHome       = pathname === '/';

  const currentStep = steps.findIndex(s => pathname.startsWith(s.path));

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-[#006400] text-white text-xs py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="opacity-80">🇰🇪 &nbsp;Kenya's Most Reliable Bus Booking Service</span>
          <div className="hidden sm:flex items-center gap-4 opacity-80">
            <span className="flex items-center gap-1"><Phone size={11}/> +254 700 000 000</span>
            <span className="flex items-center gap-1"><Mail size={11}/> bookings@kenyabushires.co.ke</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-[#006400] rounded-xl flex items-center justify-center shadow-md group-hover:bg-[#005000] transition-colors">
              <Bus size={20} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-[#1a1a2e] leading-none block">
                Kenya Bus Hire
              </span>
              <span className="text-[10px] text-gray-400 tracking-wide leading-none">
                Book · Travel · Arrive
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#006400] transition-colors font-medium">Home</Link>
            <Link to="/search" className="hover:text-[#006400] transition-colors font-medium">All Routes</Link>
            <a href="tel:+254700000000" className="btn-primary !py-2 !px-4 !text-sm">
              📞 Call Us
            </a>
          </div>
        </div>
      </nav>

      {/* Booking progress bar — shown outside home */}
      {!isHome && currentStep >= 0 && (
        <div className="bg-white border-b border-gray-100 py-3 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => (
                <div key={step.path} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${idx < currentStep  ? 'bg-[#006400] text-white' : ''}
                      ${idx === currentStep ? 'bg-[#006400] text-white ring-4 ring-[#006400]/20' : ''}
                      ${idx > currentStep  ? 'bg-gray-100 text-gray-400' : ''}
                    `}>
                      {idx < currentStep ? '✓' : idx + 1}
                    </div>
                    <span className={`text-[10px] mt-1 font-medium whitespace-nowrap
                      ${idx <= currentStep ? 'text-[#006400]' : 'text-gray-400'}
                    `}>
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all
                      ${idx < currentStep ? 'bg-[#006400]' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
