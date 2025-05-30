const { body, validationResult } = require('express-validator');
const { User, Flight, Booking, Post } = require('../models');
const { Op } = require('sequelize');

// Auth validators
exports.validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail()
    .custom(async (value) => {
      const user = await User.findOne({ where: { email: value } });
      if (user) {
        throw new Error('Email đã được đăng ký');
      }
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('first_name').notEmpty().withMessage('Họ không được bỏ trống'),
  body('last_name').notEmpty().withMessage('Tên không được bỏ trống'),
  body('date_of_birth').isDate().withMessage('Ngày sinh không hợp lệ'),
  body('country_name').notEmpty().withMessage('Tên quốc gia không được bỏ trống'),
  body('address').notEmpty().withMessage('Địa chỉ không được bỏ trống'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateLogin = [
  body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('password').notEmpty().withMessage('Mật khẩu không được bỏ trống'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Flight validators
exports.validateFlight = [
  body('flight_number')
    .notEmpty()
    .withMessage('Số hiệu chuyến bay không được bỏ trống')
    .custom(async (value) => {
      const flight = await Flight.findOne({ where: { flight_number: value } });
      if (flight) {
        throw new Error('Số hiệu chuyến bay đã tồn tại');
      }
    }),
  body('origin').notEmpty().withMessage('Điểm đi không được bỏ trống'),
  body('destination').notEmpty().withMessage('Điểm đến không được bỏ trống'),
  body('departure_time').isISO8601().withMessage('Thời gian khởi hành không hợp lệ'),
  body('arrival_time').isISO8601().withMessage('Thời gian đến không hợp lệ'),
  body('airplane_id').isInt().withMessage('ID máy bay không hợp lệ'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Flight update validators - allows partial updates
exports.validateFlightUpdate = [
  body('flight_number')
    .optional()
    .notEmpty()
    .withMessage('Số hiệu chuyến bay không được bỏ trống'),
  body('origin')
    .optional()
    .notEmpty()
    .withMessage('Điểm đi không được bỏ trống'),
  body('destination')
    .optional()
    .notEmpty()
    .withMessage('Điểm đến không được bỏ trống'),
  body('departure_time')
    .optional()
    .isISO8601()
    .withMessage('Thời gian khởi hành không hợp lệ'),
  body('arrival_time')
    .optional()
    .isISO8601()
    .withMessage('Thời gian đến không hợp lệ')
    .custom((value, { req }) => {
      if (value && req.body.departure_time && new Date(value) <= new Date(req.body.departure_time)) {
        throw new Error('Thời gian đến phải sau thời gian khởi hành');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['Scheduled', 'Delayed'])
    .withMessage('Trạng thái không hợp lệ'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Booking validators
exports.validateBooking = [
  body('flight_id').isInt().withMessage('ID chuyến bay không hợp lệ'),
  body('seat_id').isInt().withMessage('ID ghế không hợp lệ'),
  body('passengers')
    .isInt({ min: 1 })
    .withMessage('Số hành khách phải lớn hơn 0'),
  body('class')
    .isIn(['Economy', 'Premium'])
    .withMessage('Hạng vé không hợp lệ'),
  body('payment_method')
    .isIn(['Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal', 'Cash'])
    .withMessage('Phương thức thanh toán không hợp lệ'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Post validators
exports.validatePost = [
  body('title').notEmpty().withMessage('Tiêu đề không được bỏ trống'),
  body('content').notEmpty().withMessage('Nội dung không được bỏ trống'),
  body('post_type')
    .isIn(['introduction', 'promotion', 'announcement', 'news'])
    .withMessage('Loại bài viết không hợp lệ'),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Ngày bắt đầu không hợp lệ'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Ngày kết thúc không hợp lệ')
    .custom((value, { req }) => {
      if (value && req.body.start_date && new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
]; 