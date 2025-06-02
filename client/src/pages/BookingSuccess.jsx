import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
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

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookings = location.state?.bookings || [];
  const totalAmount = location.state?.totalAmount || 0;
  const searchParams = location.state?.searchParams || {};
  const passengers = location.state?.passengers || 1;
  const seats = location.state?.seats || [];

  useEffect(() => {
    console.log('[BookingSuccess] Component mounted with state:', {
      bookings,
      totalAmount,
      searchParams,
      passengers,
      seats,
      rawState: location.state,
      lastBookingId: localStorage.getItem('lastBookingId'),
      timestamp: new Date().toISOString()
    });
    
    if (!location.state || !bookings.length) {
      console.log('[BookingSuccess] No booking data found, redirecting to my bookings');
      navigate('/bookings/my-bookings');
      return;
    }

    // Validate booking data
    const validBookings = bookings.filter(booking => {
      const isValid = booking && 
        booking.booking_reference && 
        booking.Flight && 
        booking.class && 
        booking.passengers && 
        booking.total_price;
      
      if (!isValid) {
        console.warn('[BookingSuccess] Invalid booking data:', booking);
      }
      
      return isValid;
    });

    if (validBookings.length !== bookings.length) {
      console.error('[BookingSuccess] Some bookings have invalid data');
      navigate('/bookings/my-bookings');
      return;
    }
  }, [bookings, navigate, location.state, totalAmount, searchParams, passengers, seats]);

  // Group bookings by outbound and return
  const groupedBookings = bookings.reduce((acc, booking) => {
    // Lấy ID của booking cuối cùng từ localStorage
    const lastBookingId = localStorage.getItem('lastBookingId');
    
    // Sử dụng ID của vé đi làm mã vé, ưu tiên lastBookingId nếu có
    const ticketNumber = `${booking.Flight?.flight_number}-${booking.Flight?.id}-${lastBookingId || booking.id}`;
    const key = ticketNumber;
    
    console.log('[BookingSuccess] Processing booking:', {
      original_ticket: booking.ticket_number,
      new_ticket: ticketNumber,
      flightNumber: booking.Flight?.flight_number,
      passengerNumber: booking.passenger_number || '1',
      bookingId: booking.id,
      lastBookingId,
      key,
      is_return: booking.is_return,
      flight: booking.Flight,
      timestamp: new Date().toISOString()
    });
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push({
      ...booking,
      ticket_number: ticketNumber
    });
    return acc;
  }, {});

  // Tìm và ghép các vé khứ hồi
  const processedBookings = [];
  const usedBookings = new Set();

  // Sắp xếp bookings theo thời gian tạo
  const sortedBookings = Object.values(groupedBookings).flat().sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Tìm và ghép các vé khứ hồi
  sortedBookings.forEach((booking1, i) => {
    if (usedBookings.has(booking1.id)) return;

    // Tìm vé về tương ứng
    const returnBooking = sortedBookings.find((booking2, j) => {
      if (i === j || usedBookings.has(booking2.id)) return false;
      
      const time1 = new Date(booking1.createdAt).getTime();
      const time2 = new Date(booking2.createdAt).getTime();
      
      return Math.abs(time1 - time2) < 5000 && // Trong khoảng 5 giây
             booking1.class === booking2.class && // Cùng hạng vé
             booking1.Flight.origin === booking2.Flight.destination && // Hành trình ngược nhau
             booking1.Flight.destination === booking2.Flight.origin;
    });

    if (returnBooking) {
      // Ghép thành vé khứ hồi
      usedBookings.add(booking1.id);
      usedBookings.add(returnBooking.id);
      
      // Lấy ID của booking cuối cùng từ localStorage
      const lastBookingId = localStorage.getItem('lastBookingId');
      // Sử dụng ID của vé đi làm mã vé, ưu tiên lastBookingId nếu có
      const ticketNumber = `${booking1.Flight.flight_number}-${booking1.Flight.id}-${lastBookingId || booking1.id}`;
      
      console.log('[BookingSuccess] Creating round-trip ticket:', {
        ticket: ticketNumber,
        outbound: booking1.Flight.flight_number,
        return: returnBooking.Flight.flight_number,
        lastBookingId,
        timestamp: new Date().toISOString()
      });
      
      processedBookings.push({
        ticket_number: ticketNumber,
        createdAt: booking1.createdAt,
        Flight: booking1.Flight,
        return_flight: returnBooking.Flight,
        class: booking1.class,
        payment_method: booking1.payment_method,
        status: booking1.status,
        total_price: Number(booking1.total_price) + Number(returnBooking.total_price),
        seat_number: booking1.seat?.seat_number || 'N/A',
        return_seat_number: returnBooking.seat?.seat_number || 'N/A',
        is_round_trip: true
      });
    } else {
      // Xử lý vé một chiều
      usedBookings.add(booking1.id);
      // Lấy ID của booking cuối cùng từ localStorage
      const lastBookingId = localStorage.getItem('lastBookingId');
      // Sử dụng ID của vé làm mã vé, ưu tiên lastBookingId nếu có
      const ticketNumber = `${booking1.Flight.flight_number}-${booking1.Flight.id}-${lastBookingId || booking1.id}`;
      
      console.log('[BookingSuccess] Creating one-way ticket:', {
        ticket: ticketNumber,
        flight: booking1.Flight.flight_number,
        lastBookingId,
        timestamp: new Date().toISOString()
      });
      
      processedBookings.push({
        ticket_number: ticketNumber,
        createdAt: booking1.createdAt,
        Flight: booking1.Flight,
        class: booking1.class,
        payment_method: booking1.payment_method,
        status: booking1.status,
        total_price: Number(booking1.total_price),
        seat_number: booking1.seat?.seat_number || 'N/A',
        is_round_trip: false
      });
    }
  });

  // Xóa lastBookingId sau khi đã xử lý xong tất cả bookings
  const lastBookingId = localStorage.getItem('lastBookingId');
  if (lastBookingId) {
    localStorage.removeItem('lastBookingId');
    console.log('[BookingSuccess] Removed lastBookingId:', {
      id: lastBookingId,
      timestamp: new Date().toISOString()
    });
  }

  // Sắp xếp lại theo thời gian tạo mới nhất
  processedBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  console.log('[BookingSuccess] Final processed bookings:', processedBookings.map(b => ({
    ticket: b.ticket_number,
    isRoundTrip: b.is_round_trip,
    outbound: b.Flight?.flight_number,
    return: b.return_flight?.flight_number,
    timestamp: new Date().toISOString()
  })));

  // Log để debug
  console.log('[BookingSuccess] Grouped bookings:', groupedBookings);
  console.log('[BookingSuccess] Processed bookings:', processedBookings);

  if (!bookings.length) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy thông tin đặt vé</h1>
            <p className="text-gray-600 mb-4">Đang chuyển hướng đến trang đặt vé của bạn...</p>
            <button
              onClick={() => navigate('/bookings/my-bookings')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Xem danh sách đặt vé của tôi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-3 text-lg font-medium text-gray-900">Đặt vé thành công</h2>
            <p className="mt-2 text-sm text-gray-500">
              Cảm ơn bạn đã đặt vé. Dưới đây là thông tin chi tiết đặt chỗ của bạn.
            </p>
          </div>

          {processedBookings.map((booking) => (
            <div key={booking.ticket_number} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">
                {booking.is_round_trip ? 'Vé khứ hồi' : 'Vé một chiều'} {booking.ticket_number}
              </h3>
              <div className="border-t border-gray-200 pt-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã vé</p>
                    <p className="font-medium">{booking.ticket_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày đặt vé</p>
                    <p className="font-medium">
                      {formatDateTime(booking.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Chuyến bay đi */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-2 text-blue-600">Chuyến bay đi</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Mã chuyến bay</p>
                      <p className="font-medium">{booking.Flight?.flight_number || 'N/A'}</p>
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
                  </div>
                </div>

                {/* Chuyến bay về (chỉ hiển thị nếu là vé khứ hồi) */}
                {booking.is_round_trip && booking.return_flight && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2 text-green-600">Chuyến bay về</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Mã chuyến bay</p>
                        <p className="font-medium">{booking.return_flight?.flight_number || 'N/A'}</p>
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
                    </div>
                  </div>
                )}

                {/* Thông tin thanh toán */}
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                      <p className="font-medium">{booking.payment_method || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái</p>
                      <p className="font-medium">
                        {booking.status === 'Confirmed' ? 'Đã xác nhận' :
                         booking.status === 'Cancelled' ? 'Đã hủy' :
                         'Đang chờ xác nhận'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Giá vé</p>
                      <p className="font-medium">{formatPrice(booking.total_price)} VNĐ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-8 pt-8 border-t">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Tổng tiền:</p>
              <p className="text-xl font-bold text-blue-600">{formatPrice(totalAmount)} VNĐ</p>
            </div>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => navigate('/bookings/my-bookings')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Xem danh sách đặt vé
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;