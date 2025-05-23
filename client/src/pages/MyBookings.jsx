import React, { useState, useEffect, useCallback } from 'react';
import * as bookingService from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCityName } from '../data/cityMapping';

const MyBookings = () => {
  console.log('[MyBookings] Component rendering', {
    timestamp: new Date().toISOString(),
    renderStack: new Error().stack
  });

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
    const loadBookings = useCallback(async (forceRefresh = false) => {
    console.log('[MyBookings] loadBookings called:', {
      hasUser: !!user,
      userEmail: user?.email,
      forceRefresh,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });
    
    if (!user) {
      console.log('[MyBookings] No user in loadBookings, skipping');
      setLoading(false);
      return;
    }

    try {
      console.log('[MyBookings] Starting to fetch bookings:', {
        userEmail: user.email,
        userId: user.id,
        forceRefresh,
        timestamp: new Date().toISOString()
      });

      const bookingsData = await bookingService.getMyBookings(forceRefresh);
      
      console.log('[MyBookings] Received bookings data:', {
        isArray: Array.isArray(bookingsData),
        count: bookingsData?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      if (Array.isArray(bookingsData)) {
        const validBookings = bookingsData.filter(booking => {
          const isValid = booking && 
            booking.Flight && 
            booking.Seat && 
            ['Confirmed', 'Pending', 'Cancelled'].includes(booking.status);
            
          console.log('[MyBookings] Validating booking:', {
            id: booking?.id,
            isValid,
            hasFlight: !!booking?.Flight,
            hasSeat: !!booking?.Seat,
            status: booking?.status,
            timestamp: new Date().toISOString()
          });
          
          return isValid;
        });
        
        console.log('[MyBookings] Processing valid bookings:', {
          total: bookingsData.length,
          valid: validBookings.length,
          timestamp: new Date().toISOString()
        });

        const sortedBookings = validBookings.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        setBookings(sortedBookings);
        setError('');
      } else {
        console.log('[MyBookings] Invalid bookings data format');
        setBookings([]);
      }
    } catch (err) {
      console.error('[MyBookings] Error loading bookings:', {
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      setError(err.response?.data?.message || 'Không thể tải danh sách đặt vé');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    let timeoutId;
    const controller = new AbortController();

    const initializeBookings = async () => {
      console.log('[MyBookings] Effect triggered:', {
        hasUser: !!user,
        userEmail: user?.email,
        isFirstMount: mounted,
        timestamp: new Date().toISOString()
      });
      
      if (!user) {
        console.log('[MyBookings] No user in effect, redirecting to login');
        navigate('/login', { 
          state: { 
            from: '/bookings/my-bookings',
            message: 'Vui lòng đăng nhập để xem danh sách đặt vé' 
          }
        });
        return;
      }      // Kiểm tra xem có phải mới đăng nhập không
      const isJustLoggedIn = localStorage.getItem('justLoggedIn');
      const delay = isJustLoggedIn ? 1500 : 100;
      console.log('[MyBookings] Setting load delay:', {
        isJustLoggedIn: !!isJustLoggedIn,
        delay,
        timestamp: new Date().toISOString()
      });
      
      timeoutId = setTimeout(() => {
        if (!mounted) {
          console.log('[MyBookings] Component unmounted before timeout');
          return;
        }
        
        if (!user) {
          console.log('[MyBookings] No user after timeout');
          return;
        }

        console.log('[MyBookings] Executing loadBookings after delay:', {
          delay,
          isJustLoggedIn: !!isJustLoggedIn,
          timestamp: new Date().toISOString(),
          userEmail: user.email
        });
        
        // Force refresh khi mới đăng nhập để đảm bảo dữ liệu mới nhất
        loadBookings(!!isJustLoggedIn);
        localStorage.removeItem('justLoggedIn'); // Xóa flag sau khi đã sử dụng
      }, delay);
    };

    initializeBookings();

    return () => {
      console.log('[MyBookings] Cleanup effect:', {
        timestamp: new Date().toISOString()
      });
      mounted = false;
      controller.abort();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, navigate, loadBookings]);

  // Log khi component mount/unmount và theo dõi state changes
  useEffect(() => {
    console.log('[MyBookings] Component mounted', {
      isLoggedIn: !!user,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

    return () => {
      console.log('[MyBookings] Component unmounting', {
        isLoggedIn: !!user,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
    };
  }, [user]);

  useEffect(() => {
    console.log('[MyBookings] Bookings state updated:', {
      count: bookings.length,
      statuses: bookings.map(b => b.status),
      ids: bookings.map(b => b.id),
      timestamp: new Date().toISOString()
    });
  }, [bookings]);

  const handleCancelBooking = async (bookingId, departureTime) => {
    console.log('[MyBookings] Attempting to cancel booking:', {
      bookingId,
      departureTime,
      timestamp: new Date().toISOString()
    });

    try {
      const now = new Date();
      const departure = new Date(departureTime);
      const hoursUntilDeparture = (departure - now) / (1000 * 60 * 60);
      
      console.log('[MyBookings] Checking cancellation timeframe:', {
        hoursUntilDeparture,
        now: now.toISOString(),
        departure: departure.toISOString()
      });

      if (hoursUntilDeparture < 24) {
        throw new Error('Không thể hủy vé trong vòng 24 giờ trước giờ khởi hành');
      }      await bookingService.cancelBooking(bookingId);
      console.log('[MyBookings] Booking cancelled successfully:', {
        bookingId,
        timestamp: new Date().toISOString()
      });

      // Force refresh khi hủy vé để cập nhật danh sách ngay lập tức
      await loadBookings(true);
      setError('');
    } catch (err) {
      console.error('[MyBookings] Error cancelling booking:', {
        bookingId,
        error: err.message,
        timestamp: new Date().toISOString()
      });
      setError(err.message || 'Không thể hủy đặt vé');
    }
  };
  // Group round-trip bookings by checking if bookings are made within a short time of each other
  const groupReturnFlights = (bookingsList) => {
    console.log('[MyBookings] Grouping bookings:', bookingsList);
    const groups = new Map();
    
    // Sort bookings by booking date first, then by departure time
    const sortedBookings = [...bookingsList].sort((a, b) => {
      const bookingDateDiff = new Date(b.booking_date) - new Date(a.booking_date);
      if (bookingDateDiff !== 0) return bookingDateDiff;
      return new Date(a.Flight?.departure_time) - new Date(b.Flight?.departure_time);
    });
    
    sortedBookings.forEach(booking => {
      const bookingDate = new Date(booking.booking_date);
      const flightOrigin = booking.Flight?.origin;
      const flightDest = booking.Flight?.destination;
      let isGrouped = false;      // Try to find a matching return booking group
      for (let [key, group] of groups) {
        const [firstBooking] = group;
        
        // Check if this could be a return flight by:
        // 1. Group has only one booking
        // 2. The destinations match as origin/destination reversed
        // 3. The bookings were made within 5 minutes of each other
        // 4. Return flight departs after outbound flight
        const timeDiff = Math.abs(bookingDate - new Date(firstBooking.booking_date));
        const isWithin5Minutes = timeDiff <= 5 * 60 * 1000; // 5 minutes in milliseconds
        
        if (group.length === 1 && 
            firstBooking.Flight?.destination === booking.Flight?.origin && 
            firstBooking.Flight?.origin === booking.Flight?.destination &&
            isWithin5Minutes &&
            new Date(booking.Flight?.departure_time) > new Date(firstBooking.Flight?.departure_time)) {
          
          console.log('[MyBookings] Found return flight:', {
            outbound: {
              flight: firstBooking.Flight?.flight_number,
              from: firstBooking.Flight?.origin,
              to: firstBooking.Flight?.destination,
              departure: firstBooking.Flight?.departure_time
            },
            inbound: {
              flight: booking.Flight?.flight_number,
              from: booking.Flight?.origin,
              to: booking.Flight?.destination,
              departure: booking.Flight?.departure_time
            }
          });
          
          group.push(booking);
          isGrouped = true;
          break;
        }
      }      // If no matching return flight found, create new group
      if (!isGrouped) {
        // Use booking timestamp as key to help match return flights
        const key = `${booking.booking_date}-${flightOrigin}-${flightDest}`;
        groups.set(key, [booking]);
      }
    });
    
    // Sắp xếp các nhóm theo thời gian khởi hành gần nhất
    return Array.from(groups.values())
      .sort((a, b) => new Date(b[0].Flight?.departure_time) - new Date(a[0].Flight?.departure_time));
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách đặt vé...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Đặt vé của tôi</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  loadBookings();
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )}

      {!error && bookings.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">Bạn chưa có đặt vé nào</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Tìm chuyến bay
          </button>
        </div>
      )}

      <div className="space-y-6">
        {groupReturnFlights(bookings).map((bookingGroup, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">
                {bookingGroup.length > 1 ? 'Vé Khứ hồi' : 'Vé Một chiều'}
              </h2>
            </div>
            
            <div className="space-y-4">
              {bookingGroup.map((booking, index) => (
                <div key={booking.id} className={`${index > 0 ? 'border-t pt-4' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        {index === 0 && bookingGroup.length > 1 ? 'Chuyến đi' : 
                         index === 1 ? 'Chuyến về' : 
                         `Chuyến bay ${booking.Flight?.flight_number || 'N/A'}`}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <p className="text-gray-600">Điểm đi</p>
                          <p className="font-medium">{getCityName(booking.Flight?.origin) || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Điểm đến</p>
                          <p className="font-medium">{getCityName(booking.Flight?.destination) || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Giờ khởi hành</p>
                          <p className="font-medium">
                            {booking.Flight?.departure_time
                              ? new Date(booking.Flight.departure_time).toLocaleString('vi-VN')
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Giờ đến</p>
                          <p className="font-medium">
                            {booking.Flight?.arrival_time
                              ? new Date(booking.Flight.arrival_time).toLocaleString('vi-VN')
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-600">Số ghế</p>
                        <p className="font-medium">{booking.Seat?.seat_number || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="text-gray-600">Trạng thái</p>
                        <p className={`font-medium ${
                          booking.status === 'Confirmed' ? 'text-green-600' :
                          booking.status === 'Cancelled' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {booking.status === 'Confirmed' ? 'Đã xác nhận' :
                           booking.status === 'Cancelled' ? 'Đã hủy' :
                           'Đang chờ xác nhận'}
                        </p>
                      </div>
                    </div>

                    {booking.status === 'Confirmed' && (
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleCancelBooking(booking.id, booking.Flight?.departure_time)}
                          className={`px-4 py-2 rounded-md transition-colors ${
                            new Date(booking.Flight?.departure_time) - new Date() < 24 * 60 * 60 * 1000
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700'
                          } text-white`}
                          disabled={new Date(booking.Flight?.departure_time) - new Date() < 24 * 60 * 60 * 1000}
                        >
                          Hủy đặt vé
                        </button>
                        <p className="text-sm text-gray-500">
                          *Chỉ có thể hủy trước 24h khởi hành
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;