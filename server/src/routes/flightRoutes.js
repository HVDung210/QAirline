const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

// Search flights
router.get('/search', flightController.searchFlights);

// Get all flights
router.get('/', flightController.getAllFlights);

// Get flight by ID
router.get('/:id', flightController.getFlightById);

// Get available seats for a flight
router.get('/:id/seats', flightController.getAvailableSeats);

module.exports = router; 