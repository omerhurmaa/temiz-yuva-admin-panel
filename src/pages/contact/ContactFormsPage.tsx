import React, { useState, useEffect } from 'react';
import { Table, Badge, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ContactForm } from '../../types/ContactForm';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { API_BASE_URL } from '../../config/api';

const ContactFormsPage: React.FC = () => {
  const [contactForms, setContactForms] = useState<ContactForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContactForms();
  }, []);

  const fetchContactForms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/contactform`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('API Yanıtı:', response.data);

      if (response.data.success) {
        setContactForms(response.data.data);
      } else {
        setError(response.data.message || 'Veriler alınamadı');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'İletişim formları yüklenirken bir hata oluştu');
      console.error('Error fetching contact forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id: number) => {
    navigate(`/contact-forms/${id}`);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h4 className="mb-0">İletişim Formları</h4>
      </Card.Header>
      <Card.Body>
        <Table hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ad Soyad</th>
              <th>E-posta</th>
              <th>Telefon</th>
              <th>Konu</th>
              <th>Durum</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {contactForms.map((form) => (
              <tr 
                key={form.id} 
                onClick={() => handleRowClick(form.id)}
                style={{ cursor: 'pointer' }}
                className={!form.isRead ? 'table-light' : ''}
              >
                <td>{form.id}</td>
                <td>{form.fullName}</td>
                <td>{form.email}</td>
                <td>{form.phone}</td>
                <td>{form.subject}</td>
                <td>
                  <Badge bg={form.isRead ? 'success' : 'warning'}>
                    {form.isRead ? 'Okundu' : 'Okunmadı'}
                  </Badge>
                </td>
                <td>
                  {format(new Date(form.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default ContactFormsPage; 