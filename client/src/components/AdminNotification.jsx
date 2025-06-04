import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { IconButton } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const AdminNotification = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 1;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await adminService.getPosts({ order: [['createdAt', 'DESC']] });
        if (data && Array.isArray(data.posts)) {
          setAnnouncements(data.posts);
        } else {
          setAnnouncements([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Không thể tải bài viết.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (
      prevIndex === 0 ? announcements.length - 1 : prevIndex - 1
    ));
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => (
      prevIndex === announcements.length - 1 ? 0 : prevIndex + 1
    ));
  };

  if (loading) {
    return <div className="text-center py-2 text-gray-700">Đang tải bài viết...</div>;
  }

  if (error) {
    return <div className="text-center py-2 text-red-500">{error}</div>;
  }

  if (announcements.length === 0) {
    return null;
  }

  const currentPost = announcements[currentIndex];

  const currentMarqueeText = currentPost ? 
    `${currentPost.post_type.charAt(0).toUpperCase() + currentPost.post_type.slice(1)}: ${currentPost.title} ${currentPost.content ? `- ${currentPost.content}` : ''}`
    : '';

  return (
    <div className="bg-blue-100 py-2 text-gray-700 text-center flex items-center justify-between relative z-0">
      <IconButton onClick={goToPrevious} style={{ color: 'gray' }}>
        <ArrowBack />
      </IconButton>
      
      <div className="flex-grow mx-2 overflow-hidden whitespace-nowrap flex items-center">
         <div key={currentIndex} className="inline-block animate-marquee px-4 min-w-full">
           {currentMarqueeText}
         </div>
      </div>
      
      <IconButton onClick={goToNext} style={{ color: 'gray' }}>
        <ArrowForward />
      </IconButton>
    </div>
  );
};

export default AdminNotification;