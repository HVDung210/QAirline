const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

router.get('/dashboard', adminAuth, adminController.getDashboard);
router.get('/users', adminAuth, adminController.getUsers);
router.get('/flights', adminAuth, adminController.getFlights);
router.get('/bookings', adminAuth, adminController.getBookings);
router.get('/posts', adminAuth, adminController.getPosts);

module.exports = router; 