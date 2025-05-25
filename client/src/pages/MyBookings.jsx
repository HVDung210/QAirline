import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import * as bookingService from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCityName } from '../data/cityMapping';

const formatDateTime = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, 'dd/MM/yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

const formatPrice = (price) => {
  try {
    const numPrice = Number(price);
    return isNaN(numPrice) ? '0' : numPrice.toLocaleString('vi-VN');
  } catch (error) {
    console.error('Error formatting price:', error);
    return '0';
  }
};

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
      // Tìm booking trong danh sách đã xử lý
      const processedBookings = groupReturnFlights(bookings);
      const booking = processedBookings.find(b => b.id === bookingId);
      
      if (!booking) {
        console.error('[MyBookings] Booking not found:', {
          bookingId,
          availableIds: processedBookings.map(b => ({
            id: b.id,
            original_id: b.original_id,
            return_original_id: b.return_original_id,
            is_round_trip: b.is_round_trip,
            ticket_number: b.ticket_number
          })),
          timestamp: new Date().toISOString()
        });
        throw new Error('Không tìm thấy thông tin đặt vé');
      }

      const now = new Date();
      const bookingCreationTime = new Date(booking.createdAt);
      const hoursSinceCreation = (now - bookingCreationTime) / (1000 * 60 * 60);

      console.log('[MyBookings] Checking booking details:', {
        bookingId,
        originalId: booking.original_id,
        returnOriginalId: booking.return_original_id,
        isRoundTrip: booking.is_round_trip,
        hoursSinceCreation,
        bookingCreationTime: bookingCreationTime.toISOString(),
        now: now.toISOString(),
        status: booking.status,
        ticketNumber: booking.ticket_number,
        timestamp: new Date().toISOString()
      });

      if (hoursSinceCreation > 24) {
        throw new Error('Không thể hủy vé sau 24 giờ kể từ khi đặt');
      }

      // Hiển thị thông báo xác nhận
      if (!window.confirm('Bạn có chắc chắn muốn hủy đặt vé này?')) {
        return;
      }

      setLoading(true);

      // Nếu là vé khứ hồi, hủy cả 2 vé
      if (booking.is_round_trip) {
        if (!booking.return_original_id) {
          throw new Error('Không tìm thấy thông tin vé về');
        }

        console.log('[MyBookings] Cancelling round-trip booking:', {
          outboundId: booking.original_id,
          returnId: booking.return_original_id,
          outboundTicket: booking.ticket_number,
          timestamp: new Date().toISOString()
        });

        // Hủy vé đi
        const outboundResponse = await bookingService.cancelBooking(booking.original_id);
        if (outboundResponse.status !== 'success') {
          throw new Error(outboundResponse.message || 'Không thể hủy vé đi');
        }

        // Hủy vé về
        const returnResponse = await bookingService.cancelBooking(booking.return_original_id);
        if (returnResponse.status !== 'success') {
          throw new Error(returnResponse.message || 'Không thể hủy vé về');
        }

        console.log('[MyBookings] Round-trip booking cancelled successfully:', {
          outboundId: booking.original_id,
          returnId: booking.return_original_id,
          timestamp: new Date().toISOString()
        });
      } else {
        // Hủy vé một chiều - sử dụng ID gốc
        const originalId = booking.original_id || booking.id;
        console.log('[MyBookings] Cancelling one-way booking:', {
          originalId,
          bookingId,
          ticketNumber: booking.ticket_number,
          timestamp: new Date().toISOString()
        });

        const response = await bookingService.cancelBooking(originalId);
        if (response.status !== 'success') {
          throw new Error(response.message || 'Không thể hủy đặt vé');
        }

        console.log('[MyBookings] One-way booking cancelled successfully:', {
          originalId,
          timestamp: new Date().toISOString()
        });
      }

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
    } finally {
      setLoading(false);
    }
  };
  // Group round-trip bookings by checking if bookings are made within a short time of each other
  const groupReturnFlights = (bookingsList) => {
    // Lấy ID của booking cuối cùng từ localStorage
    const lastBookingId = localStorage.getItem('lastBookingId');
    
    // Log raw data
    console.log('[MyBookings] Raw bookings data:', {
      lastBookingId,
      bookings: bookingsList.map(b => ({
        id: b.id,
        flight: b.Flight?.flight_number,
        origin: b.Flight?.origin,
        destination: b.Flight?.destination,
        departure: b.Flight?.departure_time,
        created: b.createdAt,
        ticket_number: b.ticket_number
      })),
      timestamp: new Date().toISOString()
    });

    // Create pairs of bookings made within 5 seconds
    const pairs = [];
    const used = new Set();

    // Sắp xếp bookings theo thời gian tạo
    const sortedBookings = [...bookingsList].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Tìm và ghép các vé khứ hồi
    sortedBookings.forEach((booking1, i) => {
      if (used.has(booking1.id)) return;

      // Find matching return flight
      const match = sortedBookings.find((booking2, j) => {
        if (i === j || used.has(booking2.id)) return false;
        
        const time1 = new Date(booking1.createdAt).getTime();
        const time2 = new Date(booking2.createdAt).getTime();
        
        return Math.abs(time1 - time2) < 5000 && // Within 5 seconds
               booking1.class === booking2.class && // Same class
               booking1.Flight.origin === booking2.Flight.destination && // Return trip
               booking1.Flight.destination === booking2.Flight.origin;
      });

      if (match) {
        used.add(booking1.id);
        used.add(match.id);
        pairs.push([booking1, match]);
      }
    });

    // Process pairs into round-trip tickets
    const processedBookings = [];
    let roundTripCount = 0; // Đếm số vé khứ hồi

    pairs.forEach(([outbound, inbound]) => {
      roundTripCount++; // Tăng số thứ tự vé khứ hồi
      // Sử dụng ID của vé đi làm mã vé, ưu tiên lastBookingId nếu có
      const ticketNumber = `${outbound.Flight.flight_number}-${outbound.Flight.id}-${lastBookingId || outbound.id}`;

      console.log('[MyBookings] Creating round-trip ticket:', {
        ticket: ticketNumber,
        roundTripNumber: roundTripCount,
        outbound: outbound.Flight.flight_number,
        inbound: inbound.Flight.flight_number,
        original_ticket: outbound.ticket_number,
        lastBookingId,
        timestamp: new Date().toISOString()
      });

      processedBookings.push({
        ...outbound,
        id: `${outbound.id}-${inbound.id}`,
        original_id: outbound.id, // Lưu ID gốc của vé đi
        is_round_trip: true,
        round_trip_number: roundTripCount,
        ticket_number: ticketNumber,
        outbound_flight: outbound.Flight,
        return_flight: inbound.Flight,
        outbound_seat: outbound.Seat,
        return_seat: inbound.Seat,
        total_price: Number(outbound.total_price) + Number(inbound.total_price)
      });
    });

    // Process remaining unpaired bookings
    let oneWayCount = 0; // Đếm số vé một chiều
    sortedBookings.forEach(booking => {
      if (!used.has(booking.id)) {
        oneWayCount++; // Tăng số thứ tự vé một chiều
        // Sử dụng ID của vé làm mã vé, ưu tiên lastBookingId nếu có
        const ticketNumber = `${booking.Flight.flight_number}-${booking.Flight.id}-${lastBookingId || booking.id}`;

        console.log('[MyBookings] Creating one-way ticket:', {
          ticket: ticketNumber,
          oneWayNumber: oneWayCount,
          flight: booking.Flight.flight_number,
          original_ticket: booking.ticket_number,
          lastBookingId,
          timestamp: new Date().toISOString()
        });

        processedBookings.push({
          ...booking,
          original_id: booking.id, // Lưu ID gốc của vé
          is_round_trip: false,
          one_way_number: oneWayCount,
          ticket_number: ticketNumber,
          outbound_flight: booking.Flight,
          outbound_seat: booking.Seat
        });
      }
    });

    // Xóa lastBookingId sau khi đã sử dụng
    if (lastBookingId) {
      localStorage.removeItem('lastBookingId');
      console.log('[MyBookings] Removed lastBookingId:', {
        id: lastBookingId,
        timestamp: new Date().toISOString()
      });
    }

    console.log('[MyBookings] Final processed bookings:', processedBookings.map(b => ({
      ticket: b.ticket_number,
      isRoundTrip: b.is_round_trip,
      roundTripNumber: b.round_trip_number,
      oneWayNumber: b.one_way_number,
      originalId: b.original_id,
      timestamp: new Date().toISOString()
    })));

    return processedBookings.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  // Hàm helper để xử lý booking đơn lẻ
  const processBooking = (booking, processedBookings) => {
    const timestamp = new Date(booking.createdAt).getTime();
    const passengerNumber = booking.passenger_number || '1';
    const ticketNumber = `${booking.Flight.flight_number}-${passengerNumber}-${timestamp}`;
    
    processedBookings.push({
      ...booking,
      is_round_trip: false,
      ticket_number: ticketNumber,
      passenger_number: passengerNumber,
      outbound_flight: booking.Flight,
      outbound_seat: booking.Seat,
      total_price: Number(booking.total_price)
    });
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
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Đặt chỗ của tôi</h1>
        
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError('')}
            >
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải danh sách đặt vé...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Bạn chưa có đặt chỗ nào.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupReturnFlights(bookings).map((booking) => (
              <div key={booking.ticket_number} className="bg-white shadow rounded-lg p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      {booking.is_round_trip ? 'Vé khứ hồi' : 'Vé một chiều'} {booking.ticket_number}
                    </h2>
                    <p className="text-gray-600">
                      Ngày đặt: {formatDateTime(booking.createdAt)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status === 'Confirmed' ? 'Đã xác nhận' :
                     booking.status === 'Cancelled' ? 'Đã hủy' :
                     'Đang chờ xác nhận'}
                  </span>
                </div>

                {/* Chuyến bay đi */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold mb-4 text-blue-600">Chuyến bay đi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Mã chuyến bay</p>
                      <p className="font-medium">{booking.Flight?.flight_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hành trình</p>
                      <p className="font-medium">
                        {getCityName(booking.Flight?.origin)} → {getCityName(booking.Flight?.destination)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ngày khởi hành</p>
                      <p className="font-medium">
                        {formatDateTime(booking.Flight?.departure_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ngày đến</p>
                      <p className="font-medium">
                        {formatDateTime(booking.Flight?.arrival_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ghế</p>
                      <p className="font-medium text-blue-600">{booking.seat_number}</p>
                    </div>
                  </div>
                </div>

                {/* Chuyến bay về (chỉ hiển thị nếu là vé khứ hồi) */}
                {booking.is_round_trip && booking.return_flight && (
                  <div className="border-t border-gray-200 mt-6 pt-6">
                    <h3 className="font-semibold mb-4 text-green-600">Chuyến bay về</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Mã chuyến bay</p>
                        <p className="font-medium">{booking.return_flight?.flight_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hành trình</p>
                        <p className="font-medium">
                          {getCityName(booking.return_flight?.origin)} → {getCityName(booking.return_flight?.destination)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ngày khởi hành</p>
                        <p className="font-medium">
                          {formatDateTime(booking.return_flight?.departure_time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ngày đến</p>
                        <p className="font-medium">
                          {formatDateTime(booking.return_flight?.arrival_time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ghế</p>
                        <p className="font-medium text-green-600">{booking.return_seat_number}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thông tin thanh toán */}
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <h3 className="font-semibold mb-4">Thông tin thanh toán</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                      <p className="font-medium">{booking.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái</p>
                      <p className="font-medium text-green-600">Đã thanh toán</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tổng tiền</p>
                      <p className="font-medium">{formatPrice(booking.total_price)} VNĐ</p>
                    </div>
                  </div>
                </div>

                {booking.status === 'Confirmed' && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => handleCancelBooking(booking.id, booking.Flight?.departure_time)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Hủy đặt chỗ
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;