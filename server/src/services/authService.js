const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Customer } = require('../models');

class AuthService {
  async register(userData) {
    const { email, password, ...customerData } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user and customer
    const user = await User.create({
      email,
      password: hashedPassword
    });

    const customer = await Customer.create({
      ...customerData,
      user_id: user.id
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user, customer, token };
  }

  async login(email, password) {
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Email không tồn tại');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Mật khẩu không đúng');
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user, token };
  }

  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      include: [Customer]
    });
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    return user;
  }
}

module.exports = new AuthService();