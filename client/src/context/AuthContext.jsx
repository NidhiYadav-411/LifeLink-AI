import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('lifelink_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authService.getCurrentUser();
        if (data && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.warn('Failed to restore user session:', err);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    if (data && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUserProfile = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
