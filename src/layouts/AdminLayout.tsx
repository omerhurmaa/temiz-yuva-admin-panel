import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={NavLink} to="/">Temiz Yuva Admin Paneli</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/">Dashboard</Nav.Link>
              <Nav.Link as={NavLink} to="/users">Kullanıcılar</Nav.Link>
              <Nav.Link as={NavLink} to="/services">Hizmetler</Nav.Link>
              <Nav.Link as={NavLink} to="/reservations">Rezervasyonlar</Nav.Link>
            </Nav>
            <Nav>
              {user && (
                <Navbar.Text className="me-3">
                  Kullanıcı: {user.role}
                </Navbar.Text>
              )}
              <Button variant="outline-light" onClick={handleLogout}>Çıkış</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4 mb-5">
        <Outlet />
      </Container>

      <footer className="bg-light py-3 mt-auto">
        <Container className="text-center">
          <p className="mb-0">© 2024 Temiz Yuva Hizmetleri - Admin Paneli</p>
        </Container>
      </footer>
    </div>
  );
};

export default AdminLayout; 