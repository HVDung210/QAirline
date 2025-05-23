const { Admin, User, Customer, Flight, Booking, Post } = require('../models');
const { Op } = require('sequelize');

class AdminService {
  async getDashboard() {
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

    return {
      total_users: totalUsers,
      total_flights: totalFlights,
      total_bookings: totalBookings,
      total_posts: totalPosts
    };
  }

  async getUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const users = await User.findAndCountAll({
      include: [Customer],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      total: users.count,
      pages: Math.ceil(users.count / limit),
      currentPage: parseInt(page),
      users: users.rows
    };
  }

  async getFlights(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const flights = await Flight.findAndCountAll({
      include: [{
        model: Booking,
        attributes: ['id']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['departure_time', 'DESC']]
    });

    return {
      total: flights.count,
      pages: Math.ceil(flights.count / limit),
      currentPage: parseInt(page),
      flights: flights.rows
    };
  }

  async getBookings(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const bookings = await Booking.findAndCountAll({
      include: [{
        model: Flight,
        include: [{
          model: Seat
        }]
      }, {
        model: Customer
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      total: bookings.count,
      pages: Math.ceil(bookings.count / limit),
      currentPage: parseInt(page),
      bookings: bookings.rows
    };
  }

  async getPosts(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const posts = await Post.findAndCountAll({
      include: [{
        model: Admin,
        attributes: ['id', 'name']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      total: posts.count,
      pages: Math.ceil(posts.count / limit),
      currentPage: parseInt(page),
      posts: posts.rows
    };
  }
}

module.exports = new AdminService(); 