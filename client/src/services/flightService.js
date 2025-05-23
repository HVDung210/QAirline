import api from './api';

export const searchFlights = async (params) => {
  const response = await api.get('/flights/search', { params });
  return response.data;
};

export const getFlightDetails = async (id) => {
  const response = await api.get(`/flights/${id}`);
  return response.data;
};

export const getAvailableSeats = async (flightId, flightClass) => {
  const response = await api.get(`/flights/${flightId}/seats`, {
    params: { class: flightClass }
  });
  return response.data;
}; 