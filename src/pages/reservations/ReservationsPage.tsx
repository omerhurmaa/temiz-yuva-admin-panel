import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

// Rezervasyon tipi
interface Reservation {
  id: number;
  userId: number;
  userFullName: string;
  email: string;
  phone: string;
  serviceId: number;
  serviceTitle: string;
  addressId: number;
  addressTitle: string;
  addressFullAddress: string;
  reservationDate: string;
  startTime: string;
  endTime: string | null;
  notes: string;
  status: string;
  paymentStatus: string;
  rejectionReason: string | null;
  cancellationReason: string | null;
  calculatedPrice: number;
  discountAmount: number;
  discountPercentage: number;
  prepaidAmount: number;
  finalPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string | null;
  paymentDate: string;
}

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      // Admin rolü için tüm rezervasyonları getir
      const response = await axios.get(`${API_BASE_URL}/Reservations/all`);
      setReservations(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Rezervasyonlar alınamadı:', err);
      setError('Rezervasyonlar yüklenirken bir hata oluştu.');
      setLoading(false);
      
      // Hata durumunda örnek verilerle gösterelim
      setReservations([
        {
          id: 1,
          userId: 1,
          userFullName: 'Ahmet Yılmaz',
          email: 'ahmet@example.com',
          phone: '555-1234-5678',
          serviceId: 1,
          serviceTitle: 'Ev Temizliği',
          addressId: 1,
          addressTitle: 'Kadıköy, İstanbul',
          addressFullAddress: 'Kadıköy, İstanbul',
          reservationDate: '2024-06-15T00:00:00Z',
          startTime: '10:00:00',
          endTime: null,
          notes: 'Lütfen sabah 10:00\'da gelin.',
          status: 'Pending',
          paymentStatus: 'Unpaid',
          rejectionReason: null,
          cancellationReason: null,
          calculatedPrice: 350,
          discountAmount: 0,
          discountPercentage: 0,
          prepaidAmount: 175,
          finalPrice: 350,
          totalPrice: 350,
          createdAt: '2024-04-01T14:30:00Z',
          updatedAt: null,
          paymentDate: ''
        },
        {
          id: 2,
          userId: 2,
          userFullName: 'Ayşe Demir',
          email: 'ayse@example.com',
          phone: '555-2345-6789',
          serviceId: 2,
          serviceTitle: 'Ofis Temizliği',
          addressId: 2,
          addressTitle: 'Şişli, İstanbul',
          addressFullAddress: 'Şişli, İstanbul',
          reservationDate: '2024-06-20T00:00:00Z',
          startTime: '14:00:00',
          endTime: null,
          notes: 'Öğleden sonra 14:00\'da bekliyoruz.',
          status: 'Confirmed',
          paymentStatus: 'Unpaid',
          rejectionReason: null,
          cancellationReason: null,
          calculatedPrice: 550,
          discountAmount: 0,
          discountPercentage: 0,
          prepaidAmount: 275,
          finalPrice: 550,
          totalPrice: 550,
          createdAt: '2024-04-05T10:15:00Z',
          updatedAt: null,
          paymentDate: ''
        },
        {
          id: 3,
          userId: 3,
          userFullName: 'Mehmet Kaya',
          email: 'mehmet@example.com',
          phone: '555-3456-7890',
          serviceId: 1,
          serviceTitle: 'Ev Temizliği',
          addressId: 3,
          addressTitle: 'Beşiktaş, İstanbul',
          addressFullAddress: 'Beşiktaş, İstanbul',
          reservationDate: '2024-05-10T00:00:00Z',
          startTime: '09:00:00',
          endTime: null,
          notes: 'Sabah 9\'da gelebilirsiniz.',
          status: 'Completed',
          paymentStatus: 'Paid',
          rejectionReason: null,
          cancellationReason: null,
          calculatedPrice: 400,
          discountAmount: 0,
          discountPercentage: 0,
          prepaidAmount: 200,
          finalPrice: 400,
          totalPrice: 400,
          createdAt: '2024-03-20T11:45:00Z',
          updatedAt: null,
          paymentDate: '2024-05-10T12:00:00Z'
        },
        {
          id: 4,
          userId: 4,
          userFullName: 'Zeynep Yıldız',
          email: 'zeynep@example.com',
          phone: '555-4567-8901',
          serviceId: 3,
          serviceTitle: 'Cam Temizliği',
          addressId: 4,
          addressTitle: 'Ataşehir, İstanbul',
          addressFullAddress: 'Ataşehir, İstanbul',
          reservationDate: '2024-05-05T00:00:00Z',
          startTime: '11:00:00',
          endTime: null,
          notes: '',
          status: 'Cancelled',
          paymentStatus: 'Refunded',
          rejectionReason: null,
          cancellationReason: 'Müsait olmadığım için iptal etmek istiyorum.',
          calculatedPrice: 250,
          discountAmount: 0,
          discountPercentage: 0,
          prepaidAmount: 0,
          finalPrice: 250,
          totalPrice: 250,
          createdAt: '2024-03-25T13:20:00Z',
          updatedAt: null,
          paymentDate: '2024-05-05T11:30:00Z'
        }
      ]);
    }
  };

  // Durum filtreleme
  const filteredReservations = reservations.filter(reservation => {
    // Durum filtresi
    if (statusFilter !== 'all' && reservation.status !== statusFilter) {
      return false;
    }
    
    // Tarih filtresi
    if (dateFilter) {
      const reservationDateStr = reservation.reservationDate.split('T')[0];
      if (reservationDateStr !== dateFilter) {
        return false;
      }
    }
    
    return true;
  });

  // Durum badge'i
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge bg="warning">Beklemede</Badge>;
      case 'Confirmed':
        return <Badge bg="primary">Onaylandı</Badge>;
      case 'Completed':
        return <Badge bg="success">Tamamlandı</Badge>;
      case 'Cancelled':
        return <Badge bg="danger">İptal Edildi</Badge>;
      case 'Rejected':
        return <Badge bg="dark">Reddedildi</Badge>;
      default:
        return <Badge bg="secondary">Bilinmiyor</Badge>;
    }
  };

  // Tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  // Fiyat formatı
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return '0 ₺';
    return `${price.toLocaleString('tr-TR')} ₺`;
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Rezervasyonlar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Rezervasyon Yönetimi</h1>
        <Button variant="primary" onClick={fetchReservations}>Yenile</Button>
      </div>

      {error && (
        <Alert variant="danger">
          {error}
          <p className="mb-0 mt-2">Demo veriler gösteriliyor.</p>
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="statusFilter">
                <Form.Label>Durum Filtresi</Form.Label>
                <Form.Select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tümü</option>
                  <option value="Pending">Beklemede</option>
                  <option value="Confirmed">Onaylandı</option>
                  <option value="Completed">Tamamlandı</option>
                  <option value="Cancelled">İptal Edildi</option>
                  <option value="Rejected">Reddedildi</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="dateFilter">
                <Form.Label>Tarih Filtresi</Form.Label>
                <Form.Control
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Müşteri</th>
                <th>Hizmet</th>
                <th>Tarih</th>
                <th>Saat</th>
                <th>Adres</th>
                <th>Toplam Tutar</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.id}</td>
                  <td>{reservation.userFullName}</td>
                  <td>{reservation.serviceTitle}</td>
                  <td>{formatDate(reservation.reservationDate)}</td>
                  <td>{reservation.startTime.substring(0, 5)}</td>
                  <td>{reservation.addressTitle}</td>
                  <td>{formatPrice(reservation.totalPrice)}</td>
                  <td>{getStatusBadge(reservation.status)}</td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => navigate(`/reservations/${reservation.id}`)}
                    >
                      Detay
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center">
                    Filtrelere uygun rezervasyon bulunamadı.
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

export default ReservationsPage; 