const { body } = require('express-validator');

exports.validateBooking = [
  body('trip_id')
    .isInt({ min: 1 })
    .withMessage('trip_id must be a positive integer'),

  body('seat_id')
    .isInt({ min: 1 })
    .withMessage('seat_id must be a positive integer'),

  body('passenger_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be 3–100 characters'),

  body('passenger_email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),

  body('passenger_phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(\+254|0)[17]\d{8}$/)
    .withMessage('Phone must be a valid Kenyan number (e.g. 0712345678 or +254712345678)'),

  body('passenger_id_no')
    .trim()
    .notEmpty()
    .withMessage('National ID / Passport number is required')
    .isLength({ min: 5, max: 30 })
    .withMessage('ID number must be 5–30 characters'),
];
