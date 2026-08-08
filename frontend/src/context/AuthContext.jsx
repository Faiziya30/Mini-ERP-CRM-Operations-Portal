import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginApi, meApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('erp_token');
    setUser(null);
  };

  const login = async (payload) => {
    const response = await loginApi(payload);
    localStorage.setItem('erp_token', response.data.token);
    setUser(response.data.user);
    return response;
  };

  useEffect(() => {
    const hydrate = async () => {
      const token = localStorage.getItem('erp_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await meApi();
        setUser(response.data);
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    hydrate();

    const unauthorizedHandler = () => logout();
    window.addEventListener('auth:unauthorized', unauthorizedHandler);
    return () => window.removeEventListener('auth:unauthorized', unauthorizedHandler);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used inside AuthProvider');
  }
  return context;
};
