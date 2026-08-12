import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de Solicitudes: Inyecta el JWT en la cabecera Bearer
api.interceptors.request.use(
  async (config) => {
    let token: string | null = null;
    try {
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
      } else {
        token = await SecureStore.getItemAsync('userToken');
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuestas: Manejo automático de tokens expirados (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        if (Platform.OS === 'web') {
          localStorage.removeItem('userToken');
        } else {
          await SecureStore.deleteItemAsync('userToken');
        }
      } catch (cleanError) {
      }
    }
    return Promise.reject(error);
  }
);

export default api;