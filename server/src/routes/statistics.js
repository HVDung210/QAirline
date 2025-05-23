const express = require('express');
const router = express.Router();
const { Booking, Flight, User, Post } = require('../models');
const { Op } = require('sequelize');
const adminAuth = require('../middleware/adminAuth');

// Thống kê tổng quan (Admin only)
router.get('/overview', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalFlights,
      totalBookings,
      totalPosts
    ] = await Promise.all([
      User.count(),
      Flight.count(),
      Booking.count(),
      Post.count()
    ]);

    res.json({
      total_users: totalUsers,
      total_flights: totalFlights,
      total_bookings: totalBookings,
      total_posts: totalPosts
    });
  } catch (error) {
    console.error('Get overview statistics error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê tổng quan' });
  }
});

// Thống kê doanh thu theo tháng (Admin only)
router.get('/revenue', adminAuth, async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const monthlyRevenue = await Booking.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('created_at')), 'month'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'revenue']
      ],
      where: {
        created_at: {
          [Op.between]: [
            new Date(currentYear, 0, 1),
            new Date(currentYear, 11, 31, 23, 59, 59)
          ]
        }
      },
      group: [sequelize.fn('MONTH', sequelize.col('created_at'))],
      order: [[sequelize.fn('MONTH', sequelize.col('created_at')), 'ASC']]
    });

    res.json(monthlyRevenue);
  } catch (error) {
    console.error('Get revenue statistics error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê doanh thu' });
  }
});

// Thống kê chuyến bay phổ biến (Admin only)
router.get('/popular-flights', adminAuth, async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const popularFlights = await Booking.findAll({
      attributes: [
        'flight_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'booking_count']
      ],
      include: [{
        model: Flight,
        attributes: ['flight_number', 'origin', 'destination']
      }],
      group: ['flight_id'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: parseInt(limit)
    });

    res.json(popularFlights);
  } catch (error) {
    console.error('Get popular flights error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê chuyến bay phổ biến' });
  }
});

// Thống kê đặt vé theo hạng (Admin only)
router.get('/booking-class', adminAuth, async (req, res) => {
  try {
    const classStatistics = await Booking.findAll({
      attributes: [
        'class',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['class']
    });

    res.json(classStatistics);
  } catch (error) {
    console.error('Get booking class statistics error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê hạng vé' });
  }
});

// Thống kê bài viết theo loại (Admin only)
router.get('/post-types', adminAuth, async (req, res) => {
  try {
    const postTypeStatistics = await Post.findAll({
      attributes: [
        'post_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['post_type']
    });

    res.json(postTypeStatistics);
  } catch (error) {
    console.error('Get post type statistics error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê loại bài viết' });
  }
});

module.exports = router; 