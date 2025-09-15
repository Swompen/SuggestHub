import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:3001';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [devMode, setDevMode] = useState(false);

  const isAuthenticated = !!user;

  const canVote = () => {
    return user?.canVote || false;
  };

  const isAdmin = () => {
    return user?.isAdmin || false;
  };

  // Check if we're in development mode
  useEffect(() => {
    const checkDevMode = async () => {
      try {
        // Check if backend is in dev mode by looking at health response
        const response = await axios.get(`${API_BASE_URL}/api/health`);
        // For now, assume dev mode if running on localhost
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        setDevMode(isDev);
        console.log('Dev mode detected:', isDev);
      } catch (error) {
        console.error('Error checking dev mode:', error);
        // Fallback to localhost check
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        setDevMode(isDev);
        console.log('Dev mode fallback:', isDev);
      }
    };
    checkDevMode();
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/user`, {
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    console.log('Login function called, devMode:', devMode);
    try {
      if (devMode) {
        console.log('Making dev mode login request...');
        // In dev mode, make a direct API call to login
        const response = await axios.get(`${API_BASE_URL}/auth/discord`, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        console.log('Dev login response:', response.data);

        if (response.data.success) {
          // Login successful, update user state
          setUser(response.data.user);
          setLoading(false);
          console.log('User logged in:', response.data.user);
        } else {
          console.error('Dev login failed:', response.data);
        }
      } else {
        console.log('Redirecting to production Discord OAuth...');
        // Production Discord OAuth
        window.location.href = `${API_BASE_URL}/auth/discord`;
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${API_BASE_URL}/auth/logout`, {
        withCredentials: true
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus,
    isAuthenticated,
    canVote,
    isAdmin,
    devMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
