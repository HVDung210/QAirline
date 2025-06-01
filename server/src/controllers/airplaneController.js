const { Airplane, Airline } = require('../models');

class AirplaneController {
  async getAirplanes(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      console.log('[getAirplanes] Fetching airplanes with params:', { page, limit, offset });

      const airplanes = await Airplane.findAndCountAll({
        include: [Airline],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      console.log('[getAirplanes] Found airplanes:', airplanes.count);

      res.json({
        status: 'success',
        total: airplanes.count,
        pages: Math.ceil(airplanes.count / limit),
        currentPage: parseInt(page),
        airplanes: airplanes.rows.map(airplane => ({
          id: airplane.id,
          model: airplane.model,
          manufacturer: airplane.manufacturer,
          seat_count: airplane.seat_count,
          airline_id: airplane.airline_id,
          airline: airplane.Airline ? {
            id: airplane.Airline.id,
            name: airplane.Airline.name
          } : null
        }))
      });
    } catch (error) {
      console.error('[getAirplanes] Error:', error);
      res.status(500).json({ 
        status: 'error',
        message: error.message 
      });
    }
  }

  async getAirplane(req, res) {
    try {
      console.log('[getAirplane] Fetching airplane with ID:', req.params.id);
      
      const airplane = await Airplane.findByPk(req.params.id, {
        include: [Airline]
      });
      
      if (!airplane) {
        console.log('[getAirplane] Airplane not found with ID:', req.params.id);
        return res.status(404).json({ message: 'Không tìm thấy máy bay' });
      }

      console.log('[getAirplane] Found airplane:', airplane.id);
      res.json(airplane);
    } catch (error) {
      console.error('[getAirplane] Error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async createAirplane(req, res) {
    try {
      console.log('[createAirplane] Received request body:', req.body);

      // Kiểm tra dữ liệu đầu vào
      if (!req.body.model) {
        console.log('[createAirplane] Model is missing');
        return res.status(400).json({
          status: 'error',
          message: 'Model không được bỏ trống'
        });
      }

      if (!req.body.manufacturer) {
        console.log('[createAirplane] Manufacturer is missing');
        return res.status(400).json({
          status: 'error',
          message: 'Hãng sản xuất không được bỏ trống'
        });
      }

      if (!req.body.seat_count || req.body.seat_count <= 0) {
        console.log('[createAirplane] Invalid seat count:', req.body.seat_count);
        return res.status(400).json({
          status: 'error',
          message: 'Số ghế phải lớn hơn 0'
        });
      }

      // Kiểm tra airline_id nếu có
      if (req.body.airline_id) {
        console.log('[createAirplane] Checking airline_id:', req.body.airline_id);
        const airline = await Airline.findByPk(req.body.airline_id);
        if (!airline) {
          console.log('[createAirplane] Airline not found with ID:', req.body.airline_id);
          return res.status(400).json({ 
            status: 'error',
            message: 'Hãng hàng không không tồn tại'
          });
        }
      }

      // Tạo máy bay mới
      console.log('[createAirplane] Creating airplane with data:', req.body);

      const now = new Date();
      const airplane = await Airplane.create({
        model: req.body.model,
        manufacturer: req.body.manufacturer,
        seat_count: parseInt(req.body.seat_count),
        airline_id: req.body.airline_id || 1,
        createdAt: now,
        updatedAt: now
      });

      console.log('[createAirplane] Airplane created successfully:', airplane.id);
      
      res.status(201).json({
        status: 'success',
        data: airplane
      });
    } catch (error) {
      console.error('[createAirplane] Error:', error);
      
      if (error.name === 'SequelizeValidationError') {
        console.log('[createAirplane] Validation error:', error.errors);
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: error.errors.map(e => ({
            field: e.path,
            message: e.message
          }))
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log('[createAirplane] Constraint error:', error);
        return res.status(400).json({
          status: 'error',
          message: 'Dữ liệu không hợp lệ',
          errors: error.errors
        });
      }

      res.status(400).json({ 
        status: 'error',
        message: error.message || 'Có lỗi xảy ra khi tạo máy bay'
      });
    }
  }

  async updateAirplane(req, res) {
    try {
      console.log('[updateAirplane] Updating airplane with ID:', req.params.id);
      console.log('[updateAirplane] Update data:', req.body);

      const airplane = await Airplane.findByPk(req.params.id);
      if (!airplane) {
        console.log('[updateAirplane] Airplane not found with ID:', req.params.id);
        return res.status(404).json({ message: 'Không tìm thấy máy bay' });
      }

      const now = new Date();
      await airplane.update({
        ...req.body,
        updatedAt: now
      });

      console.log('[updateAirplane] Airplane updated successfully:', airplane.id);
      res.json({
        status: 'success',
        data: airplane
      });
    } catch (error) {
      console.error('[updateAirplane] Error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  async deleteAirplane(req, res) {
    try {
      console.log('[deleteAirplane] Deleting airplane with ID:', req.params.id);

      const airplane = await Airplane.findByPk(req.params.id);
      if (!airplane) {
        console.log('[deleteAirplane] Airplane not found with ID:', req.params.id);
        return res.status(404).json({ message: 'Không tìm thấy máy bay' });
      }

      await airplane.destroy();
      console.log('[deleteAirplane] Airplane deleted successfully:', req.params.id);
      res.json({ message: 'Xóa máy bay thành công' });
    } catch (error) {
      console.error('[deleteAirplane] Error:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AirplaneController();