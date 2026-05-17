const express  = require('express');
const router   = express.Router();

router.use('/cities',   require('./cities'));
router.use('/trips',    require('./trips'));
router.use('/bookings', require('./bookings'));
router.use('/payments', require('./payments'));

module.exports = router;
