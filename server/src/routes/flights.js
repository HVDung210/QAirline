const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { validateFlight } = require('../utils/validators');
const { adminAuth } = require('../middleware/auth');

// Public routes
router.get('/search', flightController.searchFlights);
router.get('/:id', flightController.getFlightDetails);
router.get('/:id/seats', flightController.getAvailableSeats);

// Admin routes
router.post('/', adminAuth, validateFlight, flightController.createFlight);
router.put('/:id', adminAuth, validateFlight, flightController.updateFlight);
router.delete('/:id', adminAuth, flightController.deleteFlight);

module.exports = router; 