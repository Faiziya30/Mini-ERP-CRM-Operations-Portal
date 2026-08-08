import api from './axios';

export const createChallanApi = async (payload) => {
  const { data } = await api.post('/challans', payload);
  return data;
};

export const updateChallanApi = async (id, payload) => {
  const { data } = await api.put(`/challans/${id}`, payload);
  return data;
};

export const confirmChallanApi = async (id) => {
  const { data } = await api.post(`/challans/${id}/confirm`);
  return data;
};

export const cancelChallanApi = async (id) => {
  const { data } = await api.post(`/challans/${id}/cancel`);
  return data;
};

export const listChallansApi = async (params) => {
  const { data } = await api.get('/challans', { params });
  return data;
};

export const getChallanApi = async (id) => {
  const { data } = await api.get(`/challans/${id}`);
  return data;
};
