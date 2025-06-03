import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api'; // Import adminService

const AdminNotification = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        // Fetch posts of type 'announcement', potentially add limit/order here if needed
        const data = await adminService.getPosts({ type: 'announcement', limit: 10, order: [['createdAt', 'DESC']] }); 
        if (data && Array.isArray(data.posts)) {
          setAnnouncements(data.posts);
        } else {
          setAnnouncements([]); // Set empty array if response format is unexpected
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin announcements:', err);
        setError('Không thể tải thông báo admin.');
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <div className="text-center py-8 text-white">Đang tải thông báo...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-300">{error}</div>;
  }

  if (announcements.length === 0) {
    return null; // Don't render anything if there are no announcements
  }

  return (
    <div className="relative bg-cover bg-center py-8 text-white text-center" style={{ backgroundImage: "url('/src/assets/notification-background.jpg')" }}> {/* Use your actual image file name */}
      {/* Optional: Overlay for better text readability */}
      <div className="absolute inset-0 bg-black opacity-40"></div>
      
      {/* Content - Horizontal Scrollable */}
      <div className="relative z-10 flex overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"> {/* Added flex, overflow-x-auto, snap classes, and pb for scrollbar space */}
        {announcements.map((announcement) => (
          <div key={announcement.id} className="flex-shrink-0 w-full snap-center px-4"> {/* Added flex-shrink-0, w-full, snap-center, and horizontal padding */}
            <h3 className="text-xl font-semibold mb-2">{announcement.title}</h3> {/* Adjusted margin */}
            <p className="text-base">{announcement.content}</p>
          </div>
        ))}
        {/* Add more content here as needed */}
      </div>
    </div>
  );
};

export default AdminNotification; 