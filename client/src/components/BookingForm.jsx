import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as bookingService from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';
import { flightService } from '../services/api';

const BookingForm = () => {
  const navigate = useNavigate();
  const { flightId } = useParams();
  const { user, loading } = useAuth();
  const [flight, setFlight] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookingData, setBookingData] = useState({
    passengers: 1,
    class_type: 'Economy',
    payment_method: 'Cash'
  });
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [error, setError] = useState('');
  const [seatAvailable, setSeatAvailable] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      localStorage.setItem('pendingBookingFlightId', flightId);
      navigate('/login', {
        state: {
          from: `/booking/${flightId}`,
          message: 'Vui lòng đăng nhập để đặt vé'
        }
      });
      return;
    }
    const pendingFlightId = localStorage.getItem('pendingBookingFlightId');
    if (pendingFlightId && pendingFlightId !== flightId) {
      navigate(`/booking/${pendingFlightId}`);
      localStorage.removeItem('pendingBookingFlightId');
      return;
    }
    fetchFlightDetails();
  }, [user, flightId, loading]);

  const fetchFlightDetails = async () => {
    try {
      const response = await flightService.getFlightDetails(flightId);
      console.log('Flight details response:', response);
      setFlight(response.data);
    } catch (err) {
      console.error('Error fetching flight details:', err);
      setError('Không thể tải thông tin chuyến bay');
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleSeatSelection = (seat) => {
    console.log('Seat selected:', seat);
    setSelectedSeat(seat);
    setBookingData(prev => ({
      ...prev,
      class_type: seat.seat_type
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input changed:', name, value);
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingLocal(true);

    if (loading) {
      return <div>Đang kiểm tra đăng nhập...</div>;
    }

    if (!user) {
      navigate('/login', {
        state: {
          from: `/booking/${flightId}`,
          message: 'Vui lòng đăng nhập để đặt vé'
        }
      });
      return;
    }

    if (!selectedSeat || !seatAvailable) {
      setError('Vui lòng chọn ghế hợp lệ');
      setLoadingLocal(false);
      return;
    }

    try {
      console.log('Submitting booking data:', {
        flight_id: flightId,
        seat_id: selectedSeat.id,
        passengers: bookingData.passengers,
        class: selectedSeat.seat_type,
        payment_method: bookingData.payment_method
      });

      const response = await bookingService.createBooking({
        flight_id: flightId,
        seat_id: selectedSeat.id,
        passengers: bookingData.passengers,
        class: selectedSeat.seat_type,
        payment_method: bookingData.payment_method
      });

      console.log('Booking response:', response);

      if (response.status === 'success' && response.data) {
        console.log('Navigating to success page with booking:', response.data);
        navigate('/bookings/success', {
          state: { booking: response.data }
        });
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi đặt vé');
      if (err.message?.includes('no longer available')) {
        setSeatAvailable(false);
      }
    } finally {
      setLoadingLocal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">Đang kiểm tra đăng nhập...</div>
        </div>
      </div>
    );
  }

  if (loadingLocal) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">Đang tải thông tin chuyến bay...</div>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy thông tin chuyến bay</h1>
            <button
              onClick={() => navigate('/flights/search')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tìm chuyến bay khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Đặt vé chuyến bay {flight.flight_number}</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Thông tin chuyến bay</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Hành trình</p>
                <p className="font-medium">{flight.origin} → {flight.destination}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày khởi hành</p>
                <p className="font-medium">
                  {new Date(flight.departure_time).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hãng hàng không</p>
                <p className="font-medium">{flight.Airplane?.Airline?.name}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Chọn ghế</h2>
              <div className="grid grid-cols-3 gap-4">
                {flight.Seats?.filter(seat => seat.is_available).map(seat => (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => handleSeatSelection(seat)}
                    className={`p-4 border rounded-lg text-center ${
                      selectedSeat?.id === seat.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >                    <p className="font-medium">{seat.seat_type}</p>
                    <p className="text-sm text-gray-600">Seat #{seat.id}</p>
                    <p className="text-sm font-medium text-blue-600">
                      {seat.price.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {selectedSeat && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số hành khách
                  </label>
                  <input
                    type="number"
                    name="passengers"
                    min="1"
                    max="9"
                    value={bookingData.passengers}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phương thức thanh toán
                  </label>
                  <select
                    name="payment_method"
                    value={bookingData.payment_method}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Cash">Tiền mặt</option>
                    <option value="Credit Card">Thẻ tín dụng</option>
                    <option value="Debit Card">Thẻ ghi nợ</option>
                    <option value="Bank Transfer">Chuyển khoản</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>

                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Tổng tiền:</p>
                    <p className="text-xl font-bold text-blue-600">
                      {(selectedSeat.price * bookingData.passengers).toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={loadingLocal || !seatAvailable}
                    className={`px-6 py-2 rounded-md text-white font-medium ${
                      loadingLocal || !seatAvailable
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loadingLocal ? 'Đang xử lý...' : 'Xác nhận đặt vé'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm; 