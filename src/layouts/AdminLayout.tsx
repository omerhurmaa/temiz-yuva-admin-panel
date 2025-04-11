import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Yuvam Admin Paneli</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/users">Kullanıcılar</Nav.Link>
              <Nav.Link as={Link} to="/services">Hizmetler</Nav.Link>
              <Nav.Link as={Link} to="/reservations">Rezervasyonlar</Nav.Link>
              <Nav.Link as={Link} to="/contact-forms">İletişim Formları</Nav.Link>
            </Nav>
            <Nav>
              <Navbar.Text className="me-3">
                {user?.fullName}
              </Navbar.Text>
              <Button variant="outline-light" onClick={handleLogout}>
                Çıkış Yap
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="flex-grow-1 py-4">
        <Outlet />
      </Container>

      <footer className="bg-dark text-white py-3">
        <Container>
          <p className="text-center mb-0">© 2024 Yuvam Admin Paneli</p>
        </Container>
      </footer>
    </div>
  );
};

export default AdminLayout; 