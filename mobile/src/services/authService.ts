import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.success) {
      const { token, user } = response.data.data;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      return { token, user };
    }
    throw new Error(response.data?.message || 'Login failed');
  },

  async register(name: string, email: string, password: string) {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data?.success) {
      const { token, user } = response.data.data;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      return { token, user };
    }
    throw new Error(response.data?.message || 'Registration failed');
  },

  async logout() {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  },

  async getCurrentUser() {
    const token = await AsyncStorage.getItem('userToken');
    const userData = await AsyncStorage.getItem('userData');
    if (token && userData) {
      return JSON.parse(userData);
    }
    return null;
  }
};
