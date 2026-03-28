import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

export const apiService = {
  // Businesses
  getBusinesses: () => api.get('/businesses'),
  getBusinessByName: (name) => api.get(`/businesses?name=${name}`),

  // Items
  getItems: (businessId) => api.get(`/items/${businessId}`),

  // Bills
  createBill: (billData) => api.post('/bills', billData),
  getBills: (businessId) => api.get(`/bills/${businessId}`),
};

export default api;
