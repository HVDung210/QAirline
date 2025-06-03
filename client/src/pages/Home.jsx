import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FlightSearch from '../components/FlightSearch';
import Footer from '../components/Footer';
import AppDownloadSection from '../components/AppDownloadSection';
import AdminNotification from '../components/AdminNotification';

const Home = () => {
  const [tripType, setTripType] = useState('oneway');
  const navigate = useNavigate();

  return (
    <>
      <AdminNotification />

      {/* Hero Section with Background Image and Overlay */}
      <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/src/assets/background.jpg')" }}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-30"></div>

        {/* Hero Content (aligned and padded) */}
        <div className="relative z-10 py-16 md:py-24">
          <div className="text-center mb-16 px-4">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 text-shadow-md"> {/* Changed text color and added shadow */}
              Chào mừng đến với QAirline
            </h1>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto text-shadow-sm"> {/* Changed text color and added shadow */}
              Tìm kiếm và đặt vé máy bay một cách dễ dàng, nhanh chóng và tiết kiệm
            </p>
            {/* <img src="/src/assets/travel-illustration.svg" alt="Travel Illustration" className="mx-auto mt-8 w-1/3 md:w-1/4" /> Reduced image size */}
          </div>

          {/* Search Section (centered and padded) */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-20"> {/* ... rest of search section */}
            <div className="mb-8">
              <div className="flex justify-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setTripType('oneway')}
                  className={`px-6 py-3 sm:px-8 sm:py-3 rounded-lg font-medium transition-all duration-300 ${
                    tripType === 'oneway'
                      ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Một chiều
                </button>
                <button
                  onClick={() => setTripType('roundtrip')}
                  className={`px-6 py-3 sm:px-8 sm:py-3 rounded-lg font-medium transition-all duration-300 ${
                    tripType === 'roundtrip'
                      ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Khứ hồi
                </button>
              </div>
            </div>
            <FlightSearch tripType={tripType} />
          </div>
        </div>
      </div>

      {/* Features Section (with a separate background) */}
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">

              {/* Feature Card 1 */}
              <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto text-blue-600">
                  <i className="fas fa-search text-2xl"></i>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">Tìm chuyến bay</h3> {/* Increased font size, adjusted color and margin */}
                <p className="text-gray-600">
                  Tìm kiếm chuyến bay phù hợp với lịch trình của bạn một cách nhanh chóng.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto text-green-600"> {/* Changed icon color for more variety */}
                  <i className="fas fa-ticket-alt text-2xl"></i>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">Đặt vé dễ dàng</h3>
                <p className="text-gray-600">
                  Đặt vé nhanh chóng với nhiều lựa chọn thanh toán an toàn và tiện lợi.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6 mx-auto text-purple-600"> {/* Changed icon color for more variety */}
                  <i className="fas fa-calendar-check text-2xl"></i>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">Quản lý đặt chỗ</h3>
                <p className="text-gray-600">
                  Theo dõi, thay đổi hoặc hủy đặt vé của bạn một cách thuận tiện.
                </p>
              </div>
            </div>
        </div>
      </div>

      <AppDownloadSection />
      <Footer />
    </>
  );
};

export default Home;