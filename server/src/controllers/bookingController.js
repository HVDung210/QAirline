const { Booking, Flight, Seat, Customer, Airplane, Airline } = require('../models');
const sequelize = require('../config/database');

exports.createBooking = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { flight_id, seat_id, passengers, class: seatClass } = req.body;
    
    if (!flight_id || !seat_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Kiểm tra ghế có available không
    const seat = await Seat.findOne({
      where: { 
        id: seat_id,
        flight_id,
        is_available: true 
      },
      transaction: t
    });

    if (!seat) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Seat is no longer available'
      });
    }

    // Tạo booking
    const booking = await Booking.create({
      user_id: req.user.id,
      flight_id,
      seat_id,
      passengers,
      class: seatClass,
      total_price: seat.price * passengers,
      status: 'Confirmed'
    }, { transaction: t });

    // Cập nhật trạng thái ghế
    await seat.update({ is_available: false }, { transaction: t });

    await t.commit();

    // Load booking với đầy đủ thông tin
    const fullBooking = await Booking.findOne({
      where: { id: booking.id },
      include: [{
        model: Flight,
        include: [{
          model: Airplane,
          include: [Airline]
        }]
      }, {
        model: Seat
      }]
    });

    return res.status(201).json({
      status: 'success',
      data: fullBooking
    });

  } catch (error) {
    await t.rollback();
    console.error('Booking error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Could not create booking'
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: Flight,
          include: [
            {
              model: Airplane,
              include: [Airline]
            }
          ]
        },
        {
          model: Seat
        },
        {
          model: Customer
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    res.json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { customer_id: req.params.userId },
      include: [
        {
          model: Flight,
          include: [
            {
              model: Airplane,
              include: [Airline]
            }
          ]
        },
        {
          model: Seat
        }
      ]
    });

    res.json({
      status: 'success',
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: Flight,
          include: [
            {
              model: Airplane,
              include: [Airline]
            }
          ]
        },
        {
          model: Seat
        },
        {
          model: Customer
        }
      ]
    });

    res.json({
      status: 'success',
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};