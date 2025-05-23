import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightService } from '../services/api';
import { cities } from '../data/cities';
import { formatDateForInput } from '../utils/formatters';

const FlightSearch = ({ tripType }) => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    class: 'Economy'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate dates
      const departureDate = new Date(searchData.departureDate);
      departureDate.setHours(0, 0, 0, 0);

      if (tripType === 'roundtrip') {
        const returnDate = new Date(searchData.returnDate);
        returnDate.setHours(0, 0, 0, 0);

        if (returnDate < departureDate) {
          setError('Ngày về phải sau ngày đi');
          setLoading(false);
          return;
        }
      }

      // Search for flights
      const departureFlights = await flightService.searchFlights({
        origin: searchData.origin,
        destination: searchData.destination,
        departure_date: searchData.departureDate,
        passengers: searchData.passengers,
        class: searchData.class
      });

      let returnFlights = [];
      if (tripType === 'roundtrip') {
        returnFlights = await flightService.searchFlights({
          origin: searchData.destination,
          destination: searchData.origin,
          departure_date: searchData.returnDate,
          passengers: searchData.passengers,
          class: searchData.class
        });
      }

      if (departureFlights.length === 0) {
        setError('Không tìm thấy chuyến bay phù hợp');
        setLoading(false);
        return;
      }

      if (tripType === 'roundtrip' && returnFlights.length === 0) {
        setError('Không tìm thấy chuyến bay về phù hợp');
        setLoading(false);
        return;
      }

      navigate('/flights/search-results', {
        state: {
          departureFlights,
          returnFlights,
          searchParams: searchData,
          tripType
        }
      });
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tìm kiếm chuyến bay');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Origin and Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điểm đi
            </label>
            <select
              name="origin"
              value={searchData.origin}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn điểm đi</option>
              {cities.map(city => (
                <option key={city.id} value={city.code}>
                  {city.name} ({city.code})
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điểm đến
            </label>
            <select
              name="destination"
              value={searchData.destination}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn điểm đến</option>
              {cities.map(city => (
                <option key={city.id} value={city.code}>
                  {city.name} ({city.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Departure Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày đi
            </label>
            <input
              type="date"
              name="departureDate"
              value={searchData.departureDate}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Return Date */}
          {tripType === 'roundtrip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày về
              </label>
              <input
                type="date"
                name="returnDate"
                value={searchData.returnDate}
                onChange={handleInputChange}
                required
                min={searchData.departureDate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Passengers and Class Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số hành khách
            </label>
            <select
              name="passengers"
              value={searchData.passengers}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'hành khách' : 'hành khách'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hạng vé
            </label>
            <select
              name="class"
              value={searchData.class}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Economy">Phổ thông</option>
              <option value="Business">Thương gia</option>
              <option value="First">Hạng nhất</option>
            </select>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-3 rounded-lg text-white font-semibold ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Đang tìm kiếm...' : 'Tìm chuyến bay'}
        </button>
      </div>
    </form>
  );
};

export default FlightSearch; 