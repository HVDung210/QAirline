import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { clearBookingsCache } from '../services/bookingService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const restoreUserSession = () => {
      console.log('[AuthContext] Restoring user session...');
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        console.log('[AuthContext] Found stored data:', {
          hasToken: !!token,
          hasUser: !!savedUser,
          timestamp: new Date().toISOString()
        });
        
        if (token && savedUser && savedUser !== "undefined") {
          const parsedUser = JSON.parse(savedUser);
          console.log('[AuthContext] Restoring user state:', {
            email: parsedUser.email,
            timestamp: new Date().toISOString()
          });
          setUser(parsedUser);
        }
      } catch (e) {
        console.error('[AuthContext] Error restoring session:', {
          error: e.message,
          timestamp: new Date().toISOString()
        });
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
        console.log('[AuthContext] Session restoration complete');
      }
    };

    restoreUserSession();
  }, []);

  const login = async (credentials) => {
    console.log('[AuthContext] Starting login process:', {
      email: credentials.email,
      timestamp: new Date().toISOString()
    });
    
    setAuthLoading(true);
    
    try {
      const response = await authService.login(credentials);
      console.log('[AuthContext] Received login response:', {
        status: response.status,
        hasData: !!response.data,
        timestamp: new Date().toISOString()
      });
      
      if (!response.data?.data) {
        throw new Error('Invalid response format: missing data');
      }

      const { token, user: userData } = response.data.data;
      
      if (!token || !userData) {
        throw new Error('Invalid response format: missing token or user data');
      }      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('justLoggedIn', 'true');
      
      // Clear any existing bookings cache
      clearBookingsCache();
      
      console.log('[AuthContext] Stored user data and cleared cache:', {
        email: userData.email,
        id: userData.id,
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });

      // Add delay before state update
      await new Promise(resolve => {
        setTimeout(() => {
          console.log('[AuthContext] Delay complete, updating state at:', new Date().toISOString());
          setUser(userData);
          setAuthLoading(false);
          resolve();
        }, 500);
      });
      
      console.log('[AuthContext] Login process complete:', {
        email: userData.email,
        timestamp: new Date().toISOString()
      });
      
      return userData;
    } catch (error) {
      setAuthLoading(false);
      console.error('[AuthContext] Login error:', {
        message: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  };
  const logout = async () => {
    console.log('[AuthContext] Starting logout process:', {
      email: user?.email,
      timestamp: new Date().toISOString()
    });
    
    try {
      setAuthLoading(true);
      // Clear all auth related items from localStorage
      const itemsToRemove = ['token', 'user', 'justLoggedIn'];
      itemsToRemove.forEach(item => {
        console.log(`[AuthContext] Removing ${item} from localStorage`);
        localStorage.removeItem(item);
      });      // Clear any existing bookings cache
      clearBookingsCache();

      // Double check items were removed
      const remainingItems = itemsToRemove.filter(item => localStorage.getItem(item));
      if (remainingItems.length > 0) {
        console.warn('[AuthContext] Some items were not properly removed:', remainingItems);
      } else {
        console.log('[AuthContext] All items successfully removed from localStorage');
      }

      // Add small delay for smooth transition
      setTimeout(() => {
        // Clear user state
        setUser(null);
        setAuthLoading(false);
        console.log('[AuthContext] User state cleared successfully');
      }, 300);

      return {
        success: true,
        message: 'Đăng xuất thành công'
      };
    } catch (error) {
      setAuthLoading(false);
      console.error('[AuthContext] Error during logout:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        message: 'Có lỗi xảy ra khi đăng xuất'
      };
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

  return (
    <AuthContext.Provider value={{
      user,
      loading: loading || authLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
