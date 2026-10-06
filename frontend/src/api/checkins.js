import { axiosInstance } from './axiosInstance';

export async function createCheckIn(habitId, date) {
  const { data } = await axiosInstance.post(`/habits/${habitId}/checkins`, { date });
  return data;
}

export async function fetchCheckIns(habitId, params) {
  const { data } = await axiosInstance.get(`/habits/${habitId}/checkins`, { params });
  return data;
}

export async function deleteCheckIn(habitId, checkInId) {
  await axiosInstance.delete(`/habits/${habitId}/checkins/${checkInId}`);
}