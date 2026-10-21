import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.error('[AuthContext] Failed to load session:', err.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to log in. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Register handler
  const register = async (formData) => {
    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        toast.success(`Account created successfully! Welcome, ${userData.name}.`);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.info('You have logged out.');
  };

  // Update profile
  const updateProfile = async (updates) => {
    try {
      const response = await api.put('/auth/profile', updates);
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Profile updated successfully!');
        return { success: true, user: response.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Upload and parse resume
  const uploadAndParseResume = async (fileOrFormData) => {
    try {
      let data = fileOrFormData;
      if (fileOrFormData instanceof File) {
        const form = new FormData();
        form.append('resume', fileOrFormData);
        data = form;
      }
      const response = await api.post('/ai/analyze-resume', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        // Refresh profile to reflect newly extracted skills
        const meRes = await api.get('/auth/me');
        if (meRes.data.success) {
          setUser(meRes.data.user);
        }
        toast.success(`Resume analyzed! Extracted ${response.data.extractedSkillsCount} skills.`);
        return { success: true, analysis: response.data.analysis };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to analyze resume.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        uploadAndParseResume,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
