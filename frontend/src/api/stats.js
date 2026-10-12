import { axiosInstance } from './axiosInstance';

export async function fetchStats() {
  const { data } = await axiosInstance.get('/stats');
  return data;
}

export async function fetchDailyProgress(days = 7, to) {
  const { data } = await axiosInstance.get('/stats/daily', { params: { days, to } });
  return data;
}