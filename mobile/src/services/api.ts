import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace this with your actual local IP address or production URL
export const API_BASE_URL = 'http://10.192.204.147:5008/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  async (config: any) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

export default api;
