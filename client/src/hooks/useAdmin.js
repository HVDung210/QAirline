import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-toastify';

export const useAirplanes = () => {
  const [airplanes, setAirplanes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAirplanes = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAirplanes();
      setAirplanes(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách tàu bay');
      console.error('Error fetching airplanes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAirplane = async (data) => {
    try {
      await adminService.createAirplane(data);
      toast.success('Thêm tàu bay mới thành công');
      fetchAirplanes();
    } catch (error) {
      toast.error('Lỗi khi thêm tàu bay');
      throw error;
    }
  };

  const updateAirplane = async (id, data) => {
    try {
      await adminService.updateAirplane(id, data);
      toast.success('Cập nhật tàu bay thành công');
      fetchAirplanes();
    } catch (error) {
      toast.error('Lỗi khi cập nhật tàu bay');
      throw error;
    }
  };

  const deleteAirplane = async (id) => {
    try {
      await adminService.deleteAirplane(id);
      toast.success('Xóa tàu bay thành công');
      fetchAirplanes();
    } catch (error) {
      toast.error('Lỗi khi xóa tàu bay');
      throw error;
    }
  };

  return {
    airplanes,
    loading,
    fetchAirplanes,
    createAirplane,
    updateAirplane,
    deleteAirplane,
  };
};

export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async (params) => {
    try {
      setLoading(true);
      const response = await adminService.getBookings(params);
      setBookings(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đặt vé');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingStats = async (params) => {
    try {
      const response = await adminService.getBookingDetails(params);
      setStats(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải thống kê đặt vé');
      console.error('Error fetching booking stats:', error);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await adminService.updateBookingStatus(id, status);
      toast.success('Cập nhật trạng thái đặt vé thành công');
      fetchBookings();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái đặt vé');
      throw error;
    }
  };

  return {
    bookings,
    stats,
    loading,
    fetchBookings,
    fetchBookingStats,
    updateBookingStatus,
  };
};

export const useFlights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await adminService.getFlights();
      setFlights(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách chuyến bay');
      console.error('Error fetching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFlight = async (data) => {
    try {
      await adminService.createFlight(data);
      toast.success('Thêm chuyến bay mới thành công');
      fetchFlights();
    } catch (error) {
      toast.error('Lỗi khi thêm chuyến bay');
      throw error;
    }
  };

  const updateFlight = async (id, data) => {
    try {
      await adminService.updateFlight(id, data);
      toast.success('Cập nhật chuyến bay thành công');
      fetchFlights();
    } catch (error) {
      toast.error('Lỗi khi cập nhật chuyến bay');
      throw error;
    }
  };

  const updateFlightDelay = async (id, delayTime) => {
    try {
      await adminService.updateFlightDelay(id, delayTime);
      toast.success('Cập nhật thời gian delay thành công');
      fetchFlights();
    } catch (error) {
      toast.error('Lỗi khi cập nhật thời gian delay');
      throw error;
    }
  };

  const deleteFlight = async (id) => {
    try {
      await adminService.deleteFlight(id);
      toast.success('Xóa chuyến bay thành công');
      fetchFlights();
    } catch (error) {
      toast.error('Lỗi khi xóa chuyến bay');
      throw error;
    }
  };

  return {
    flights,
    loading,
    fetchFlights,
    createFlight,
    updateFlight,
    updateFlightDelay,
    deleteFlight,
  };
};

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPosts();
      setPosts(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách bài viết');
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (data) => {
    try {
      await adminService.createPost(data);
      toast.success('Thêm bài viết mới thành công');
      fetchPosts();
    } catch (error) {
      toast.error('Lỗi khi thêm bài viết');
      throw error;
    }
  };

  const updatePost = async (id, data) => {
    try {
      await adminService.updatePost(id, data);
      toast.success('Cập nhật bài viết thành công');
      fetchPosts();
    } catch (error) {
      toast.error('Lỗi khi cập nhật bài viết');
      throw error;
    }
  };

  const deletePost = async (id) => {
    try {
      await adminService.deletePost(id);
      toast.success('Xóa bài viết thành công');
      fetchPosts();
    } catch (error) {
      toast.error('Lỗi khi xóa bài viết');
      throw error;
    }
  };

  return {
    posts,
    loading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
  };
}; 