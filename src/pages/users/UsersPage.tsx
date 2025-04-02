import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// API URL
const API_URL = 'https://temizyuva.com';

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
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const fetchUsers = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/Admin/users`);
      
      if (response.data.isSuccess) {
        setUsers(response.data.users);
      } else {
        throw new Error('API başarısız yanıt döndü');
      }
    } catch (err: any) {
      console.error('Kullanıcılar yüklenirken hata:', err);
      setError(`Kullanıcılar yüklenirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAuthenticated]);

  const handleDeleteClick = (userId: number) => {
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId) return;

    try {
      await axios.delete(`${API_URL}/api/Admin/users/${selectedUserId}`);
      setUsers(users.filter(user => user.id !== selectedUserId));
      setShowDeleteModal(false);
      setSelectedUserId(null);
    } catch (err) {
      console.error('Kullanıcı silinirken hata:', err);
      setError('Kullanıcı silinirken bir hata oluştu');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return <Alert variant="warning">Lütfen giriş yapın.</Alert>;
  }

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
        <div className="mt-2">
          <button className="btn btn-primary" onClick={fetchUsers}>
            Tekrar Dene
          </button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="users-page">
      <h2 className="mb-4">Kullanıcı Yönetimi</h2>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ad Soyad</th>
            <th>E-posta</th>
            <th>Telefon</th>
            <th>Kayıt Tarihi</th>
            <th>E-posta Onayı</th>
            <th>Admin</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{`${user.firstName} ${user.lastName}`}</td>
              <td>{user.email}</td>
              <td>{user.phoneNumber}</td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                <span className={`badge ${user.isEmailConfirmed ? 'bg-success' : 'bg-warning'}`}>
                  {user.isEmailConfirmed ? 'Onaylı' : 'Onaysız'}
                </span>
              </td>
              <td>
                <span className={`badge ${user.isAdmin ? 'bg-danger' : 'bg-secondary'}`}>
                  {user.isAdmin ? 'Admin' : 'Kullanıcı'}
                </span>
              </td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(user.id)}
                  disabled={user.isAdmin}
                >
                  Sil
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Kullanıcı Silme</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            İptal
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsersPage; 