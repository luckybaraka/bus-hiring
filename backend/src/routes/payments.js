const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/paymentController');

// POST /api/payments/validate
router.post('/validate', controller.validatePayment);

module.exports = router;
