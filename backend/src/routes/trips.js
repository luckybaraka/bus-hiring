const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/tripController');

// GET /api/trips/search?from=1&to=2&date=2025-06-01
router.get('/search', controller.searchTrips);

// GET /api/trips/:id
router.get('/:id', controller.getTripById);

// GET /api/trips/:id/seats
router.get('/:id/seats', controller.getTripSeats);

module.exports = router;
