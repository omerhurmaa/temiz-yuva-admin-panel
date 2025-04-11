import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ContactForm } from '../../types/ContactForm';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { API_BASE_URL } from '../../config/api';

const ContactFormDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState<ContactForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContactFormDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchContactFormDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_BASE_URL}/contactform/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('API Yanıtı:', response.data);

      if (response.data.success) {
        setContactForm(response.data.data);
      } else {
        setError(response.data.message || 'Veriler alınamadı');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'İletişim formu detayı yüklenirken bir hata oluştu');
      console.error('Error fetching contact form detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(`${API_BASE_URL}/contactform/${id}/mark-as-read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Okundu işaretleme yanıtı:', response.data);

      if (response.data.success) {
        fetchContactFormDetail();
      } else {
        setError(response.data.message || 'İşlem başarısız');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Okundu olarak işaretlenirken bir hata oluştu');
      console.error('Error marking as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !contactForm) {
    return (
      <Alert variant="danger" className="mt-3">
        {error || 'İletişim formu bulunamadı'}
      </Alert>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">İletişim Formu Detayı</h4>
        <div>
          <Button 
            variant="secondary" 
            className="me-2"
            onClick={() => navigate('/contact-forms')}
          >
            Geri Dön
          </Button>
          {!contactForm.isRead && (
            <Button 
              variant="success"
              onClick={markAsRead}
            >
              Okundu Olarak İşaretle
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        <div className="mb-4">
          <Badge bg={contactForm.isRead ? 'success' : 'warning'} className="mb-3">
            {contactForm.isRead ? 'Okundu' : 'Okunmadı'}
          </Badge>
          <h5>Gönderen Bilgileri</h5>
          <p><strong>Ad Soyad:</strong> {contactForm.fullName}</p>
          <p><strong>E-posta:</strong> {contactForm.email}</p>
          <p><strong>Telefon:</strong> {contactForm.phone}</p>
        </div>

        <div className="mb-4">
          <h5>Mesaj Detayı</h5>
          <p><strong>Konu:</strong> {contactForm.subject}</p>
          <p><strong>Mesaj:</strong></p>
          <div className="p-3 bg-light rounded">
            {contactForm.message}
          </div>
        </div>

        <div>
          <h5>Zaman Bilgileri</h5>
          <p>
            <strong>Gönderilme Tarihi:</strong>{' '}
            {format(new Date(contactForm.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
          </p>
          {contactForm.readAt && (
            <p>
              <strong>Okunma Tarihi:</strong>{' '}
              {format(new Date(contactForm.readAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
            </p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ContactFormDetailPage; 