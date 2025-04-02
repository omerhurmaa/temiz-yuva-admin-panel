import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// API URL
const API_URL = 'https://temizyuva.com/api';

interface Service {
  id: number;
  title: string;
  imageUrl: string;
  shortDescription: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  prepaymentDiscountPercentage: number;
  minPrepaymentPercentage: number;
  isActive?: boolean;
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/Services`);
      setServices(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Hizmetler alınamadı:', err);
      setError('Hizmetler yüklenirken bir hata oluştu.');
      setLoading(false);
      
      // Hata durumunda örnek verilerle gösterelim
      setServices([
        {
          id: 1,
          title: 'Ev Temizliği',
          imageUrl: 'https://example.com/images/temizlik.jpg',
          shortDescription: 'Profesyonel ev temizlik hizmeti',
          basePrice: 1500,
          minPrice: 1200,
          maxPrice: 3000,
          prepaymentDiscountPercentage: 10,
          minPrepaymentPercentage: 30,
          isActive: true
        }
      ]);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSelectedServiceId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedServiceId(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedServiceId) {
      try {
        await axios.delete(`${API_URL}/Services/${selectedServiceId}`);
        setServices(services.filter(service => service.id !== selectedServiceId));
        handleCloseDeleteModal();
      } catch (err) {
        console.error('Hizmet silinemedi:', err);
        alert('Hizmet silinirken bir hata oluştu.');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Hizmetler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Hizmet Yönetimi</h1>
        <div>
          <Button 
            variant="primary" 
            className="me-2" 
            onClick={() => navigate('/services/new')}
          >
            Yeni Hizmet Ekle
          </Button>
          <Button variant="secondary" onClick={fetchServices}>Yenile</Button>
        </div>
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
                <th>Başlık</th>
                <th>Kısa Açıklama</th>
                <th>Fiyat (₺)</th>
                <th>Ön Ödeme İndirimi</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>{service.id}</td>
                  <td>{service.title}</td>
                  <td>{service.shortDescription}</td>
                  <td>{service.basePrice.toLocaleString('tr-TR')}</td>
                  <td>%{service.prepaymentDiscountPercentage}</td>
                  <td>
                    {service.isActive ? (
                      <Badge bg="success">Aktif</Badge>
                    ) : (
                      <Badge bg="secondary">Pasif</Badge>
                    )}
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => navigate(`/services/edit/${service.id}`)}
                    >
                      Düzenle
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteClick(service.id)}
                    >
                      Sil
                    </Button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center">
                    Kayıtlı hizmet bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Silme Onay Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Hizmet Silme Onayı</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bu hizmeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
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