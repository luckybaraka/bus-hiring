import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BookingProvider } from './context/BookingContext.jsx';
import Navbar         from './components/Navbar.jsx';
import Footer         from './components/Footer.jsx';
import Home           from './pages/Home.jsx';
import SearchResults  from './pages/SearchResults.jsx';
import TripDetails    from './pages/TripDetails.jsx';
import PassengerDetails from './pages/PassengerDetails.jsx';
import ReceiptPreview from './pages/ReceiptPreview.jsx';
import Payment        from './pages/Payment.jsx';
import Confirmation   from './pages/Confirmation.jsx';

export default function App() {
  return (
    <BookingProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 font-body">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"                  element={<Home />} />
            <Route path="/search"            element={<SearchResults />} />
            <Route path="/trip/:id"          element={<TripDetails />} />
            <Route path="/passenger-details" element={<PassengerDetails />} />
            <Route path="/receipt-preview"   element={<ReceiptPreview />} />
            <Route path="/payment"           element={<Payment />} />
            <Route path="/confirmation"      element={<Confirmation />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: 'DM Sans, sans-serif', borderRadius: '12px' },
        }}
      />
    </BookingProvider>
  );
}
