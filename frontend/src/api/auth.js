import { axiosInstance, TOKEN_KEY, USERNAME_KEY } from './axiosInstance';

export async function loginUser(email, password) {
  const { data } = await axiosInstance.post('/auth/login', { email, password });
  localStorage.setItem(TOKEN_KEY, data.token);

  const me = await axiosInstance.get('/auth/me');
  localStorage.setItem(USERNAME_KEY, me.data.email.split('@')[0]);
}

export async function registerUser(email, password) {
  await axiosInstance.post('/auth/register', { email, password });
  await loginUser(email, password);
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
}