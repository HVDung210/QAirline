import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, Menu, MenuItem, IconButton, Snackbar, Alert } from '@mui/material';
import { AccountCircle, Logout, Person } from '@mui/icons-material';
import logo from '../assets/logo.png';
import avatar from '../assets/avatar.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    console.log('[Navbar] User state changed:', {
      hasUser: !!user,
      email: user?.email,
      timestamp: new Date().toISOString()
    });
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = async () => {
    console.log('[Navbar] Starting logout process');
    handleClose();
    
    try {
      // Chuyển hướng về trang chủ ngay lập tức
      console.log('[Navbar] Navigating to home');
      navigate('/');

      // Sau đó mới thực hiện đăng xuất
      const result = await logout();
      
      console.log('[Navbar] Logout result:', {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString()
      });

      // Show notification
      setNotification({
        open: true,
        message: result.message,
        type: result.success ? 'success' : 'error'
      });
    } catch (error) {
      console.error('[Navbar] Error during logout:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      setNotification({
        open: true,
        message: 'Có lỗi xảy ra khi đăng xuất',
        type: 'error'
      });
    }
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleNotificationClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <img
                  className="h-8 w-auto"
                  src={logo}
                  alt="QAirline"
                />
                <span className="ml-2 text-xl font-bold text-blue-600">QAirline</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Trang chủ
                </Link>
                <Link
                  to="/flights/search"
                  className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Tìm chuyến bay
                </Link>
                {user && (
                  <Link
                    to="/bookings/my-bookings"
                    className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Đặt chỗ của tôi
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <IconButton
                      size="large"
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={handleMenu}
                      color="inherit"
                    >
                      <Avatar
                        src={avatar}
                        alt={user.first_name ? `${user.first_name} ${user.last_name}` : "avatar"}
                        sx={{ width: 32, height: 32 }}
                      />
                    </IconButton>
                    <Menu
                      id="menu-appbar"
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                    >
                      <MenuItem onClick={handleProfile}>
                        <Person className="mr-2" fontSize="small" />
                        Thông tin cá nhân
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>
                        <Logout className="mr-2" fontSize="small" />
                        Đăng xuất
                      </MenuItem>
                    </Menu>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {user.first_name ? `${user.first_name} ${user.last_name}` : user.email}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;