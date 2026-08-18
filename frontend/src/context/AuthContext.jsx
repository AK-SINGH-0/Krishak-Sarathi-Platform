import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, restore session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('ks_user');
    const token = localStorage.getItem('ks_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // userData includes token + profile fields, returned by /api/auth/login or /register
    const { token, ...profile } = userData;
    localStorage.setItem('ks_token', token);
    localStorage.setItem('ks_user', JSON.stringify(profile));
    setUser(profile);
  };

  const updateUser = (profile) => {
    localStorage.setItem('ks_user', JSON.stringify(profile));
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem('ks_token');
    localStorage.removeItem('ks_user');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      updateUser(data);
    } catch (err) {
      // token invalid/expired - log the user out silently
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, logout, updateUser, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
