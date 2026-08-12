import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://gestionfinanzasidgs.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, 
});

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("--- ERROR EN PETICIÓN AXIOS ---");
    if (error.response) {
      console.log("Estado:", error.response.status);
      console.log("Datos:", error.response.data);
    } else if (error.request) {
      console.log("Error de Red (No hubo respuesta del servidor):", error.request);
    } else {
      console.log("Error de Configuración:", error.message);
    }

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