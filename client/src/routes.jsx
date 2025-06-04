import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FlightSearchResults from './pages/FlightSearchResults';
import BookingForm from './components/BookingForm';
import MyBookings from './pages/MyBookings';
import BookingSuccess from './pages/BookingSuccess';
import Profile from './pages/Profile';

// Admin components
import DashboardLayout from './layouts/admin/DashboardLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminFlights from './pages/admin/Flights';
import AdminAirplanes from './pages/admin/Airplanes';
import AdminBookings from './pages/admin/Bookings';
import AdminPosts from './pages/admin/Posts';

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/flights/search-results" element={<FlightSearchResults />} />
          
          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/booking/:flightId"
            element={
              <PrivateRoute>
                <BookingForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookings/my-bookings"
            element={
              <PrivateRoute>
                <MyBookings />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookings/success"
            element={
              <PrivateRoute>
                <BookingSuccess />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/flights"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <AdminFlights />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/airplanes"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <AdminAirplanes />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <AdminBookings />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/posts"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <AdminPosts />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default AppRoutes; 