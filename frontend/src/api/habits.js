import { axiosInstance } from './axiosInstance';

export async function fetchHabits() {
  const { data } = await axiosInstance.get('/habits', { params: { limit: 50 } });
  return data.items;
}

export async function fetchHabit(id) {
  const { data } = await axiosInstance.get(`/habits/${id}`);
  return data;
}

export async function createHabit(habit) {
  const { data } = await axiosInstance.post('/habits', habit);
  return data;
}

export async function updateHabit(id, habit) {
  const { data } = await axiosInstance.patch(`/habits/${id}`, habit);
  return data;
}

export async function deleteHabit(id) {
  await axiosInstance.delete(`/habits/${id}`);
}