import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// API URL
const API_URL = 'https://temizyuva.com/api';

// Token'ı localStorage'da saklayacağımız anahtar
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Context tipleri
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

// Default context değerleri
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  error: null
};

// Context oluştur
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider bileşeni
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Başlangıçta yükleniyor olarak ayarlayalım
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Axios interceptor'ı ekle
  useEffect(() => {
    // Global axios default ayarları
    axios.defaults.baseURL = 'https://temizyuva.com';
    
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          console.log('401 Unauthorized error, logging out...');
          logout();
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // Token varsa kullanıcı bilgilerini yükle
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);
        
        if (token) {
          // Token'ı header'a ekle
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          if (savedUser) {
            // Eğer localStorage'da kullanıcı bilgisi varsa, onu kullan
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
              setIsAuthenticated(true);
            } catch (e) {
              console.error('Kullanıcı bilgisi ayrıştırılamadı:', e);
              // Eğer kullanıcı bilgisi ayrıştırılamazsa, API'den yeniden al
              await loadUserData();
            }
          } else {
            // Kullanıcı bilgisi yoksa API'den al
            await loadUserData();
          }
        }
      } catch (error) {
        console.error('Oturum kontrolü sırasında hata:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      
      if (response.data) {
        const userData = response.data;
        const userObject = {
          id: userData.userId || userData.id,
          email: userData.email,
          firstName: userData.firstName || userData.name,
          lastName: userData.lastName,
          isAdmin: userData.isAdmin || userData.role === 'Admin'
        };
        
        // Kullanıcı bilgilerini hem state'e hem de localStorage'a kaydet
        setUser(userObject);
        localStorage.setItem(USER_KEY, JSON.stringify(userObject));
        setIsAuthenticated(true);
      } else {
        // Kullanıcı bilgileri alınamadı, çıkış yap
        throw new Error('Kullanıcı bilgileri alınamadı');
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenemedi:', error);
      logout();
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      // Response içeriğini konsola yazdıralım
      console.log('Login response:', response.data);

      if (response.data.isSuccess) {
        const { token, userId, email, firstName, lastName, isAdmin } = response.data;
        
        const userObject = {
          id: userId,
          email,
          firstName,
          lastName,
          isAdmin
        };
        
        // Token'ı saklayalım
        localStorage.setItem(TOKEN_KEY, token);
        
        // Kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem(USER_KEY, JSON.stringify(userObject));
        
        // Header'a ekleyelim
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // State'i güncelleyelim
        setIsAuthenticated(true);
        setUser(userObject);
        
        // Yönlendirme yapalım
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Giriş yapılamadı');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Giriş yapılamadı');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook olarak kullanım
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 