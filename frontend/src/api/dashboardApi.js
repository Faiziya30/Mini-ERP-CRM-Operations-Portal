import api from './axios';

export const getDashboardStatsApi = async () => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};
