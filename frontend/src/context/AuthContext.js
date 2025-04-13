import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const userJson = localStorage.getItem('user');
        
        if (token && userJson) {
          // В моковом режиме токены не истекают
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // В моковом режиме не нужно устанавливать заголовки для axios
  useEffect(() => {
    // Пустой эффект для совместимости
  }, [user]);

  // Установка пользователя из данных
  const setAuthUser = (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error setting auth user:', error);
      logout();
    }
  };

  // В моковом режиме обновление токена не требуется
  const refreshToken = async () => {
    return localStorage.getItem('access_token');
  };

  // Login с использованием мокового API
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.login({ email, password });
      
      // Данные пользователя и токены уже сохранены в localStorage в моковом API
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.detail || 'Тіркелу қатесі');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register с использованием мокового API
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.register(userData);
      
      // Данные пользователя и токены уже сохранены в localStorage в моковом API
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.detail || 'Тіркелу қатесі');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
