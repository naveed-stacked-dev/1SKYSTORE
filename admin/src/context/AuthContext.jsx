import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '@/api/auth.service';
import { getStorage, setStorage, removeStorage } from '@/utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => getStorage('admin_user'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!admin;

  function extractAuth(responseData) {
    const data = responseData?.data || responseData;

    if (data?.tokens?.accessToken) {
      return {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        admin: data.user || data.admin,
      };
    }

    if (data?.accessToken) {
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        admin: data.user || data.admin || data,
      };
    }

    if (data?.token) {
      return {
        accessToken: data.token,
        refreshToken: data.refreshToken || null,
        admin: data.user || data.admin || data,
      };
    }

    return null;
  }

  // Check auth on mount
  useEffect(() => {
    const token = getStorage('adminAccessToken');
    if (token && !admin) {
      // Token exists but no admin data — try to recover from storage
      const storedAdmin = getStorage('admin_user');
      if (storedAdmin) {
        setAdmin(storedAdmin);
      }
    }
    setLoading(false);
  }, []);

  // Listen for forced logout
  useEffect(() => {
    const handleLogout = () => {
      setAdmin(null);
      removeStorage('admin_user');
      removeStorage('adminAccessToken');
      removeStorage('adminRefreshToken');
    };
    window.addEventListener('admin:logout', handleLogout);
    return () => window.removeEventListener('admin:logout', handleLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    const auth = extractAuth(res.data);

    if (!auth) throw new Error('Unexpected login response');

    setStorage('adminAccessToken', auth.accessToken);
    if (auth.refreshToken) setStorage('adminRefreshToken', auth.refreshToken);
    setAdmin(auth.admin);
    setStorage('admin_user', auth.admin);
    return auth.admin;
  }, []);

  const logout = useCallback(() => {
    removeStorage('adminAccessToken');
    removeStorage('adminRefreshToken');
    removeStorage('admin_user');
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
