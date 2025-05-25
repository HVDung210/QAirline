import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FlightSearch from '../components/FlightSearch';

const Home = () => {
  const [tripType, setTripType] = useState('oneway');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Chào mừng đến với QAirline
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tìm kiếm và đặt vé máy bay một cách dễ dàng, nhanh chóng và tiết kiệm
          </p>
        </div>
        
        {/* Search Section */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 mb-16">
          <div className="mb-6">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setTripType('oneway')}
                className={`px-8 py-3 rounded-lg transition-all duration-200 ${
                  tripType === 'oneway'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Một chiều
              </button>
              <button
                onClick={() => setTripType('roundtrip')}
                className={`px-8 py-3 rounded-lg transition-all duration-200 ${
                  tripType === 'roundtrip'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Khứ hồi
              </button>
            </div>
          </div>
          <FlightSearch tripType={tripType} />
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-200">
            <div className="text-blue-600 text-4xl mb-4">
              <i className="fas fa-search"></i>
            </div>
            <h3 className="text-xl font-semibold mb-4">Tìm chuyến bay</h3>
            <p className="text-gray-600">
              Tìm kiếm chuyến bay phù hợp với lịch trình của bạn từ hơn 100 điểm đến
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-200">
            <div className="text-blue-600 text-4xl mb-4">
              <i className="fas fa-ticket-alt"></i>
            </div>
            <h3 className="text-xl font-semibold mb-4">Đặt vé</h3>
            <p className="text-gray-600">
              Đặt vé nhanh chóng và dễ dàng với nhiều lựa chọn thanh toán
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-200">
            <div className="text-blue-600 text-4xl mb-4">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h3 className="text-xl font-semibold mb-4">Quản lý đặt chỗ</h3>
            <p className="text-gray-600">
              Theo dõi và quản lý đặt chỗ của bạn một cách thuận tiện
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home; 