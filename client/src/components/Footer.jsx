import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top section: Links and Description */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* What is QAirline? */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What is QAirline?</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              QAirline is a solution built based on modern web technologies to enable
              you create your own flight booking services.
            </p>
            <div className="flex items-center space-x-4 mt-6">
              
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-blue-600">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Press Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Terms of Services</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Guarantee</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Guide & Fee</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Support Desk</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">FAQs</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Feedback</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Affiliate Program</a></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Overview</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">How it Works</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Mobile App</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Business Customer</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Customer Review</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Community</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Travel Partner</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-8"></div>

        {/* Bottom section: Copyright and Social Media */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
          <p>© 2023 QAirline. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            {/* Social Icons */}
            <a href="#" className="text-gray-600 hover:text-blue-600"><img src="src/assets/facebook_icon.png" alt="Facebook" className="h-6 w-6" /></a>
            <a href="#" className="text-gray-600 hover:text-blue-600"><img src="src/assets/twitter_icon.png" alt="Twitter" className="h-6 w-6" /></a>
            <a href="#" className="text-gray-600 hover:text-blue-600"><img src="src/assets/youtube_icon.png" alt="YouTube" className="h-6 w-6" /></a>
            <a href="#" className="text-gray-600 hover:text-blue-600"><img src="src/assets/medium_icon.png" alt="Medium" className="h-6 w-6" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 