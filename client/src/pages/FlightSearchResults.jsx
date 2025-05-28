import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatTime, formatDate, formatPrice } from '../utils/formatters';
import { bookingService } from '../services/api';
import { getCityName } from '../data/cityMapping';
import axios from 'axios';
import FlightCard from '../components/FlightCard';

const FlightSearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchParams } = location.state || {};
  
  const [outboundFlights, setOutboundFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        // Fetch outbound flights
        const outboundParams = {
          origin: searchParams.origin,
          destination: searchParams.destination,
          departure_date: searchParams.departureDate,
          passengers: parseInt(searchParams.passengers),
          class: searchParams.class
        };
        console.log('Outbound search params:', outboundParams);
        
        const outboundResponse = await axios.get('/flights/search', { params: outboundParams });
        setOutboundFlights(outboundResponse.data?.data || []);

        // Fetch return flights if return date is provided
        if (searchParams.returnDate) {
          const returnParams = {
            origin: searchParams.destination,
            destination: searchParams.origin,
            departure_date: searchParams.returnDate,
            passengers: parseInt(searchParams.passengers),
            class: searchParams.class
          };
          console.log('Return search params:', returnParams);
          
          const returnResponse = await axios.get('/flights/search', { params: returnParams });
          setReturnFlights(returnResponse.data?.data || []);
        }
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

  const handleFlightSelect = (flight, isReturn = false) => {
    const availableSeatsByClass = flight.seats?.reduce((acc, seat) => {
      if (seat.is_available) {
        acc[seat.seat_type] = (acc[seat.seat_type] || 0) + 1;
      }
      return acc;
    }, {}) || {};

    const selectedClass = searchParams.class;
    const availableSeats = availableSeatsByClass[selectedClass] || 0;

    if (availableSeats < searchParams.passengers) {
      setError(`Chỉ còn ${availableSeats} ghế trống cho hạng ${selectedClass}`);
      return;
    }
    
    if (isReturn) {
      setSelectedReturnFlight(flight);
    } else {
      setSelectedOutboundFlight(flight);
    }
  };

  const handleContinue = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedOutboundFlight) {
      setError('Vui lòng chọn chuyến bay đi');
      return;
    }

    if (searchParams.returnDate && !selectedReturnFlight) {
      setError('Vui lòng chọn chuyến bay về');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const allBookings = [];
      let firstBookingId = null;

      console.log('[FlightSearchResults] Starting booking process:', {
        outboundFlight: selectedOutboundFlight.flight_number,
        returnFlight: selectedReturnFlight?.flight_number,
        passengers: searchParams.passengers,
        timestamp: new Date().toISOString()
      });

      // Tạo booking cho chuyến đi
      const outboundBookings = await createBookingForFlight(selectedOutboundFlight.id, false);
      if (outboundBookings.length > 0) {
        firstBookingId = outboundBookings[0].id;
        localStorage.setItem('lastBookingId', firstBookingId);
        console.log('[FlightSearchResults] Saved firstBookingId:', {
          id: firstBookingId,
          timestamp: new Date().toISOString()
        });
      }
      allBookings.push(...outboundBookings);

      // Nếu là vé khứ hồi, tạo booking cho chuyến về
      if (searchParams.returnDate && selectedReturnFlight) {
        console.log('[FlightSearchResults] Creating return bookings with lastBookingId:', {
          lastBookingId: localStorage.getItem('lastBookingId'),
          timestamp: new Date().toISOString()
        });
        const returnBookings = await createBookingForFlight(selectedReturnFlight.id, true);
        allBookings.push(...returnBookings);
      }

      console.log('[FlightSearchResults] All bookings created:', {
        total: allBookings.length,
        outbound: outboundBookings.length,
        return: allBookings.length - outboundBookings.length,
        lastBookingId: localStorage.getItem('lastBookingId'),
        timestamp: new Date().toISOString()
      });

      // Chuyển hướng đến trang thành công
      navigate('/bookings/success', {
        state: {
          bookings: allBookings,
          totalAmount: allBookings.reduce((sum, booking) => sum + booking.total_price, 0),
          searchParams,
          passengers: parseInt(searchParams.passengers),
          seats: allBookings.map(booking => booking.seat)
        }
      });
    } catch (error) {
      console.error('Error booking flights:', error);
      if (error.message.includes('Phiên đăng nhập đã hết hạn')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login', {
          state: {
            from: location.pathname,
            message: 'Vui lòng đăng nhập lại để tiếp tục đặt vé'
          }
        });
      } else {
        setError(error.message || 'Có lỗi xảy ra khi đặt vé');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createBookingForFlight = async (flightId, isReturn = false) => {
    try {
      const flight = isReturn ? selectedReturnFlight : selectedOutboundFlight;
      const lastBookingId = localStorage.getItem('lastBookingId');
      
      console.log('[FlightSearchResults] Creating bookings for flight:', {
        flightId,
        isReturn,
        passengers: searchParams.passengers,
        availableSeats: flight?.seats?.filter(seat => 
          seat.is_available && seat.seat_type === searchParams.class
        ).length,
        lastBookingId,
        timestamp: new Date().toISOString()
      });

      // Lấy danh sách ghế trống cùng loại
      const availableSeats = flight?.seats?.filter(seat => 
        seat.is_available && seat.seat_type === searchParams.class
      ).slice(0, parseInt(searchParams.passengers));

      if (!availableSeats || availableSeats.length < parseInt(searchParams.passengers)) {
        throw new Error(`Không đủ ghế trống cho ${searchParams.passengers} hành khách`);
      }

      // Tạo một booking cho mỗi hành khách
      const bookings = [];
      
      for (let i = 0; i < parseInt(searchParams.passengers); i++) {
        const bookingData = {
          flight_id: flightId,
          seat_id: availableSeats[i].id,
          passengers: 1,
          class: searchParams.class,
          payment_method: 'Cash',
          is_return: isReturn
        };

        console.log('[FlightSearchResults] Sending booking data:', {
          ...bookingData,
          lastBookingId,
          timestamp: new Date().toISOString()
        });

        const response = await bookingService.createBooking(bookingData);
        console.log('[FlightSearchResults] Booking response:', {
          status: response.status,
          id: response.data.id,
          lastBookingId,
          timestamp: new Date().toISOString()
        });

        if (response.status === 'success') {
          // Sử dụng lastBookingId cho tất cả các booking trong cùng một lần đặt
          const ticketNumber = `${flight.flight_number}-${flight.id}-${lastBookingId || response.data.id}`;
          const booking = {
            ...response.data,
            ticket_number: ticketNumber,
            is_return: isReturn,
            original_id: response.data.id,
            seat: {
              seat_number: availableSeats[i].seat_number,
              seat_type: availableSeats[i].seat_type,
              price: availableSeats[i].price
            },
            Flight: flight
          };
          console.log('[FlightSearchResults] Created booking:', {
            id: booking.id,
            original_id: booking.original_id,
            ticket_number: booking.ticket_number,
            lastBookingId,
            timestamp: new Date().toISOString()
          });
          bookings.push(booking);
        } else {
          throw new Error('Lỗi khi tạo booking');
        }
      }

      return bookings;
    } catch (error) {
      console.error('[FlightSearchResults] Error creating booking:', error);
      throw error;
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
        <p className="font-semibold">
          {getCityName(searchParams.origin)} → {getCityName(searchParams.destination)}
        </p>
        <p>Ngày đi: {formatDate(searchParams.departureDate)}</p>
        {searchParams.returnDate && (
          <p>Ngày về: {formatDate(searchParams.returnDate)}</p>
        )}
        <p>Số hành khách: {searchParams.passengers}</p>
        <p>Hạng vé: {searchParams.class}</p>
      </div>
      
      {outboundFlights.length === 0 ? (
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
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Chuyến bay đi</h2>
            <div className="grid gap-6">
              {outboundFlights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  isSelected={selectedOutboundFlight?.id === flight.id}
                  onClick={() => handleFlightSelect(flight, false)}
                  searchParams={searchParams}
                />
              ))}
            </div>
          </div>

          {searchParams.returnDate && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Chuyến bay về</h2>
              <div className="grid gap-6">
                {returnFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    isSelected={selectedReturnFlight?.id === flight.id}
                    onClick={() => handleFlightSelect(flight, true)}
                    searchParams={searchParams}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!selectedOutboundFlight || (searchParams.returnDate && !selectedReturnFlight) || isLoading}
              className={`px-6 py-3 rounded-lg text-white
                ${selectedOutboundFlight && (!searchParams.returnDate || selectedReturnFlight)
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