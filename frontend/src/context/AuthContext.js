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
          // Мок режимінде токендер мерзімі аяқталмайды
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

  // Мок режимінде axios үшін тақырыптарды орнату қажет емес
  useEffect(() => {
    // Үйлесімділік үшін бос эффект
  }, [user]);

  // Деректерден пайдаланушыны орнату
  const setAuthUser = (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error setting auth user:', error);
      logout();
    }
  };

  // Мок режимінде токенді жаңарту қажет емес
  const refreshToken = async () => {
    return localStorage.getItem('access_token');
  };

  // Мок API пайдаланып жүйеге кіру
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.login({ email, password });
      
      // Пайдаланушы деректері мен токендер мок API-де localStorage-те сақталған
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

  // Мок API пайдаланып тіркелу
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.register(userData);
      
      // Пайдаланушы деректері мен токендер мок API-де localStorage-те сақталған
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

  // Жүйеден шығу
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
