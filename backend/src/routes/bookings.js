const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/bookingController');
const { validateBooking } = require('../middleware/validators');

// POST /api/bookings  — create pending booking
router.post('/', validateBooking, controller.createBooking);

// GET  /api/bookings/:reference — fetch booking by reference
router.get('/:reference', controller.getBookingByReference);

module.exports = router;
