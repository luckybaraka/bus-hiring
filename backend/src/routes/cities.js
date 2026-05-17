const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/cityController');

router.get('/', controller.getAllCities);

module.exports = router;
