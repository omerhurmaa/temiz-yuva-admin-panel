import React, { useState, useEffect, FormEvent } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// API URL
const API_URL = 'https://temizyuva.com/api';

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
  isActive: boolean;
}

const initialFormData: ServiceFormData = {
  title: '',
  imageUrl: '',
  shortDescription: '',
  description: '',
  basePrice: 0,
  minPrice: 0,
  maxPrice: 0,
  prepaymentDiscountPercentage: 0,
  minPrepaymentPercentage: 50,
  isActive: true
};

const ServiceFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validated, setValidated] = useState<boolean>(false);

  useEffect(() => {
    if (isEditMode) {
      fetchServiceDetails();
    }
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/Services/${id}`);
      setFormData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Hizmet detayları alınamadı:', err);
      setError('Hizmet detayları yüklenirken bir hata oluştu.');
      setLoading(false);
      
      // Hata durumunda örnek veri
      if (id === '1') {
        setFormData({
          title: 'Ev Temizliği',
          imageUrl: 'https://example.com/images/temizlik.jpg',
          shortDescription: 'Profesyonel ev temizlik hizmeti',
          description: 'Detaylı açıklama metni',
          basePrice: 300,
          minPrice: 250,
          maxPrice: 500,
          prepaymentDiscountPercentage: 10,
          minPrepaymentPercentage: 50,
          isActive: true
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox kontrolü
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
      return;
    }
    
    // Sayısal değerler için kontrol
    if (['basePrice', 'minPrice', 'maxPrice', 'prepaymentDiscountPercentage', 'minPrepaymentPercentage'].includes(name)) {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseFloat(value)
      });
      return;
    }
    
    // Diğer string değerler için
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isEditMode) {
        await axios.put(`${API_URL}/Services/${id}`, formData);
        alert('Hizmet başarıyla güncellendi.');
      } else {
        const response = await axios.post(`${API_URL}/Services`, formData);
        console.log('Hizmet eklendi:', response.data);
      }
      
      navigate('/services');
    } catch (err) {
      console.error('Hizmet kaydedilemedi:', err);
      setError('Hizmet kaydedilirken bir hata oluştu.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Hizmet detayları yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEditMode ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}</h1>
        <Button variant="secondary" onClick={() => navigate('/services')}>
          Geri Dön
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formTitle">
                  <Form.Label>Hizmet Başlığı</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Hizmet başlığı gereklidir.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formImageUrl">
                  <Form.Label>Görsel URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Geçerli bir URL giriniz.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="formShortDescription">
              <Form.Label>Kısa Açıklama</Form.Label>
              <Form.Control
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                maxLength={100}
                required
              />
              <Form.Text className="text-muted">
                Maksimum 100 karakter
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                Kısa açıklama gereklidir.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Detaylı Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Detaylı açıklama gereklidir.
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formBasePrice">
                  <Form.Label>Temel Fiyat (₺)</Form.Label>
                  <Form.Control
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    min={0}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Geçerli bir fiyat giriniz.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formMinPrice">
                  <Form.Label>Minimum Fiyat (₺)</Form.Label>
                  <Form.Control
                    type="number"
                    name="minPrice"
                    value={formData.minPrice}
                    onChange={handleChange}
                    min={0}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formMaxPrice">
                  <Form.Label>Maksimum Fiyat (₺)</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxPrice"
                    value={formData.maxPrice}
                    onChange={handleChange}
                    min={0}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formPrepaymentDiscount">
                  <Form.Label>Ön Ödeme İndirimi (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="prepaymentDiscountPercentage"
                    value={formData.prepaymentDiscountPercentage}
                    onChange={handleChange}
                    min={0}
                    max={100}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formMinPrepayment">
                  <Form.Label>Minimum Ön Ödeme Yüzdesi (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="minPrepaymentPercentage"
                    value={formData.minPrepaymentPercentage}
                    onChange={handleChange}
                    min={0}
                    max={100}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="formIsActive">
              <Form.Check
                type="checkbox"
                label="Aktif"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ServiceFormPage; 