import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// API URL
const API_URL = 'https://temizyuva.com';

interface Service {
  id: number;
  title: string;
  imageUrl: string;
  shortDescription: string;
  description?: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  prepaymentDiscountPercentage: number;
  minPrepaymentPercentage: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  features?: any[];
  reservations?: any[];
}

interface ApiResponse {
  isSuccess: boolean;
  services: Service[];
}

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  const fetchServices = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get<ApiResponse>(`${API_URL}/api/Services`);
      if (response.data.isSuccess) {
        setServices(response.data.services);
      } else {
        setError('Hizmetler yüklenirken bir hata oluştu');
      }
    } catch (err: any) {
      console.error('Hizmetler yüklenirken hata:', err);
      setError(`Hizmetler yüklenirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [isAuthenticated]);

  const handleDeleteClick = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedServiceId) return;

    try {
      const response = await axios.delete(`${API_URL}/api/Services/${selectedServiceId}`);
      if (response.data.success) {
        setServices(services.filter(service => service.id !== selectedServiceId));
        setShowDeleteModal(false);
        setSelectedServiceId(null);
      } else {
        setError('Hizmet silinirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Hizmet silinirken hata:', err);
      setError('Hizmet silinirken bir hata oluştu');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const service = services.find(s => s.id === id);
      if (!service) return;

      const response = await axios.put(`${API_URL}/api/Services/${id}`, {
        ...service,
        isActive: !service.isActive
      });

      if (response.data.success) {
        setServices(services.map(service => 
          service.id === id ? { ...service, isActive: !service.isActive } : service
        ));
      } else {
        setError('Hizmet durumu güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Hizmet durumu güncellenirken hata:', err);
      setError('Hizmet durumu güncellenirken bir hata oluştu');
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
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
          <button className="btn btn-primary" onClick={fetchServices}>
            Tekrar Dene
          </button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="services-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Hizmet Yönetimi</h2>
        <Button variant="primary" onClick={() => navigate('/services/new')}>
          Yeni Hizmet Ekle
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Başlık</th>
            <th>Kısa Açıklama</th>
            <th>Fiyat</th>
            <th>Peşinat İndirimi</th>
            <th>Durum</th>
            <th>Oluşturulma Tarihi</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td>{service.id}</td>
              <td>{service.title}</td>
              <td>{service.shortDescription}</td>
              <td>
                <div>Normal: {formatPrice(service.basePrice)}</div>
                <div>Min: {formatPrice(service.minPrice)}</div>
                <div>Max: {formatPrice(service.maxPrice)}</div>
              </td>
              <td>
                <div>İndirim: %{service.prepaymentDiscountPercentage}</div>
                <div>Min Peşinat: %{service.minPrepaymentPercentage}</div>
              </td>
              <td>
                <Badge bg={service.isActive ? 'success' : 'danger'}>
                  {service.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              </td>
              <td>{service.createdAt ? formatDate(service.createdAt) : '-'}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => navigate(`/services/${service.id}`)}
                  >
                    Düzenle
                  </Button>
                  <Button
                    variant={service.isActive ? 'danger' : 'success'}
                    size="sm"
                    onClick={() => handleToggleStatus(service.id)}
                  >
                    {service.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(service.id)}
                  >
                    Sil
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Hizmet Silme</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bu hizmeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

export default ServicesPage; 