const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    console.log('[Auth] Checking auth:', {
      headers: req.headers,
      authorization: req.header('Authorization')
    });

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('[Auth] No token found');
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Auth] Decoded JWT:', decoded);
    
    const user = await User.findOne({ where: { id: decoded.id } });
    console.log('[Auth] User lookup result:', {
      userId: decoded.id,
      userFound: !!user,
      userRole: user?.role
    });

    if (!user) {
      console.log('[Auth] User not found in DB:', decoded.id);
      throw new Error('User not found');
    }

    req.token = token;
    req.user = user;
    console.log('[Auth] Auth successful:', {
      userId: user.id,
      userRole: user.role
    });
    next();
  } catch (error) {
    console.error('[Auth] Error:', error);
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      console.log('[AdminAuth] Checking admin role:', {
        userId: req.user?.id,
        userRole: req.user?.role
      });

      if (req.user.role !== 'admin') {
        console.log('[AdminAuth] Access denied - not admin');
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
      next();
    });
  } catch (error) {
    console.error('[AdminAuth] Error:', error);
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

module.exports = {
  auth,
  adminAuth
}; 