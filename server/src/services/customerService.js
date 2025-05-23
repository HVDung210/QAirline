const { Customer, Booking, Flight, Seat } = require('../models');
const { Op } = require('sequelize');

class CustomerService {
  async getProfile(userId) {
    const customer = await Customer.findOne({
      where: { user_id: userId },
      include: [{
        model: Booking,
        include: [{
          model: Flight,
          include: [Seat]
        }]
      }]
    });
    if (!customer) {
      throw new Error('Không tìm thấy thông tin khách hàng');
    }
    return customer;
  }

  async updateProfile(userId, updateData) {
    const customer = await Customer.findOne({
      where: { user_id: userId }
    });
    if (!customer) {
      throw new Error('Không tìm thấy thông tin khách hàng');
    }

    await customer.update(updateData);
    return customer;
  }

  async getBookings(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const customer = await Customer.findOne({
      where: { user_id: userId }
    });
    if (!customer) {
      throw new Error('Không tìm thấy thông tin khách hàng');
    }

    const bookings = await Booking.findAndCountAll({
      where: { customer_id: customer.id },
      include: [{
        model: Flight,
        include: [Seat]
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      total: bookings.count,
      pages: Math.ceil(bookings.count / limit),
      currentPage: parseInt(page),
      bookings: bookings.rows
    };
  }

  async cancelBooking(userId, bookingId) {
    const customer = await Customer.findOne({
      where: { user_id: userId }
    });
    if (!customer) {
      throw new Error('Không tìm thấy thông tin khách hàng');
    }

    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        customer_id: customer.id
      },
      include: [Flight]
    });
    if (!booking) {
      throw new Error('Không tìm thấy đặt vé');
    }

    // Check if booking can be cancelled (24h before departure)
    const departureTime = new Date(booking.Flight.departure_time);
    const now = new Date();
    const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);

    if (hoursUntilDeparture < 24) {
      throw new Error('Không thể hủy vé trong vòng 24h trước giờ khởi hành');
    }

    await booking.update({ status: 'cancelled' });
    return booking;
  }
}

module.exports = new CustomerService(); 