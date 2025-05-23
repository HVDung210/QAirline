const express = require('express');
const router = express.Router();
const airplaneController = require('../controllers/airplaneController');
const { adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', airplaneController.getAirplanes);
router.get('/:id', airplaneController.getAirplane);

// Admin routes
router.post('/', adminAuth, airplaneController.createAirplane);
router.put('/:id', adminAuth, airplaneController.updateAirplane);
router.delete('/:id', adminAuth, airplaneController.deleteAirplane);

module.exports = router; 