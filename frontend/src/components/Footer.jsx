import { Bus, MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#006400] rounded-lg flex items-center justify-center">
                <Bus size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">Kenya Bus Hire</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Kenya's most trusted intercity bus booking platform. Connecting communities across the country with safe, comfortable, and affordable travel.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#006400] transition-colors">
                  <Icon size={14} className="text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['Home', '/'],
                ['Search Buses', '/search'],
                ['Popular Routes', '/search'],
                ['Track Booking', '/search'],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="hover:text-[#4ade80] transition-colors">
                    → {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-[#4ade80] mt-0.5 shrink-0" />
                <span>Kencom Bus Terminus, Moi Avenue, Nairobi, Kenya</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#4ade80] shrink-0" />
                <a href="tel:+254700000000" className="hover:text-white transition-colors">+254 700 000 000</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#4ade80] shrink-0" />
                <a href="mailto:bookings@kenyabushires.co.ke" className="hover:text-white transition-colors">bookings@kenyabushires.co.ke</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <span>© {new Date().getFullYear()} Kenya Bus Hire. All rights reserved.</span>
          <span>🇰🇪 Proudly Kenyan &nbsp;·&nbsp; Safe Travel Initiative</span>
        </div>
      </div>
    </footer>
  );
}
