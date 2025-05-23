import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000, // 10 seconds timeout
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept all status codes less than 500
  }
});

// Add request interceptor
api.interceptors.request.use(  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(  (response) => {
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Flight services
export const flightService = {
  searchFlights: async (params) => {
    try {
      const response = await api.get('/flights/search', { 
        params,
        transformResponse: [(data) => {
          const parsed = JSON.parse(data);
          return parsed.data || parsed; // Return data array directly if it exists
        }]
      });
      return response.data;
    } catch (error) {
      console.error('Error in flightService.searchFlights:', error);
      throw error;
    }
  },
  getFlightDetails: (id) => api.get(`/flights/${id}`),
  getAvailableSeats: (flightId) => api.get(`/flights/${flightId}/seats`)
};

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default api; 