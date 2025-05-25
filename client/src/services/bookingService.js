import api from './api';
import axios from 'axios';

let bookingsCache = {
  data: null,
  timestamp: null,
  promise: null
};

const CACHE_DURATION = 2000; // 2 giây - giảm thời gian cache để dữ liệu được cập nhật nhanh hơn

export const clearBookingsCache = () => {
  console.log('[bookingService] Clearing cache');
  bookingsCache = {
    data: null,
    timestamp: null,
    promise: null
  };
};

const validateBooking = (booking) => {
  console.log('[bookingService] Validating booking:', booking?.id);
  
  if (!booking || typeof booking !== 'object') {
    console.log('[bookingService] Invalid booking: null or not an object');
    return false;
  }
  
  if (!booking.id || !booking.Flight || !booking.Seat) {
    console.log('[bookingService] Invalid booking: missing required fields', {
      hasId: !!booking.id,
      hasFlight: !!booking.Flight,
      hasSeat: !!booking.Seat
    });
    return false;
  }
  
  if (!booking.Flight.flight_number || !booking.Flight.departure_time) {
    console.log('[bookingService] Invalid booking: missing flight details', {
      hasFlightNumber: !!booking.Flight.flight_number,
      hasDepartureTime: !!booking.Flight.departure_time
    });
    return false;
  }
  
  if (!['Confirmed', 'Cancelled', 'Pending'].includes(booking.status)) {
    console.log('[bookingService] Invalid booking: invalid status', booking.status);
    return false;
  }
  
  console.log('[bookingService] Booking is valid:', booking.id);
  return true;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const getMyBookings = async (forceRefresh = false) => {
  console.log('[bookingService] getMyBookings called with forceRefresh:', forceRefresh);
  const now = Date.now();

  // Always clear cache if force refresh is requested
  if (forceRefresh) {
    console.log('[bookingService] Force refresh requested, clearing cache');
    clearBookingsCache();
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
    const headers = getAuthHeaders();
    bookingsCache.promise = api.get('/bookings/my-bookings', headers);
    const response = await bookingsCache.promise;
    
    console.log('[bookingService] Raw response:', response.data);

    if (!Array.isArray(response.data)) {
      console.log('[bookingService] Invalid response format - not an array');
      throw new Error('Invalid response format: expected array');
    }

    const validBookings = response.data
      .filter(validateBooking)
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
};

export const createBooking = async (bookingData) => {
  try {
    console.log('[bookingService] Creating booking:', bookingData);
    
    // Thêm headers xác thực
    const headers = getAuthHeaders();
    if (!headers.headers.Authorization) {
      throw new Error('No authentication token found');
    }

    const response = await api.post('/bookings', bookingData, headers);
    clearBookingsCache();
    
    console.log('[bookingService] Booking created:', response.data);
    
    if (response.data?.status === 'success') {
      return response.data;
    }
    
    // Kiểm tra các trường hợp lỗi cụ thể
    if (response.data?.message === 'Please authenticate.') {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    throw new Error('Failed to create booking');
  } catch (error) {
    console.error('[bookingService] Error creating booking:', error);
    
    // Xử lý lỗi 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    throw error.response?.data?.message
      ? new Error(error.response.data.message)
      : error;
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    console.log('[bookingService] Cancelling booking:', bookingId);
    const headers = getAuthHeaders();
    const response = await api.patch(`/bookings/${bookingId}/cancel`, {}, headers);
    console.log('[bookingService] Booking cancelled:', response.data);
    clearBookingsCache(); // Clear cache after successful cancellation
    return response.data;
  } catch (error) {
    console.error('[bookingService] Error cancelling booking:', {
      bookingId,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Kiểm tra loại lỗi
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
    
    if (error.response) {
      // Lỗi từ server
      const message = error.response.data?.message || 'Không thể hủy đặt vé';
      throw new Error(message);
    }
    
    // Lỗi khác
    throw new Error('Đã xảy ra lỗi khi hủy đặt vé. Vui lòng thử lại sau.');
  }
};