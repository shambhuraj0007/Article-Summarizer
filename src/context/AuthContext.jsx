import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('loggedInUser');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await apiService.auth.login(credentials);
      const { jwtToken, name, email } = response.data;

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('loggedInUser', JSON.stringify({ name, email }));

      setUser({ name, email });
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${name}!`);
      navigate('/home');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await apiService.auth.signup(userData);
      const { token, name, email } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('loggedInUser', JSON.stringify({ name, email }));

      setUser({ name, email });
      setIsAuthenticated(true);
      
      toast.success(`Account created successfully! Welcome, ${name}!`);
      navigate('/home');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    apiService.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
