import React, { createContext, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface AuthContextProps {
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

// Helpers para almacenamiento
const setStorageItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const removeStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicia explícitamente en null para forzar el Login cada vez que arranca la app
  const [token, setToken] = useState<string | null>(null);
  const [isLoading] = useState(false);

  const login = async (newToken: string) => {
    await setStorageItem('userToken', newToken);
    setToken(newToken);
  };

  const logout = async () => {
    await removeStorageItem('userToken');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};