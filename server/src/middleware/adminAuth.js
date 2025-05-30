const { Admin } = require('../models');

const adminAuth = async (req, res, next) => {
  try {
    console.log('[AdminAuth] Checking admin auth:', {
      userId: req.user?.id,
      user: req.user,
      headers: req.headers
    });

    // Kiểm tra xem user đã đăng nhập chưa
    if (!req.user) {
      console.log('[AdminAuth] No user found in request');
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    // Kiểm tra xem user có phải là admin không
    const admin = await Admin.findOne({
      where: { user_id: req.user.id }
    });

    console.log('[AdminAuth] Admin lookup result:', {
      userId: req.user.id,
      adminFound: !!admin,
      adminId: admin?.id
    });

    if (!admin) {
      console.log('[AdminAuth] No admin record found for user:', req.user.id);
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    // Thêm thông tin admin vào request
    req.admin = admin;
    console.log('[AdminAuth] Admin auth successful:', {
      adminId: admin.id,
      userId: req.user.id
    });
    next();
  } catch (error) {
    console.error('[AdminAuth] Error:', error);
    res.status(500).json({ message: 'Lỗi xác thực admin' });
  }
};

module.exports = adminAuth; 