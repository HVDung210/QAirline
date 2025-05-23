import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatTime, formatDate, formatPrice } from '../utils/formatters';
import { createBooking } from '../services/bookingService';
import { getCityName } from '../data/cityMapping';

// FlightCard component
const FlightCard = ({ flight, isSelected, onClick, onSeatSelect }) => {
  // Group seats by type and only count available seats
  const seatsByType = flight.seats?.reduce((acc, seat) => {
    if (!acc[seat.seat_type]) {
      acc[seat.seat_type] = {
        count: 0,
        price: seat.price,
        seats: []
      }
    }
    if (seat.is_available) {
      acc[seat.seat_type].count++;
      acc[seat.seat_type].seats.push(seat);
    }
    return acc;
  }, {}) || {};
  
  return (
    <div
      onClick={!isSelected ? onClick : undefined}
      className={`bg-white rounded-lg shadow-md p-6 transition-all
        ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg cursor-pointer'}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg">
            {flight.airline} - {flight.flight_number}
          </p>
          <p className="font-semibold">
            {getCityName(flight.origin)} → {getCityName(flight.destination)}
          </p>
          <p className="text-sm text-gray-600">
            {formatTime(flight.departure_time)} - {formatDate(flight.departure_time)}
          </p>
          <p className="text-sm text-gray-600">
            {flight.airplane}
          </p>
        </div>
        <div className="text-right">
          {/* Hiển thị một dòng cho mỗi loại ghế */}
          {Object.entries(seatsByType).map(([type, { count, price, seats }]) => (
            <div key={type}>
              <p className="font-semibold text-blue-600">
                {type}: {formatPrice(price)}
              </p>
              {isSelected && (
                <select 
                  className="mt-2 border rounded p-1"
                  onChange={(e) => {
                    const selectedSeat = seats[e.target.value];
                    if (selectedSeat && selectedSeat.is_available) {
                      onSeatSelect(selectedSeat);
                    }
                  }}
                >
                  <option value="">Chọn ghế</option>
                  {seats.filter(seat => seat.is_available).map((seat, index) => (
                    <option key={seat.id} value={index}>
                      Ghế {seat.seat_number} - {seat.seat_type}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
          <p className="text-sm text-gray-600">
            {Object.values(seatsByType).reduce((sum, { count }) => sum + count, 0)} ghế trống
          </p>
        </div>
      </div>
    </div>
  );
};

const FlightSearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { departureFlights = [], returnFlights = [], searchParams, tripType } = location.state || {};
  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);
  const [selectedDepartureSeat, setSelectedDepartureSeat] = useState(null);
  const [selectedReturnSeat, setSelectedReturnSeat] = useState(null);
  const [error, setError] = useState('');

  // Ensure we have arrays to work with
  const safeDepartureFlights = Array.isArray(departureFlights) ? departureFlights : [];
  const safeReturnFlights = Array.isArray(returnFlights) ? returnFlights : [];

  // Debug state changes
  useEffect(() => {
    console.log('Flight selection state updated:', {
      departureFlight: selectedDepartureFlight?.id,
      returnFlight: selectedReturnFlight?.id,
      departureSeat: selectedDepartureSeat?.id,
      returnSeat: selectedReturnSeat?.id
    });
  }, [selectedDepartureFlight, selectedReturnFlight, selectedDepartureSeat, selectedReturnSeat]);

  const handleFlightSelect = (flight, type) => {
    if (!flight) return;

    if (type === 'departure') {
      // Only reset seat if selecting a different flight
      if (selectedDepartureFlight?.id !== flight.id) {
        setSelectedDepartureFlight(flight);
        setSelectedDepartureSeat(null);
      }
    } else {
      // Only reset seat if selecting a different return flight
      if (selectedReturnFlight?.id !== flight.id) {
        setSelectedReturnFlight(flight);
        setSelectedReturnSeat(null);
      }
    }
  };

  const handleSeatSelect = (seat, type) => {
    if (type === 'departure') {
      setSelectedDepartureSeat(seat);
    } else {
      setSelectedReturnSeat(seat);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Validate seat selections
    if (!selectedDepartureSeat) {
      setError('Vui lòng chọn ghế chuyến đi');
      return;
    }

    if (tripType === 'roundtrip' && !selectedReturnSeat) {
      setError('Vui lòng chọn ghế chuyến về');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Validate required data
      if (!selectedDepartureFlight?.id || !selectedDepartureSeat?.id) {
        throw new Error('Thiếu thông tin chuyến đi');
      }

      if (tripType === 'roundtrip' && (!selectedReturnFlight?.id || !selectedReturnSeat?.id)) {
        throw new Error('Thiếu thông tin chuyến về');
      }

      if (!searchParams?.passengers) {
        throw new Error('Thiếu thông tin số hành khách');
      }

      // Prepare booking data
      const departureBookingData = {
        flight_id: selectedDepartureFlight.id,
        seat_id: selectedDepartureSeat.id,
        passengers: parseInt(searchParams.passengers),
        class: selectedDepartureSeat.seat_type,
        payment_method: 'Cash'
      };

      const returnBookingData = tripType === 'roundtrip' ? {
        flight_id: selectedReturnFlight.id,
        seat_id: selectedReturnSeat.id,
        passengers: parseInt(searchParams.passengers),
        class: selectedReturnSeat.seat_type,
        payment_method: 'Cash'
      } : null;

      // Validate seat availability
      if (!selectedDepartureSeat.is_available) {
        throw new Error('Ghế chuyến đi không còn trống. Vui lòng chọn ghế khác.');
      }

      if (returnBookingData && !selectedReturnSeat.is_available) {
        throw new Error('Ghế chuyến về không còn trống. Vui lòng chọn ghế khác.');
      }

      // Create bookings
      console.log('Creating outbound booking:', departureBookingData);
      const departureResponse = await createBooking(departureBookingData);

      let returnResponse = null;
      if (returnBookingData) {
        console.log('Creating return booking:', returnBookingData);
        returnResponse = await createBooking(returnBookingData);
      }

      // Navigate to success page
      navigate('/bookings/success', {
        state: {
          booking: departureResponse.data,
          returnBooking: returnResponse?.data
        }
      });
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.message || 'Có lỗi xảy ra khi đặt vé');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Kết quả tìm kiếm</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4"
            onClick={() => setError('')}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {/* Departure Flights */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Chuyến bay đi từ {getCityName(searchParams.origin)} đến {getCityName(searchParams.destination)}
        </h2>
        <div className="space-y-4">
          {safeDepartureFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              isSelected={selectedDepartureFlight?.id === flight.id}
              onClick={() => handleFlightSelect(flight, 'departure')}
              onSeatSelect={(seat) => handleSeatSelect(seat, 'departure')}
            />
          ))}
        </div>
      </div>

      {/* Return Flights */}
      {tripType === 'roundtrip' && safeReturnFlights.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Chuyến bay về từ {getCityName(searchParams.destination)} đến {getCityName(searchParams.origin)}
          </h2>
          <div className="space-y-4">
            {safeReturnFlights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                isSelected={selectedReturnFlight?.id === flight.id}
                onClick={() => handleFlightSelect(flight, 'return')}
                onSeatSelect={(seat) => handleSeatSelect(seat, 'return')}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <button
          onClick={handleBooking}
          disabled={
            isLoading || 
            !selectedDepartureFlight ||
            !selectedDepartureSeat ||
            (tripType === 'roundtrip' && (!selectedReturnFlight || !selectedReturnSeat))
          }
          className={`px-6 py-3 rounded-lg text-white font-semibold ${
            isLoading || 
            !selectedDepartureFlight || 
            !selectedDepartureSeat || 
            (tripType === 'roundtrip' && (!selectedReturnFlight || !selectedReturnSeat))
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Đang xử lý...' : 'Tiếp tục đặt vé'}
        </button>
      </div>
    </div>
  );
};

export default FlightSearchResults;