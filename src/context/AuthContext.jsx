import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = [
  { role: 'STUDENT', label: 'Aarav Sharma (Student)', email: 'aarav.sharma@campus.edu', password: 'Password@123', badge: 'Student' },
  { role: 'STAFF', label: 'Elena Gilbert (Registrar Staff)', email: 'registrar.gilbert@campus.edu', password: 'Password@123', badge: 'Staff' },
  { role: 'ADMIN', label: 'Dr. Rajesh Chawla (System Admin)', email: 'admin.chawla@campus.edu', password: 'Password@123', badge: 'Admin' },
  { role: 'MANAGEMENT', label: 'Dean Arthur (Executive Dean)', email: 'management.dean@campus.edu', password: 'Password@123', badge: 'Management' },
  { role: 'REVOKED', label: 'Zoya Khan (Revoked Student)', email: 'zoya.khan@campus.edu', password: 'Password@123', badge: 'Revoked Test' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campus_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.get('/auth/me');
        setUser(data.user);
      } catch (err) {
        console.error('Session expired or revoked:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('campus_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, message: err.message };
    }
  };

  const quickLogin = async (demoEmail) => {
    return await login(demoEmail, 'Password@123');
  };

  const logout = () => {
    localStorage.removeItem('campus_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        setAuthError,
        login,
        quickLogin,
        logout,
        isAuthenticated: !!user,
        isStudent: user?.role === 'STUDENT',
        isStaff: user?.role === 'STAFF',
        isAdmin: user?.role === 'ADMIN',
        isManagement: user?.role === 'MANAGEMENT',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
