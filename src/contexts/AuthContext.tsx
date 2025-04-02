import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// API URL
const API_URL = 'https://temizyuva.com/api';

// Token'ı localStorage'da saklayacağımız anahtar
const TOKEN_KEY = 'yuvam_admin_token';

// Context tipleri
interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

// Default context değerleri
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  token: null,
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  error: null
};

// Context oluştur
const AuthContext = createContext<AuthContextType>(defaultContext);

// Context provider bileşeni
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Token değiştiğinde axios'un default header'larını ayarla
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Sayfa yüklendiğinde token varsa kullanıcı bilgilerini al
  useEffect(() => {
    const loadUserData = async () => {
      if (token) {
        try {
          // Burada kullanıcı bilgilerini almak için bir API çağrısı yapabilirsiniz
          // Şimdilik basitçe bir kullanıcı objesi oluşturuyoruz
          setUser({ role: 'Admin' });
        } catch (err) {
          console.error('Kullanıcı bilgileri alınamadı:', err);
          logout();
        }
      }
    };

    loadUserData();
  }, [token]);

  // Giriş işlemi
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/Auth/login`, { email, password });
      const { token: newToken, isAdmin, userId, firstName, lastName, email: userEmail } = response.data;
      
      if (!isAdmin) {
        setError('Bu panel sadece admin kullanıcılar içindir.');
        setIsLoading(false);
        return;
      }
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      
      // Kullanıcı bilgilerini set et
      setUser({
        id: userId,
        firstName,
        lastName,
        email: userEmail,
        role: 'Admin'
      });
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş yapılamadı');
      setIsLoading(false);
      throw err;
    }
  };

  // Çıkış işlemi
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  // Context değerleri
  const value: AuthContextType = {
    isAuthenticated: !!token,
    token,
    user,
    login,
    logout,
    isLoading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook olarak kullanım
export const useAuth = () => useContext(AuthContext); 