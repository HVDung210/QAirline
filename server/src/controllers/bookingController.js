const { Booking, Flight, Seat, Customer, Airplane, Airline } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

exports.createBooking = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { flight_id, seat_id, passengers, class: seatClass } = req.body;
    
    if (!flight_id || !seat_id) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Lấy danh sách ghế trống cùng loại
    const availableSeats = await Seat.findAll({
      where: {
        flight_id,
        seat_type: seatClass,
        is_available: true
      },
      limit: passengers,
      lock: true,
      transaction: t
    });

    if (availableSeats.length < passengers) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: `Chỉ còn ${availableSeats.length} ghế trống cho hạng ${seatClass}`
      });
    }

    // Tạo nhiều booking cho mỗi hành khách
    const bookings = [];
    for (const seat of availableSeats) {
      const booking = await Booking.create({
        customer_id: req.user.id,
        flight_id,
        seat_id: seat.id,
        passengers: 1,
        class: seatClass,
        total_price: seat.price,
        status: 'Confirmed',
        payment_status: 'Paid',
        payment_method: req.body.payment_method || 'Cash',
        booking_reference: `BK${Date.now()}${Math.floor(Math.random() * 1000)}` // Tạo mã vé duy nhất
      }, { transaction: t });

      // Cập nhật trạng thái ghế
      await seat.update({ is_available: false }, { transaction: t });

      // Load thông tin đầy đủ cho booking
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
        }],
        transaction: t
      });

      bookings.push(fullBooking);
    }

    await t.commit();

    return res.status(201).json({
      status: 'success',
      data: bookings
    });

  } catch (error) {
    await t.rollback();
    console.error('Booking error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Không thể tạo booking'
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
    const { startDate, endDate, status } = req.query;
    
    // Build where clause
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.booking_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (status) {
      whereClause.status = status;
    }

    const bookings = await Booking.findAll({
      where: whereClause,
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
      ],
      order: [['booking_date', 'DESC']]
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