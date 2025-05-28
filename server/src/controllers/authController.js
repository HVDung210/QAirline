const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Customer } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authService = require('../services/authService');

class AuthController {
  async register(req, res) {
    try {
      const {
        email,
        password,
        phone,
        first_name,
        last_name,
        address,
        country_name,
        country_code,
        date_of_birth,
        gender
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already registered'
        });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        phone,
        role: 'customer'
      });

      // Create customer profile
      await Customer.create({
        user_id: user.id,
        first_name,
        last_name,
        address,
        country_name,
        country_code,
        date_of_birth,
        gender,
        title: 'Mr',
        middle_name: ''
      });

      res.status(201).json({
        status: 'success',
        message: 'Registration successful'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }

  async login(req, res) {
    try {
      console.log('Login request body:', req.body);
      const { email, password } = req.body;
      console.log('Parsed email:', email, 'Parsed password:', password);

      // Find user
      const user = await User.findOne({ 
        where: { email },
        include: [{
          model: Customer,
          attributes: ['first_name', 'last_name']
        }]
      });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Email không tồn tại'
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          status: 'error',
          message: 'Mật khẩu không đúng'
        });
      }

      // Generate token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Prepare user data for response
      const userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.Customer?.first_name,
        last_name: user.Customer?.last_name
      };

      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Lỗi server, vui lòng thử lại sau'
      });
    }
  }

  async getProfile(req, res) {
    try {
      const profile = await authService.getProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async logout(req, res) {
    try {
      // Trong trường hợp này, chúng ta chỉ cần trả về success
      // vì client sẽ tự xóa token và user data
      res.json({
        status: 'success',
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong during logout'
      });
    }
  }
}

module.exports = new AuthController(); 