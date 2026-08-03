import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// ⚠️ Reemplaza esta IP por la IP local de tu computadora en tu red Wi-Fi
// (Abre la terminal en tu compu y pon "ipconfig" en Windows o "ifconfig" en Mac/Linux)
const IP_COMPUTADORA = '192.168.137.12'; // <- PON TU IP AQUÍ

// Si es emulador Android usas 10.0.2.2, si es web localhost, si es cel físico tu IP local:
const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000' 
  : `http://${IP_COMPUTADORA}:3000`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  let token: string | null = null;
  if (Platform.OS === 'web') {
    token = localStorage.getItem('userToken');
  } else {
    token = await SecureStore.getItemAsync('userToken');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;