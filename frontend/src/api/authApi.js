import api from './axios';

export const loginApi = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data;
};

export const meApi = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const registerApi = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const listUsersApi = async () => {
  const { data } = await api.get('/auth/users');
  return data;
};
