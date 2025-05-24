import React from 'react';
import { formatTime, formatDate, formatPrice } from '../utils/formatters';
import { getCityName } from '../data/cityMapping';

const FlightCard = ({ flight, isSelected, onClick, searchParams }) => {
  // Group seats by type and only count available seats
  const seatsByType = flight.seats?.reduce((acc, seat) => {
    if (seat.is_available) {
      if (!acc[seat.seat_type]) {
        acc[seat.seat_type] = {
          count: 0,
          price: seat.price
        };
      }
      acc[seat.seat_type].count++;
    }
    return acc;
  }, {}) || {};

  const passengers = searchParams?.passengers || 1;
  
  return (
    <div
      onClick={!isSelected ? onClick : undefined}
      className={`bg-white rounded-lg shadow-md p-6 mb-4 transition-all
        ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg cursor-pointer'}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-lg mb-2">
            {flight.airline} - {flight.flight_number}
          </p>
          <p className="font-semibold text-gray-800">
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
          {Object.entries(seatsByType).map(([type, { count, price }]) => (
            <div key={type} className="mb-2">
              <p className="font-semibold text-blue-600">
                {type}: {formatPrice(price)} VNĐ
              </p>
              <p className={`text-sm ${count < passengers ? 'text-red-500' : 'text-green-600'}`}>
                {count} ghế trống
                {count < passengers && (
                  <span className="block text-red-500 text-xs">
                    Không đủ ghế cho {passengers} hành khách
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlightCard;
