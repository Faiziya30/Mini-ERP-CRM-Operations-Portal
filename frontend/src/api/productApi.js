import api from './axios';

export const listProductsApi = async (params) => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const getProductApi = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const createProductApi = async (payload) => {
  const { data } = await api.post('/products', payload);
  return data;
};

export const updateProductApi = async (id, payload) => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
};

export const getProductStockLogApi = async (id, params) => {
  const { data } = await api.get(`/products/${id}/stock-log`, { params });
  return data;
};

export const adjustProductStockApi = async (id, payload) => {
  const { data } = await api.post(`/products/${id}/stock`, payload);
  return data;
};
