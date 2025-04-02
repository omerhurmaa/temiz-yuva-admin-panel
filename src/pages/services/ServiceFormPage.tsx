import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Alert, Spinner, Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// API URL
const API_URL = 'https://temizyuva.com';

interface ServiceFormData {
  title: string;
  imageUrl: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  prepaymentDiscountPercentage: number;
  minPrepaymentPercentage: number;
}

const ServiceFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    imageUrl: '',
    shortDescription: '',
    description: '',
    basePrice: 0,
    minPrice: 0,
    maxPrice: 0,
    prepaymentDiscountPercentage: 0,
    minPrepaymentPercentage: 50
  });

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/Services/${id}`);
      if (response.data && response.data.service) {
        const service = response.data.service;
        setFormData({
          title: service.title || '',
          imageUrl: service.imageUrl || '',
          shortDescription: service.shortDescription || '',
          description: service.description || '',
          basePrice: service.basePrice || 0,
          minPrice: service.minPrice || 0,
          maxPrice: service.maxPrice || 0,
          prepaymentDiscountPercentage: service.prepaymentDiscountPercentage || 0,
          minPrepaymentPercentage: service.minPrepaymentPercentage || 50
        });
      } else {
        setError('Hizmet bilgileri yüklenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Hizmet yüklenirken hata:', err);
      setError('Hizmet bilgileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Price') || name.includes('Percentage') ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      if (id) {
        // Güncelleme
        await axios.put(`${API_URL}/api/Services/${id}`, formData);
      } else {
        // Yeni hizmet
        await axios.post(`${API_URL}/api/Services`, formData);
      }

      navigate('/services');
    } catch (err: any) {
      console.error('Hizmet kaydedilirken hata:', err);
      setError(`Hizmet kaydedilirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Alert variant="warning">Lütfen giriş yapın.</Alert>;
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h3 className="mb-0">{id ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}</h3>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Başlık</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Resim URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Kısa Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Detaylı Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Normal Fiyat</Form.Label>
                  <Form.Control
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Fiyat</Form.Label>
                  <Form.Control
                    type="number"
                    name="minPrice"
                    value={formData.minPrice}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Maksimum Fiyat</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxPrice"
                    value={formData.maxPrice}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Peşinat İndirim Yüzdesi</Form.Label>
                  <Form.Control
                    type="number"
                    name="prepaymentDiscountPercentage"
                    value={formData.prepaymentDiscountPercentage}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Peşinat Yüzdesi</Form.Label>
                  <Form.Control
                    type="number"
                    name="minPrepaymentPercentage"
                    value={formData.minPrepaymentPercentage}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => navigate('/services')}>
                İptal
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Kaydediliyor...</span>
                  </>
                ) : (
                  'Kaydet'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ServiceFormPage; 