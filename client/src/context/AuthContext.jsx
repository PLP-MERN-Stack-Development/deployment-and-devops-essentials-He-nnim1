import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const storedUser = authService.getCurrentUser();
  const [user, setUser] = useState(storedUser);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      if (!token) {
        setUser(null);
        setInitializing(false);
        return;
      }

      setInitializing(true);
      try {
        const response = await authService.fetchCurrentUser();
        const currentUser = response.user || response.data?.user || null;
        setUser(currentUser);
        setError(null);
      } catch (err) {
        console.error(err);
        authService.logout();
        setUser(null);
        setToken(null);
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, [token]);

  const handleAuthResponse = (response) => {
    if (!response) {
      throw new Error('No response from auth service');
    }

    // Handle different response structures
    const receivedToken = response.token || response.data?.token;
    const receivedUser = response.user || response.data?.user;

    if (receivedToken) {
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
    }
    if (receivedUser) {
      localStorage.setItem('user', JSON.stringify(receivedUser));
      setUser(receivedUser);
    }
    setError(null);
    return response;
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      return handleAuthResponse(response);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to login with the provided credentials';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(payload);
      return handleAuthResponse(response);
    } catch (err) {
      let message = 'Unable to register. Please check your connection and try again.';
      
      if (err.isNetworkError) {
        message = err.message;
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setError(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      initializing,
      error,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, token, loading, initializing, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

