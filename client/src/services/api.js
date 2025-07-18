import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Tenant API
export const tenantAPI = {
  getAll: (params = {}) => api.get('/tenants', { params }),
  getById: (id) => api.get(`/tenants/${id}`),
  create: (data) => api.post('/tenants', data),
  update: (id, data) => api.put(`/tenants/${id}`, data),
  delete: (id) => api.delete(`/tenants/${id}`),
  toggleStatus: (id) => api.patch(`/tenants/${id}/toggle-status`),
};

// Rent API
export const rentAPI = {
  getAll: (params = {}) => api.get('/rent', { params }),
  getById: (id) => api.get(`/rent/${id}`),
  create: (data) => api.post('/rent', data),
  update: (id, data) => api.put(`/rent/${id}`, data),
  delete: (id) => api.delete(`/rent/${id}`),
  markAsPaid: (id, data = {}) => api.patch(`/rent/${id}/mark-paid`, data),
  generateMonthly: (month) => api.post('/rent/generate-monthly', { month }),
  getSummary: (month) => api.get(`/rent/summary/${month}`),
  getOverdue: () => api.get('/rent/overdue/list'),
};

// WhatsApp API
export const whatsappAPI = {
  getStatus: () => api.get('/whatsapp/status'),
  getQR: () => api.get('/whatsapp/qr'),
  sendReminder: (rentId) => api.post(`/whatsapp/send-reminder/${rentId}`),
  sendBulkReminders: (month) => api.post('/whatsapp/send-bulk-reminders', { month }),
  sendPaymentConfirmation: (rentId) => api.post(`/whatsapp/send-payment-confirmation/${rentId}`),
  sendCustomMessage: (tenantId, message) => api.post('/whatsapp/send-custom-message', { tenantId, message }),
  getHistory: (tenantId) => api.get(`/whatsapp/history/${tenantId}`),
  logout: () => api.post('/whatsapp/logout'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 