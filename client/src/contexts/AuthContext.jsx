import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, bookingService } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initSession = async () => {
      try {
        await restoreSession();
      } catch (error) {
        console.error('[AuthContext] Error during initialization:', {
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    };
    
    initSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      const sessionInfo = {
        hasStoredData: !!storedData,
        hasToken: !!token,
        storedData: storedData ? JSON.parse(storedData) : null,
        timestamp: new Date().toISOString()
      };
      
      console.log('[AuthContext] Restoring session:', JSON.stringify(sessionInfo, null, 2));

      if (!storedData || !token) {
        const noSessionInfo = {
          hasStoredData: !!storedData,
          hasToken: !!token,
          timestamp: new Date().toISOString()
        };
        console.log('[AuthContext] No stored session found:', JSON.stringify(noSessionInfo, null, 2));
        clearSession();
        return;
      }

      const userData = JSON.parse(storedData);
      try {
        // Verify token validity with backend
        const response = await authService.verifyToken(token);
        const verifyInfo = {
          status: response?.status,
          isValid: response?.data?.valid,
          timestamp: new Date().toISOString()
        };
        console.log('[AuthContext] Token verification response:', JSON.stringify(verifyInfo, null, 2));

        if (response?.data?.valid) {
          setUser(userData);
          const successInfo = {
            email: userData.email,
            role: userData.role,
            timestamp: new Date().toISOString()
          };
          console.log('[AuthContext] Session restored successfully:', JSON.stringify(successInfo, null, 2));
        } else {
          console.log('[AuthContext] Invalid token, clearing session');
          clearSession();
        }
      } catch (verifyError) {
        const errorInfo = {
          error: verifyError.message,
          status: verifyError.response?.status,
          timestamp: new Date().toISOString()
        };
        console.error('[AuthContext] Error verifying token:', JSON.stringify(errorInfo, null, 2));
        
        // Nếu lỗi 404 hoặc lỗi mạng, vẫn cho phép đăng nhập với token hiện tại
        if (verifyError.response?.status === 404) {
          console.log('[AuthContext] Server not available, using stored session');
          setUser(userData);
        } else {
          clearSession();
        }
      }
    } catch (error) {
      const errorInfo = {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
      console.error('[AuthContext] Error restoring session:', JSON.stringify(errorInfo, null, 2));
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  // Hàm helper để xóa session
  const clearSession = () => {
    console.log('[AuthContext] Clearing session');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('justLoggedIn');
    setUser(null);
  };

  const login = async (credentials) => {
    const loginInfo = {
      email: credentials.email,
      timestamp: new Date().toISOString()
    };
    console.log('[AuthContext] Starting login process:', JSON.stringify(loginInfo, null, 2));
    
    setAuthLoading(true);
    
    try {
      const response = await authService.login(credentials);
      const responseInfo = {
        status: response.status,
        hasData: !!response.data,
        data: response.data,
        timestamp: new Date().toISOString()
      };
      console.log('[AuthContext] Received login response:', JSON.stringify(responseInfo, null, 2));
      
      if (!response.data?.data) {
        throw new Error('Invalid response format: missing data');
      }

      const { token, user: userData } = response.data.data;
      
      if (!token || !userData) {
        throw new Error('Invalid response format: missing token or user data');
      }

      // Lưu dữ liệu vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('justLoggedIn', 'true');
      
      // Xóa cache bookings
      bookingService.clearBookingsCache();
      
      const storeInfo = {
        email: userData.email,
        role: userData.role,
        id: userData.id,
        hasToken: !!token,
        timestamp: new Date().toISOString()
      };
      console.log('[AuthContext] Stored user data and cleared cache:', JSON.stringify(storeInfo, null, 2));

      // Cập nhật state ngay lập tức
      setUser(userData);
      setAuthLoading(false);
      
      const completeInfo = {
        email: userData.email,
        role: userData.role,
        timestamp: new Date().toISOString()
      };
      console.log('[AuthContext] Login process complete:', JSON.stringify(completeInfo, null, 2));
      
      return userData;
    } catch (error) {
      setAuthLoading(false);
      const errorInfo = {
        message: error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      };
      console.error('[AuthContext] Login error:', JSON.stringify(errorInfo, null, 2));
      throw error;
    }
  };

  const logout = async () => {
    console.log('[AuthContext] Starting logout process:', {
      email: user?.email,
      currentPath: window.location.pathname,
      hasToken: !!localStorage.getItem('token'),
      hasUser: !!localStorage.getItem('user'),
      timestamp: new Date().toISOString()
    });
    
    try {
      setAuthLoading(true);
      
      // Xóa state và cache trước
      console.log('[AuthContext] Clearing state and cache');
      setUser(null);
      bookingService.clearBookingsCache();
      
      // Gọi API logout
      console.log('[AuthContext] Calling authService.logout()');
      const result = await authService.logout();
      console.log('[AuthContext] Logout completed:', {
        success: result?.data?.success,
        hasToken: !!localStorage.getItem('token'),
        hasUser: !!localStorage.getItem('user'),
        timestamp: new Date().toISOString()
      });

      // Hiển thị thông báo thành công
      toast.success('Đăng xuất thành công');

      // Kiểm tra và chuyển hướng nếu đang ở trang admin
      const isAdminPage = window.location.pathname.startsWith('/admin');
      console.log('[AuthContext] Checking redirection:', {
        isAdminPage,
        currentPath: window.location.pathname,
        timestamp: new Date().toISOString()
      });

      if (isAdminPage) {
        console.log('[AuthContext] Redirecting from admin page to login');
        // Chuyển hướng ngay lập tức
        navigate('/login', {
          state: {
            message: 'Vui lòng đăng nhập để tiếp tục'
          },
          replace: true
        });
      }

      return {
        success: true,
        message: 'Đăng xuất thành công'
      };
    } catch (error) {
      console.error('[AuthContext] Error during logout:', {
        error: error.message,
        stack: error.stack,
        hasToken: !!localStorage.getItem('token'),
        hasUser: !!localStorage.getItem('user'),
        timestamp: new Date().toISOString()
      });
      
      // Vẫn xóa session local nếu có lỗi
      console.log('[AuthContext] Clearing session due to error');
      clearSession();
      
      toast.error('Có lỗi xảy ra khi đăng xuất');
      
      return {
        success: false,
        message: 'Có lỗi xảy ra khi đăng xuất'
      };
    } finally {
      setAuthLoading(false);
      console.log('[AuthContext] Logout process finished:', {
        hasToken: !!localStorage.getItem('token'),
        hasUser: !!localStorage.getItem('user'),
        timestamp: new Date().toISOString()
      });
    }
  };

  const register = async (userData) => {
    console.log('[AuthContext] Starting registration:', {
      email: userData.email,
      timestamp: new Date().toISOString()
    });

    setAuthLoading(true);
    
    try {
      const response = await authService.register(userData);
      
      if (!response.data?.data) {
        throw new Error('Invalid response format: missing data');
      }

      const { token, user: registeredUser } = response.data.data;
      
      if (!token || !registeredUser) {
        throw new Error('Invalid response format: missing token or user data');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(registeredUser));
      localStorage.setItem('justLoggedIn', 'true');
      
      console.log('[AuthContext] Registration complete:', {
        email: registeredUser.email,
        timestamp: new Date().toISOString()
      });
      
      setUser(registeredUser);
      setAuthLoading(false);
      return registeredUser;
    } catch (error) {
      setAuthLoading(false);
      console.error('[AuthContext] Registration error:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  };

  const value = {
    user,
    loading: loading || authLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
