const { body, validationResult } = require('express-validator');

exports.validatePayment = [
  body('userName').trim().notEmpty().withMessage('Name is required'),
  body('userEmail').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least ₹1'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
