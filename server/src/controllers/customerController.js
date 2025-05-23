const customerService = require('../services/customerService');
const { Customer } = require('../models');

class CustomerController {
  async getProfile(req, res) {
    try {
      const profile = await customerService.getProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const profile = await customerService.updateProfile(req.user.id, req.body);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getBookings(req, res) {
    try {
      const { page, limit } = req.query;
      const bookings = await customerService.getBookings(req.user.id, page, limit);
      res.json(bookings);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async cancelBooking(req, res) {
    try {
      const booking = await customerService.cancelBooking(req.user.id, req.params.id);
      res.json(booking);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllCustomers(req, res) {
    try {
      const customers = await Customer.findAll();
      res.json({
        status: 'success',
        data: customers
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }

  async getCustomerById(req, res) {
    try {
      const customer = await Customer.findByPk(req.params.id);
      if (!customer) {
        return res.status(404).json({
          status: 'error',
          message: 'Customer not found'
        });
      }
      res.json({
        status: 'success',
        data: customer
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }
}

module.exports = new CustomerController(); 