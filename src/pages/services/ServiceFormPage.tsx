import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface ServiceFormData {
  title: string;
  imageUrl: string;
  shortDescription: string;
  description: string;
  price: number;
  prepaymentDiscountPercentage: number;
  minPrepaymentPercentage: number;
}

const ServiceFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    imageUrl: '',
    shortDescription: '',
    description: '',
    price: 0,
    prepaymentDiscountPercentage: 0,
    minPrepaymentPercentage: 0
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isEditMode) {
      fetchServiceDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchServiceDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/Services/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        const serviceData = response.data.data || response.data;
        setFormData({
          title: serviceData.title || '',
          imageUrl: serviceData.imageUrl || '',
          shortDescription: serviceData.shortDescription || '',
          description: serviceData.description || '',
          price: serviceData.price || 0,
          prepaymentDiscountPercentage: serviceData.prepaymentDiscountPercentage || 0,
          minPrepaymentPercentage: serviceData.minPrepaymentPercentage || 0
        });
      } else {
        setError('Hizmet verileri alınamadı.');
      }
    } catch (error) {
      console.error('Hizmet detayları alınırken hata oluştu:', error);
      setError('Hizmet bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'prepaymentDiscountPercentage' || name === 'minPrepaymentPercentage'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const token = localStorage.getItem('token');
      
      if (isEditMode) {
        // Düzenleme modu - PUT isteği
        await axios.put(`${API_BASE_URL}/Services/${id}`, formData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // Ekleme modu - POST isteği
        await axios.post(`${API_BASE_URL}/Services`, formData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      setSuccess(true);
      
      // 2 saniye bekleyip hizmetler sayfasına yönlendir
      setTimeout(() => {
        navigate('/services');
      }, 2000);
    } catch (error) {
      console.error('Hizmet kaydedilirken hata oluştu:', error);
      setError('Hizmet kaydedilirken bir hata oluştu.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Hizmet bilgileri yükleniyor...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-4">
        <h1>{isEditMode ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}</h1>
      </div>
      
      <Card>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Hizmet başarıyla {isEditMode ? 'güncellendi' : 'eklendi'}!</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Hizmet Adı</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Hizmet adı girin"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Resim URL'si</Form.Label>
              <Form.Control
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <small>Önizleme:</small>
                  <img 
                    src={formData.imageUrl} 
                    alt="Önizleme" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '150px', 
                      display: 'block',
                      marginTop: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '4px'
                    }} 
                  />
                </div>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Kısa Açıklama</Form.Label>
              <Form.Control
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="Kısa açıklama girin (liste sayfasında gösterilir)"
                required
                maxLength={150}
              />
              <Form.Text className="text-muted">
                En fazla 150 karakter. {formData.shortDescription.length}/150
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Detaylı Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Hizmetin detaylı açıklamasını girin"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Fiyat (₺)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price.toString()}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Ön Ödeme İndirim Oranı (%)</Form.Label>
              <Form.Control
                type="number"
                name="prepaymentDiscountPercentage"
                value={formData.prepaymentDiscountPercentage.toString()}
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
              <Form.Text className="text-muted">
                Ön ödeme yapıldığında uygulanacak indirim oranı
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Min. Ön Ödeme Oranı (%)</Form.Label>
              <Form.Control
                type="number"
                name="minPrepaymentPercentage"
                value={formData.minPrepaymentPercentage.toString()}
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
              <Form.Text className="text-muted">
                İndirim için yapılması gereken minimum ön ödeme oranı
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                type="submit"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    {isEditMode ? 'Güncelleniyor...' : 'Kaydediliyor...'}
                  </>
                ) : (
                  isEditMode ? 'Güncelle' : 'Kaydet'
                )}
              </Button>
              
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/services')}
                disabled={submitLoading}
              >
                İptal
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ServiceFormPage; 