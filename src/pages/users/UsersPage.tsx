import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

// API URL
const API_URL = 'https://temizyuva.com/api';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isEmailConfirmed: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt: string | null;
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
      const response = await axios.get(`${API_URL}/Admin/users`);
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Kullanıcılar alınamadı:', err);
      setError('Kullanıcılar yüklenirken bir hata oluştu.');
      setLoading(false);
      
      // Hata durumunda örnek verilerle gösterelim
      setUsers([
        {
          id: 1,
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phoneNumber: '+905555555555',
          isEmailConfirmed: false,
          isAdmin: false,
          createdAt: '2025-03-31T18:54:39.68733Z',
          lastLoginAt: null
        },
        {
          id: 2,
          firstName: 'admin',
          lastName: 'User',
          email: 'omerhurma02@gmail.com',
          phoneNumber: '+905555555555',
          isEmailConfirmed: true,
          isAdmin: true,
          createdAt: '2025-04-01T19:48:23.763253Z',
          lastLoginAt: '2025-04-01T23:35:11.259377Z'
        }
      ]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Kullanıcılar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Kullanıcı Yönetimi</h1>
        <Button variant="primary" onClick={fetchUsers}>Yenile</Button>
      </div>

      {error && (
        <Alert variant="danger">
          {error}
          <p className="mb-0 mt-2">Demo veriler gösteriliyor.</p>
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ad</th>
                <th>Soyad</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>E-posta Onayı</th>
                <th>Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>
                    {user.isEmailConfirmed ? (
                      <Badge bg="success">Onaylı</Badge>
                    ) : (
                      <Badge bg="warning">Onay Bekliyor</Badge>
                    )}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center">
                    Kayıtlı kullanıcı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UsersPage; 