import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const formatDateTime = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : new Date(parseInt(dateString));
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
  const booking = location.state?.booking;
  const returnBooking = location.state?.returnBooking;

  useEffect(() => {
    console.log('BookingSuccess mounted with state:', location.state);
    
    // Check for required booking data
    if (!location.state || !booking) {
      console.log('No booking data found, redirecting to my bookings');
      navigate('/bookings/my-bookings');
      return;
    }

    // Validate required fields
    const requiredFields = ['id', 'flight_id', 'seat_id', 'passengers'];
    const missingFields = requiredFields.filter(field => !booking[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      navigate('/bookings/my-bookings');
      return;
    }

  }, [booking, navigate, location.state]);

  if (!booking) {
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

          {/* Outbound Flight */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold mb-4">
              {returnBooking ? 'Chuyến đi' : 'Thông tin chuyến bay'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mã booking</p>
                <p className="font-medium">#{booking.id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mã chuyến bay</p>
                <p className="font-medium">#{booking.flight_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày đặt vé</p>
                <p className="font-medium">
                  {formatDateTime(booking.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mã ghế</p>
                <p className="font-medium">#{booking.seat_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số hành khách</p>
                <p className="font-medium">{booking.passengers || 1}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng tiền</p>
                <p className="font-medium">{formatPrice(booking.total_price)} VNĐ</p>
              </div>
            </div>
          </div>

          {/* Return Flight */}
          {returnBooking && (
            <div className="border-t border-gray-200 pt-8 mt-8">
              <h3 className="text-lg font-semibold mb-4">Chuyến về</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã booking</p>
                  <p className="font-medium">#{returnBooking.id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mã chuyến bay</p>
                  <p className="font-medium">#{returnBooking.flight_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt vé</p>
                  <p className="font-medium">
                    {formatDateTime(returnBooking.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mã ghế</p>
                  <p className="font-medium">#{returnBooking.seat_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số hành khách</p>
                  <p className="font-medium">{returnBooking.passengers || 1}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng tiền</p>
                  <p className="font-medium">{formatPrice(returnBooking.total_price)} VNĐ</p>
                </div>
              </div>
            </div>
          )}

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