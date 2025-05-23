const { Admin } = require('../models');

const adminAuth = async (req, res, next) => {
  try {
    // Kiểm tra xem user đã đăng nhập chưa
    if (!req.user) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    // Kiểm tra xem user có phải là admin không
    const admin = await Admin.findOne({
      where: { user_id: req.user.id }
    });

    if (!admin) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    // Thêm thông tin admin vào request
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ message: 'Lỗi xác thực admin' });
  }
};

module.exports = adminAuth; 