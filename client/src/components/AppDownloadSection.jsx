import React from 'react';

const AppDownloadSection = () => {
  return (
    <div className="bg-blue-600 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Section: Text and Download Links */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl font-bold mb-6">Flight Booking App</h2>
          <p className="text-lg mb-8 leading-relaxed">
            Download the QAirline mobile app for one-touch access to your
            next travel adventure. With the QAirline mobile app you'll get
            access to hidden features and special offers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-6 sm:space-y-0 sm:space-x-6">
            {/* App Store and Google Play Buttons */}
            <div className="flex flex-col space-y-4">
              {/* App Store Button */}
              <a href="#"><img src="src/assets/appstore.png" alt="Download on the App Store" className="w-48 h-auto" /></a>
              {/* Google Play Button */}
              <a href="#"><img src="src/assets/googleplay.png" alt="Get it on Google Play" className="w-48 h-auto" /></a>
            </div>
          </div>
        </div>

        {/* Right Section: Mobile Mockup */}
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <img src="src/assets/mobilemockup.png" alt="Mobile App Mockup" className="w-64 h-auto" />
        </div>
      </div>
    </div>
  );
};

export default AppDownloadSection; 