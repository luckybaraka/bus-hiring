import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor – unwrap data or throw error message
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg =
      err.response?.data?.message ||
      err.response?.data?.errors?.[0]?.msg ||
      err.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(msg));
  }
);

export const cityService = {
  getAll: () => api.get('/cities'),
};

export const tripService = {
  search:   (from, to, date) => api.get(`/trips/search?from=${from}&to=${to}&date=${date}`),
  getById:  (id)             => api.get(`/trips/${id}`),
  getSeats: (id)             => api.get(`/trips/${id}/seats`),
};

export const bookingService = {
  create:       (data) => api.post('/bookings', data),
  getByReference: (ref) => api.get(`/bookings/${ref}`),
};

export const paymentService = {
  validate: (bookingReference, mpesaCode) =>
    api.post('/payments/validate', {
      booking_reference: bookingReference,
      mpesa_code:        mpesaCode,
    }),
};

export default api;
