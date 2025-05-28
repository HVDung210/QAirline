const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const flightController = require('../controllers/flightController');
const customerController = require('../controllers/customerController');
const airplaneController = require('../controllers/airplaneController');
const flightRoutes = require('./flightRoutes');

// Auth routes
router.use('/auth', authRoutes);

// Flight routes
router.use('/flights', flightRoutes);

// Booking routes
router.use('/bookings', require('./bookings'));

// Customer routes
router.get('/customers', (req, res) => customerController.getAllCustomers(req, res));
router.get('/customers/:id', (req, res) => customerController.getCustomerById(req, res));

// Airplane routes
router.get('/airplanes', airplaneController.getAirplanes);
router.get('/airplanes/:id', airplaneController.getAirplane);

module.exports = router; 