import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface Service {
  id: number;
  title: string;
  imageUrl: string;
  shortDescription: string;
  price: number;
  prepaymentDiscountPercentage: number;
  minPrepaymentPercentage: number;
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/Services`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.isSuccess) {
        setServices(response.data.services || []);
      } else {
        setError('Hizmetler yüklenirken bir hata oluştu.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Hizmetler yüklenirken hata oluştu:', error);
      setError('Hizmetler yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleAddService = () => {
    navigate('/services/new');
  };

  const handleEditService = (id: number) => {
    navigate(`/services/edit/${id}`);
  };

  const handleDeleteService = async (id: number) => {
    if (window.confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        
        await axios.delete(`${API_BASE_URL}/Services/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Hizmet başarıyla silindiğinde listeyi güncelle
        fetchServices();
      } catch (error) {
        console.error('Hizmet silinirken hata oluştu:', error);
        alert('Hizmet silinirken bir hata oluştu.');
      }
    }
  };

  // Fiyat formatı
  const formatPrice = (price: number) => {
    return `${price.toLocaleString('tr-TR')} ₺`;
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Hizmetler yükleniyor...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center my-5">
          <p className="text-danger">{error}</p>
          <Button variant="primary" onClick={fetchServices}>Tekrar Dene</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Hizmetler</h1>
        <Button variant="primary" onClick={handleAddService}>
          Yeni Hizmet Ekle
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="text-center my-5">
          <p>Henüz hizmet bulunmamaktadır.</p>
          <Button variant="primary" onClick={handleAddService}>
            İlk Hizmeti Ekle
          </Button>
        </div>
      ) : (
        <Row>
          {services.map((service) => (
            <Col key={service.id} lg={4} md={6} className="mb-4">
              <Card className="h-100">
                {service.imageUrl && (
                  <Card.Img 
                    variant="top" 
                    src={service.imageUrl} 
                    alt={service.title}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{service.title}</Card.Title>
                  <Card.Text>{service.shortDescription}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">{formatPrice(service.price)}</h5>
                    {service.prepaymentDiscountPercentage > 0 && (
                      <Badge bg="success">
                        %{service.prepaymentDiscountPercentage} İndirim
                      </Badge>
                    )}
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <Button 
                      variant="outline-primary" 
                      onClick={() => handleEditService(service.id)}
                    >
                      Düzenle
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      onClick={() => handleDeleteService(service.id)}
                    >
                      Sil
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ServicesPage; 