import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000, // 10 seconds timeout
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept all status codes less than 500
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth/');
    const isLogoutEndpoint = requestUrl.includes('/auth/logout');
    
    console.log('[API Interceptor] Error caught:', {
      url: requestUrl,
      status: error.response?.status,
      isAuthEndpoint,
      isLogoutEndpoint,
      timestamp: new Date().toISOString()
    });
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - Xóa token và chuyển về trang login
          if (!isLogoutEndpoint) {
            console.log('[API Interceptor] Unauthorized, clearing session');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('justLoggedIn');
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('[API Interceptor] Forbidden access');
          break;
        case 404:
          // Bỏ qua lỗi 404 cho các endpoint auth
          if (isAuthEndpoint) {
            console.log('[API Interceptor] Auth endpoint not available (404), continuing with local operation');
            return Promise.resolve({ 
              data: { 
                success: true,
                message: 'Operation completed locally due to server unavailability'
              } 
            });
          }
          console.error('[API Interceptor] Resource not found');
          break;
        case 500:
          console.error('[API Interceptor] Server error');
          break;
        default:
          console.error('[API Interceptor] Error:', data.message);
      }
    } else if (error.request) {
      console.error('[API Interceptor] Network error - cannot connect to server');
    } else {
      console.error('[API Interceptor] Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Cache management for bookings
let bookingsCache = {
  data: null,
  timestamp: null,
  promise: null
};

const CACHE_DURATION = 2000; // 2 seconds

// Auth services
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  logout: async () => {
    try {
      console.log('[authService] Starting logout process:', {
        hasToken: !!localStorage.getItem('token'),
        hasUser: !!localStorage.getItem('user'),
        timestamp: new Date().toISOString()
      });
      
      // Gọi API logout trước
      console.log('[authService] Calling logout API');
      const response = await api.post('/auth/logout');
      console.log('[authService] Logout API response:', {
        status: response?.status,
        success: response?.data?.success,
        timestamp: new Date().toISOString()
      });

      // Sau khi gọi API thành công, xóa token và user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('justLoggedIn');
      
      console.log('[authService] Local storage cleared:', {
        hasToken: !!localStorage.getItem('token'),
        hasUser: !!localStorage.getItem('user'),
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      console.log('[authService] Logout API error:', {
        status: error.response?.status,
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString()
      });

      // Nếu lỗi 404 hoặc lỗi mạng, vẫn coi như logout thành công
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.log('[authService] Logout API not available, continuing with local logout');
        // Vẫn xóa token và user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('justLoggedIn');
        return { data: { success: true } };
      }
      throw error;
    }
  },

  verifyToken: async (token) => {
    try {
      const response = await api.post('/auth/verify-token', { token });
      return response;
    } catch (error) {
      // Nếu lỗi 404 hoặc lỗi mạng, vẫn coi như token hợp lệ
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.log('[authService] Verify token API not available, assuming token is valid');
        return { data: { valid: true } };
      }
      throw error;
    }
  }
};

// Flight services
export const flightService = {
  searchFlights: async (params) => {
    const response = await api.get('/flights/search', { params });
    return response.data;
  },

  getFlightDetails: async (id) => {
    const response = await api.get(`/flights/${id}`);
    return response.data;
  },

  getAvailableSeats: async (flightId, flightClass) => {
    const response = await api.get(`/flights/${flightId}/seats`, {
      params: { class: flightClass }
    });
    return response.data;
  }
};

// Booking services
export const bookingService = {
  clearBookingsCache: () => {
    console.log('[bookingService] Clearing cache');
    bookingsCache = {
      data: null,
      timestamp: null,
      promise: null
    };
  },

  getMyBookings: async (forceRefresh = false) => {
    console.log('[bookingService] getMyBookings called with forceRefresh:', forceRefresh);
    const now = Date.now();

    if (forceRefresh) {
      console.log('[bookingService] Force refresh requested, clearing cache');
      bookingService.clearBookingsCache();
    }

    if (bookingsCache.promise) {
      console.log('[bookingService] Returning pending request');
      return bookingsCache.promise;
    }

    if (!forceRefresh && bookingsCache.data && bookingsCache.timestamp && (now - bookingsCache.timestamp < CACHE_DURATION)) {
      console.log('[bookingService] Using cached data from', new Date(bookingsCache.timestamp));
      return bookingsCache.data;
    }

    try {
      console.log('[bookingService] Fetching new bookings data');
      bookingsCache.promise = api.get('/bookings/my-bookings');
      const response = await bookingsCache.promise;
      
      console.log('[bookingService] Raw response:', response.data);

      if (!Array.isArray(response.data)) {
        console.log('[bookingService] Invalid response format - not an array');
        throw new Error('Invalid response format: expected array');
      }

      const validBookings = response.data
        .filter(booking => {
          if (!booking || typeof booking !== 'object') return false;
          if (!booking.id || !booking.Flight || !booking.Seat) return false;
          if (!booking.Flight.flight_number || !booking.Flight.departure_time) return false;
          if (!['Confirmed', 'Cancelled', 'Pending'].includes(booking.status)) return false;
          return true;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      console.log('[bookingService] Processed bookings:', {
        total: response.data.length,
        valid: validBookings.length,
        invalidCount: response.data.length - validBookings.length
      });

      bookingsCache = {
        data: validBookings,
        timestamp: now,
        promise: null
      };

      return validBookings;
    } catch (error) {
      console.error('[bookingService] Error fetching bookings:', error);
      bookingsCache.promise = null;
      throw error.response?.data?.message 
        ? new Error(error.response.data.message)
        : error;
    }
  },

  createBooking: async (bookingData) => {
    try {
      console.log('[bookingService] Creating booking:', bookingData);
      const response = await api.post('/bookings', bookingData);
      bookingService.clearBookingsCache();
      
      console.log('[bookingService] Booking created:', response.data);
      
      if (response.data?.status === 'success') {
        return response.data;
      }
      
      if (response.data?.message === 'Please authenticate.') {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      throw new Error('Failed to create booking');
    } catch (error) {
      console.error('[bookingService] Error creating booking:', error);
      throw error.response?.data?.message
        ? new Error(error.response.data.message)
        : error;
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      console.log('[bookingService] Cancelling booking:', bookingId);
      const response = await api.patch(`/bookings/${bookingId}/cancel`);
      console.log('[bookingService] Booking cancelled:', response.data);
      bookingService.clearBookingsCache();
      return response.data;
    } catch (error) {
      console.error('[bookingService] Error cancelling booking:', {
        bookingId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
      }
      
      if (error.response) {
        const message = error.response.data?.message || 'Không thể hủy đặt vé';
        throw new Error(message);
      }
      
      throw new Error('Đã xảy ra lỗi khi hủy đặt vé. Vui lòng thử lại sau.');
    }
  }
};

// Admin services
export const adminService = {
  // Airplanes
  getAirplanes: async () => {
    console.log('[adminService] Calling getAirplanes API');
    const response = await api.get('/airplanes');
    return response;
  },
  createAirplane: async (data) => {
    console.log('[adminService] Calling createAirplane API with data:', data);
    const response = await api.post('/airplanes', data);
    return response;
  },
  updateAirplane: async (id, data) => {
    console.log('[adminService] Calling updateAirplane API for id:', id, 'with data:', data);
    const response = await api.put(`/airplanes/${id}`, data);
    return response;
  },
  deleteAirplane: async (id) => {
    console.log('[adminService] Calling deleteAirplane API for id:', id);
    const response = await api.delete(`/airplanes/${id}`);
    return response;
  },

  // Flights
  getFlights: async () => {
    console.log('[adminService] Calling getFlights API');
    const response = await api.get('/flights');
    return response;
  },
  createFlight: async (data) => {
    console.log('[adminService] Calling createFlight API with data:', data);
    const response = await api.post('/flights', data);
    return response;
  },
  updateFlight: async (id, data) => {
    console.log('[adminService] Calling updateFlight API for id:', id, 'with data:', data);
    const response = await api.put(`/flights/${id}`, data);
    return response;
  },
  deleteFlight: async (id) => {
    console.log('[adminService] Calling deleteFlight API for id:', id);
    const response = await api.delete(`/flights/${id}`);
    return response;
  },
  updateFlightDelay: async (id, delayTime) => {
    console.log('[adminService] Calling updateFlightDelay API for id:', id, 'with delay:', delayTime);
    const response = await api.put(`/flights/${id}/delay`, { delayTime });
    return response;
  },

  // Bookings
  getBookings: async () => {
    console.log('[adminService] Calling getBookings API');
    const response = await api.get('/bookings');
    return response;
  },
  getBookingDetails: async (id) => {
    console.log('[adminService] Calling getBookingDetails API for id:', id);
    const response = await api.get(`/bookings/${id}`);
    return response;
  },
  updateBookingStatus: async (id, status) => {
    console.log('[adminService] Calling updateBookingStatus API for id:', id, 'with status:', status);
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response;
  },

  // Posts
  getPosts: async () => {
    console.log('[adminService] Calling getPosts API');
    const response = await api.get('/posts');
    return response;
  },
  createPost: async (data) => {
    console.log('[adminService] Calling createPost API with data:', data);
    const response = await api.post('/posts', data);
    return response;
  },
  updatePost: async (id, data) => {
    console.log('[adminService] Calling updatePost API for id:', id, 'with data:', data);
    const response = await api.put(`/posts/${id}`, data);
    return response;
  },
  deletePost: async (id) => {
    console.log('[adminService] Calling deletePost API for id:', id);
    const response = await api.delete(`/posts/${id}`);
    return response;
  },

  // Statistics
  getDashboardStats: () => api.get('/statistics/dashboard'),
  getRevenueStats: (params) => api.get('/statistics/revenue', { params }),
  getBookingStatistics: async () => {
    console.log('[adminService] Calling getBookingStatistics API');
    const response = await api.get('/statistics/bookings');
    return response;
  }
};

export default api; 