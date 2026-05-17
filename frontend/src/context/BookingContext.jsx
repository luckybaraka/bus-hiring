import { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [searchParams, setSearchParams]       = useState(null);
  const [selectedTrip, setSelectedTrip]       = useState(null);
  const [selectedSeat, setSelectedSeat]       = useState(null);
  const [passengerDetails, setPassengerDetails] = useState(null);
  const [pendingBooking, setPendingBooking]   = useState(null); // from POST /bookings
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const resetBooking = () => {
    setSearchParams(null);
    setSelectedTrip(null);
    setSelectedSeat(null);
    setPassengerDetails(null);
    setPendingBooking(null);
    setConfirmedBooking(null);
  };

  return (
    <BookingContext.Provider value={{
      searchParams,   setSearchParams,
      selectedTrip,   setSelectedTrip,
      selectedSeat,   setSelectedSeat,
      passengerDetails, setPassengerDetails,
      pendingBooking,  setPendingBooking,
      confirmedBooking, setConfirmedBooking,
      resetBooking,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
