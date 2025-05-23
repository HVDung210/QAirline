const adminService = require('../services/adminService');

class AdminController {
  async getDashboard(req, res) {
    try {
      const dashboard = await adminService.getDashboard();
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const { page, limit } = req.query;
      const users = await adminService.getUsers(page, limit);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getFlights(req, res) {
    try {
      const { page, limit } = req.query;
      const flights = await adminService.getFlights(page, limit);
      res.json(flights);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getBookings(req, res) {
    try {
      const { page, limit } = req.query;
      const bookings = await adminService.getBookings(page, limit);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPosts(req, res) {
    try {
      const { page, limit } = req.query;
      const posts = await adminService.getPosts(page, limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AdminController(); 