import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import ServicesPage from './pages/services/ServicesPage';
import ServiceFormPage from './pages/services/ServiceFormPage';
import ReservationsPage from './pages/reservations/ReservationsPage';
import ReservationDetailPage from './pages/reservations/ReservationDetailPage';
import axios from 'axios';

// Axios default URL
axios.defaults.baseURL = 'https://temizyuva.com';

// Token'ı localStorage'dan alıp Axios header'larına ekle
const token = localStorage.getItem('auth_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Global Axios interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      // Token geçersiz, localStorage'dan temizle ve login sayfasına yönlendir
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Protected Route bileşeni
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Navbar bileşeni içeri aktarma hatası olduğundan, burada tanımlıyoruz
const NavbarComponent: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/dashboard">
          <i className="bi bi-house-heart-fill me-2"></i>
          Temiz Yuva Admin
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/users">
                <i className="bi bi-people me-1"></i> Kullanıcılar
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/services">
                <i className="bi bi-tools me-1"></i> Hizmetler
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reservations">
                <i className="bi bi-calendar-check me-1"></i> Rezervasyonlar
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            {user && (
              <span className="text-white me-3">
                <i className="bi bi-person-circle me-1"></i>
                {user.firstName} {user.lastName}
              </span>
            )}
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i> Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// CSS stillerini eklemek için kullanabiliriz
const addBootstrapIcons = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
  document.head.appendChild(link);
};

const App: React.FC = () => {
  // Bootstrap ikonlarını ekleyelim
  React.useEffect(() => {
    addBootstrapIcons();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="App d-flex flex-column min-vh-100">
          <NavbarComponent />
          <div className="container py-4 flex-grow-1">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services"
                element={
                  <ProtectedRoute>
                    <ServicesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services/new"
                element={
                  <ProtectedRoute>
                    <ServiceFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services/:id"
                element={
                  <ProtectedRoute>
                    <ServiceFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservations"
                element={
                  <ProtectedRoute>
                    <ReservationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservations/:id"
                element={
                  <ProtectedRoute>
                    <ReservationDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
          <footer className="bg-light py-3 mt-auto border-top">
            <div className="container text-center text-muted">
              <small>Temiz Yuva Admin Panel &copy; {new Date().getFullYear()}</small>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
