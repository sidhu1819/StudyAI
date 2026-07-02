import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Perform a one-time clean-up reset for V3 to clear stale cache
    const isReset = localStorage.getItem('studyai_reset_v3');
    if (!isReset) {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('studyai_reset_v3', 'true');
      setUser(null);
      setLoading(false);
      return;
    }

    const storedUser = localStorage.getItem('studyai_user_v3');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      setUser(response.data.user);
      localStorage.setItem('studyai_user_v3', JSON.stringify(response.data.user));
      localStorage.setItem('studyai_token_v3', response.data.token);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      setUser(response.data.user);
      localStorage.setItem('studyai_user_v3', JSON.stringify(response.data.user));
      localStorage.setItem('studyai_token_v3', response.data.token);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('studyai_user_v3');
    localStorage.removeItem('studyai_token_v3');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
