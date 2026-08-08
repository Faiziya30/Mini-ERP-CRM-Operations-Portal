import api from './axios';

export const listCustomersApi = async (params) => {
  const { data } = await api.get('/customers', { params });
  return data;
};

export const getCustomerApi = async (id) => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
};

export const createCustomerApi = async (payload) => {
  const { data } = await api.post('/customers', payload);
  return data;
};

export const updateCustomerApi = async (id, payload) => {
  const { data } = await api.put(`/customers/${id}`, payload);
  return data;
};

export const deleteCustomerApi = async (id) => {
  const { data } = await api.delete(`/customers/${id}`);
  return data;
};

export const addCustomerFollowUpApi = async (id, payload) => {
  const { data } = await api.post(`/customers/${id}/followups`, payload);
  return data;
};
