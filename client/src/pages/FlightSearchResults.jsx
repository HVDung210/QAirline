import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatTime, formatDate, formatPrice } from '../utils/formatters';
import { createBooking } from '../services/bookingService';
import { getCityName } from '../data/cityMapping';
import axios from 'axios';
import FlightCard from '../components/FlightCard';

const FlightSearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();  const { searchParams } = location.state || {};
  
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const tripType = searchParams?.tripType;

  useEffect(() => {    const fetchFlights = async () => {      try {          setLoading(true);
        // Ensure all required parameters are properly formatted
        const params = {
          origin: searchParams.origin,
          destination: searchParams.destination,
          departure_date: searchParams.departureDate,
          passengers: parseInt(searchParams.passengers),
          class: searchParams.class
        };
        console.log('Search params:', params);
        
        const response = await axios.get('/flights/search', { params });
        // Access the flights array from the response data structure
        setFlights(response.data?.data || []);
      } catch (err) {
        setError('Không thể tải danh sách chuyến bay. Vui lòng thử lại sau.');
        console.error('Error fetching flights:', err);
      } finally {
        setLoading(false);
      }
    };

    if (searchParams) {
      fetchFlights();
    } else {
      setError('Không tìm thấy thông tin tìm kiếm.');
    }
  }, [searchParams]);

  const handleFlightSelect = (flight) => {
    // Check if there are enough available seats for all passengers
    const totalAvailableSeats = flight.seats?.reduce((total, seat) => 
      total + (seat.is_available ? 1 : 0), 0) || 0;
      
    if (totalAvailableSeats < searchParams.passengers) {
      setError(`Chuyến bay này không có đủ ${searchParams.passengers} ghế trống.`);
      return;
    }
    
    setSelectedFlight(flight);
  };

  const handleContinue = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedFlight) {
      setError('Vui lòng chọn một chuyến bay.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Validate required data
      if (!selectedFlight?.id) {
        throw new Error('Thiếu thông tin chuyến bay');
      }

      if (!searchParams?.passengers) {
        throw new Error('Thiếu thông tin số hành khách');
      }

      // Prepare booking data
      const bookingData = {
        flight_id: selectedFlight.id,
        seat_id: selectedFlight.seats.find(seat => seat.is_available).id, // Automatically select an available seat
        passengers: parseInt(searchParams.passengers),
        class: selectedFlight.seats.find(seat => seat.is_available).seat_type,
        payment_method: 'Cash'
      };

      // Create booking
      console.log('Creating booking:', bookingData);
      const response = await createBooking(bookingData);

      // Navigate to success page
      navigate('/bookings/success', {
        state: {
          booking: response.data
        }
      });
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.message || 'Có lỗi xảy ra khi đặt vé');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Kết quả tìm kiếm</h1>
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="font-semibold">          {getCityName(searchParams.origin)} → {getCityName(searchParams.destination)}
        </p>
        <p>Ngày: {formatDate(searchParams.departureDate)}</p>
        <p>Số hành khách: {searchParams.passengers}</p>
        <p>Hạng vé: {searchParams.class}</p>
      </div>
      
      {flights.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Không tìm thấy chuyến bay nào phù hợp.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tìm kiếm lại
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {flights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                isSelected={selectedFlight?.id === flight.id}
                onClick={() => handleFlightSelect(flight)}
                searchParams={searchParams}
              />
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!selectedFlight || isLoading}
              className={`px-6 py-3 rounded-lg text-white
                ${selectedFlight
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              {isLoading ? 'Đang xử lý...' : 'Tiếp tục đặt vé'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FlightSearchResults;