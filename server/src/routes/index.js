const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const flightRoutes = require('./flights');
const airplaneRoutes = require('./airplanes');
const postRoutes = require('./posts');
const bookingRoutes = require('./bookings');
const customerRoutes = require('./customer');
const adminRoutes = require('./admin');
const customerController = require('../controllers/customerController');
const airplaneController = require('../controllers/airplaneController');

// API Routes
router.use('/auth', authRoutes);
router.use('/flights', flightRoutes);
router.use('/airplanes', airplaneRoutes);
router.use('/posts', postRoutes);
router.use('/bookings', bookingRoutes);
router.use('/customers', customerRoutes);
router.use('/admin', adminRoutes);

// Customer routes
router.get('/customers', (req, res) => customerController.getAllCustomers(req, res));
router.get('/customers/:id', (req, res) => customerController.getCustomerById(req, res));

// Airplane routes
router.get('/airplanes', airplaneController.getAirplanes);
router.get('/airplanes/:id', airplaneController.getAirplane);

module.exports = router; 