import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY || 'secret-admin-key';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const simulateEvents = async (count = 300) => {
  const response = await api.post('/simulate', { count });
  return response.data;
};

export const getSummary = async () => {
  const response = await api.get('/summary');
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await api.get('/audit', { params });
  return response.data;
};

export const getPolicies = async () => {
  const response = await api.get('/policy');
  return response.data;
};

export const updatePolicyRule = async (reasonCode, data) => {
  const response = await api.put(`/policy/${reasonCode}`, data, {
    headers: {
      'x-api-key': ADMIN_KEY
    }
  });
  return response.data;
};

export const updateGlobalConstraints = async (data) => {
  const response = await api.put('/policy/global', data, {
    headers: {
      'x-api-key': ADMIN_KEY
    }
  });
  return response.data;
};

export const explainDecision = async (auditLogId) => {
  const response = await api.post(`/explain/${auditLogId}`);
  return response.data;
};

<<<<<<< HEAD
=======
export const triggerSimulatedWebhook = async (payload) => {
  const response = await api.post('/webhooks/test-simulate', payload);
  return response.data;
};

export const processDeferredQueue = async () => {
  const response = await api.post('/cron/process-deferred');
  return response.data;
};

>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)
export default api;
