const express = require('express');
const router = express.Router();
const { Booking, Flight, Seat, Customer, Airplane, Airline } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all bookings for current user
router.get('/my-bookings', auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Getting bookings for user:', req.user.id);
    
    const customer = await Customer.findOne({ 
      where: { user_id: req.user.id },
      attributes: ['id', 'user_id'],
      transaction
    });
    
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Customer profile not found' });
    }
    
    // Get bookings with all related data
    const bookings = await Booking.findAll({
      where: { 
        customer_id: customer.id,
        status: {
          [Op.not]: 'Cancelled' // Only get non-cancelled bookings by default
        }
      },
      include: [
        {
          model: Flight,
          required: true,
          attributes: [
            'id', 'flight_number', 'origin', 'destination', 
            'departure_time', 'arrival_time'
          ],
          include: [{
            model: Airplane,
            include: [Airline]
          }]
        },
        {
          model: Seat,
          required: true,
          attributes: ['id', 'seat_number', 'seat_type', 'price']
        }
      ],
      order: [['createdAt', 'DESC']],
      transaction
    });

    await transaction.commit();
    res.json(bookings);
  } catch (error) {
    await transaction.rollback();
    console.error('Error getting bookings:', error);
    res.status(500).json({ 
      message: 'Error retrieving bookings',
      error: error.message 
    });
  }
});

// Create new booking
router.post('/', auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { flight_id, seat_id, passengers, class: bookingClass, payment_method } = req.body;
    
    if (!flight_id || !seat_id) {
      throw new Error('Missing required fields');
    }

    const customer = await Customer.findOne({ 
      where: { user_id: req.user.id },
      transaction 
    });
    
    if (!customer) {
      throw new Error('Customer profile not found');
    }

    // Verify seat availability with lock
    const seat = await Seat.findOne({
      where: {
        id: seat_id,
        flight_id,
        is_available: true
      },
      lock: true,
      transaction
    });

    if (!seat) {
      throw new Error('Seat is no longer available');
    }    // Get the current booking timestamp
    const now = new Date();

    // Create booking
    const booking = await Booking.create({
      customer_id: customer.id,
      flight_id,
      seat_id,
      passengers: passengers || 1,
      class: bookingClass,
      total_price: seat.price * (passengers || 1),
      payment_method,
      booking_date: now,
      status: 'Confirmed',
      payment_status: 'Pending'
    }, { transaction });

    // Update seat availability
    await seat.update({ is_available: false }, { transaction });

    // Get complete booking details
    const completeBooking = await Booking.findOne({
      where: { id: booking.id },
      include: [
        {
          model: Flight,
          include: [{
            model: Airplane,
            include: [Airline]
          }]
        },
        {
          model: Seat
        }
      ],
      transaction
    });

    await transaction.commit();
    res.status(201).json({
      status: 'success',
      data: completeBooking
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Booking error:', error);
    res.status(400).json({ 
      status: 'error',
      message: error.message || 'Could not create booking'
    });
  }
});

// Cancel booking
router.patch('/:id/cancel', auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const customer = await Customer.findOne({ 
      where: { user_id: req.user.id },
      transaction 
    });
    
    if (!customer) {
      throw new Error('Customer profile not found');
    }

    const booking = await Booking.findOne({
      where: {
        id: req.params.id,
        customer_id: customer.id,
        status: 'Confirmed'
      },
      include: [Flight],
      transaction,
      lock: true
    });

    if (!booking) {
      throw new Error('Booking not found or already cancelled');
    }

    // Validate cancellation timeframe
    const departureTime = new Date(booking.Flight.departure_time);
    const now = new Date();
    const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);

    if (hoursUntilDeparture < 24) {
      throw new Error('Cannot cancel booking within 24 hours of departure');
    }

    // Cancel booking and make seat available
    await booking.update({ status: 'Cancelled' }, { transaction });
    await Seat.update(
      { is_available: true },
      { 
        where: { id: booking.seat_id },
        transaction
      }
    );

    await transaction.commit();
    res.json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Cancel booking error:', error);
    res.status(400).json({ 
      status: 'error',
      message: error.message || 'Could not cancel booking'
    });
  }
});

module.exports = router;