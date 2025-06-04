import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const isRedirecting = useRef(false);
  const redirectTimeout = useRef(null);

  // Get the redirect path from location state or default to home
  const from = location.state?.from || '/';
  const message = location.state?.message;

  useEffect(() => {
    const authInfo = {
      isLoggedIn: !!user,
      email: user?.email,
      role: user?.role,
      timestamp: new Date().toISOString()
    };
    console.log('[Login] Component mounted. Auth state:', JSON.stringify(authInfo, null, 2));

    // Nếu đã đăng nhập, chuyển hướng
    if (user && !isRedirecting.current) {
      const redirectInfo = {
        email: user.email,
        role: user.role,
        timestamp: new Date().toISOString()
      };
      console.log('[Login] User already logged in, redirecting:', JSON.stringify(redirectInfo, null, 2));
      
      isRedirecting.current = true;
      const redirectPath = user.role === 'admin' ? '/admin' : from;
      const pathInfo = {
        path: redirectPath,
        role: user.role,
        timestamp: new Date().toISOString()
      };
      console.log('[Login] Executing redirect to:', JSON.stringify(pathInfo, null, 2));
      
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, from]);

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra trạng thái đăng nhập...</p>
        </div>
      </div>
    );
  }

  // If already logged in, show loading
  if (user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const submitInfo = {
      email: formData.email,
      timestamp: new Date().toISOString()
    };
    console.log('[Login] Form submitted:', JSON.stringify(submitInfo, null, 2));

    try {
      console.log('[Login] Attempting login...');
      const userData = await login(formData);
      
      const successInfo = {
        email: userData.email,
        role: userData.role,
        timestamp: new Date().toISOString()
      };
      console.log('[Login] Login successful:', JSON.stringify(successInfo, null, 2));

      // Không cần chuyển hướng ở đây vì useEffect sẽ xử lý
      setSuccess('Đăng nhập thành công!');
    } catch (error) {
      const errorInfo = {
        message: error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      };
      console.error('[Login] Login error:', JSON.stringify(errorInfo, null, 2));
      setError(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng nhập
        </h2>
        {message && (
          <div className="mt-2 text-center text-sm text-red-600">
            {message}
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-2">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Chưa có tài khoản?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Đăng ký ngay
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;