const { Airplane, Airline } = require('../models');

class AirplaneController {
  async getAirplanes(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const airplanes = await Airplane.findAndCountAll({
        include: [Airline],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        total: airplanes.count,
        pages: Math.ceil(airplanes.count / limit),
        currentPage: parseInt(page),
        airplanes: airplanes.rows
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAirplane(req, res) {
    try {
      const airplane = await Airplane.findByPk(req.params.id, {
        include: [Airline]
      });
      if (!airplane) {
        return res.status(404).json({ message: 'Không tìm thấy máy bay' });
      }
      res.json(airplane);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createAirplane(req, res) {
    try {
      const airplane = await Airplane.create(req.body);
      res.status(201).json(airplane);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateAirplane(req, res) {
    try {
      const airplane = await Airplane.findByPk(req.params.id);
      if (!airplane) {
        return res.status(404).json({ message: 'Không tìm thấy máy bay' });
      }

      await airplane.update(req.body);
      res.json(airplane);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteAirplane(req, res) {
    try {
      const airplane = await Airplane.findByPk(req.params.id);
      if (!airplane) {
        return res.status(404).json({ message: 'Không tìm thấy máy bay' });
      }

      await airplane.destroy();
      res.json({ message: 'Xóa máy bay thành công' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AirplaneController();