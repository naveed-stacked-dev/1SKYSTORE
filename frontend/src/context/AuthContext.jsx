import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '@/api/auth.service';
import { getStorage, setStorage, removeStorage } from '@/utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStorage('user'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Extract tokens from various possible backend response shapes
  function extractAuth(responseData) {
    const data = responseData?.data || responseData;

    // Shape 1: { user, tokens: { accessToken, refreshToken } }
    if (data?.tokens?.accessToken) {
      return {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        user: data.user,
      };
    }

    // Shape 2: { user, accessToken, refreshToken }
    if (data?.accessToken) {
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user || data,
      };
    }

    // Shape 3: { token, user } (legacy)
    if (data?.token) {
      return {
        accessToken: data.token,
        refreshToken: data.refreshToken || null,
        user: data.user || data,
      };
    }

    return null;
  }

  // Check auth on mount
  useEffect(() => {
    const token = getStorage('accessToken');
    if (token && !user) {
      loadUser()
        .catch(() => {
          removeStorage('accessToken');
          removeStorage('refreshToken');
          removeStorage('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for forced logout (from axios interceptor)
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      removeStorage('user');
      removeStorage('accessToken');
      removeStorage('refreshToken');
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const loadUser = useCallback(async () => {
    const res = await authService.getProfile();
    const userData = res.data?.data || res.data?.user || res.data;
    setUser(userData);
    setStorage('user', userData);
    return userData;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    const auth = extractAuth(res.data);

    if (!auth) throw new Error('Unexpected login response');

    setStorage('accessToken', auth.accessToken);
    if (auth.refreshToken) setStorage('refreshToken', auth.refreshToken);
    setUser(auth.user);
    setStorage('user', auth.user);
    return auth.user;
  }, []);

  const register = useCallback(async (formData) => {
    const res = await authService.register(formData);
    const auth = extractAuth(res.data);

    if (auth?.accessToken) {
      setStorage('accessToken', auth.accessToken);
      if (auth.refreshToken) setStorage('refreshToken', auth.refreshToken);
      setUser(auth.user);
      setStorage('user', auth.user);
    }

    return auth?.user || res.data?.data || res.data;
  }, []);

  const googleLogin = useCallback(async (idToken) => {
    const res = await authService.googleLogin(idToken);
    const auth = extractAuth(res.data);

    if (!auth) throw new Error('Unexpected Google login response');

    setStorage('accessToken', auth.accessToken);
    if (auth.refreshToken) setStorage('refreshToken', auth.refreshToken);
    setUser(auth.user);
    setStorage('user', auth.user);
    return auth.user;
  }, []);

  const logout = useCallback(() => {
    removeStorage('accessToken');
    removeStorage('refreshToken');
    removeStorage('user');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await authService.updateProfile(data);
    const userData = res.data?.data || res.data?.user || res.data;
    setUser(userData);
    setStorage('user', userData);
    return userData;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        googleLogin,
        logout,
        loadUser,
        updateProfile,
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
