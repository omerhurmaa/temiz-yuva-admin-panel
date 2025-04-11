import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  isEmailConfirmed: boolean;
  isAdmin: boolean;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/Admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // API yanıt yapısını kontrol et ve veriyi düzgün şekilde al
      console.log('API yanıtı:', response.data);
      
      if (response.data && response.data.isSuccess && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error('Beklenmeyen API yanıt formatı:', response.data);
        setError('Kullanıcı verileri beklenmeyen formatta.');
        setUsers([]);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata oluştu:', error);
      setError('Kullanıcılar yüklenirken bir hata oluştu.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  // Rol rengini belirle
  const getRoleBadgeVariant = (role: boolean) => {
    return role ? 'danger' : 'primary';
  };

  // Durum rengini belirle
  const getStatusBadgeVariant = (isEmailConfirmed: boolean) => {
    return isEmailConfirmed ? 'success' : 'warning';
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Kullanıcılar yükleniyor...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Kullanıcılar</h1>
        <Button variant="primary" onClick={fetchUsers}>Yenile</Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Rol</th>
                <th>E-posta Durumu</th>
                <th>Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || '-'}</td>
                  <td>
                    <Badge bg={getRoleBadgeVariant(user.isAdmin)}>
                      {user.isAdmin ? 'Admin' : 'Kullanıcı'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getStatusBadgeVariant(user.isEmailConfirmed)}>
                      {user.isEmailConfirmed ? 'Onaylı' : 'Onay Bekliyor'}
                    </Badge>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center">
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UsersPage; 