import { axiosInstance } from './axiosInstance';

export async function fetchStats() {
  const { data } = await axiosInstance.get('/stats');
  return data;
}