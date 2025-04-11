import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
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
  price: number;
  discountAmount: number;
  discountPercentage: number;
  prepaidAmount: number;
  finalPrice: number;
  paidTotal: number;
  remainingAmount: number;
  servicePrice: string;
  createdAt: string;
  updatedAt: string | null;
  paymentDate: string | null;
  paymentMethod?: string;
}

const ReservationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [statusFormData, setStatusFormData] = useState({
    reservationDate: '',
    startTime: '',
    endTime: '',
    notes: '',
    price: 0,
    status: 1,
    paymentStatus: 1,
    paymentMethod: 'None'
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchReservationDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (reservation) {
      setStatusFormData({
        reservationDate: reservation.reservationDate.split('T')[0],
        startTime: reservation.startTime,
        endTime: reservation.endTime || '',
        notes: reservation.notes || '',
        price: reservation.price,
        status: getStatusNumber(reservation.status),
        paymentStatus: getPaymentStatusNumber(reservation.paymentStatus),
        paymentMethod: reservation.paymentMethod || 'None'
      });
    }
  }, [reservation]);

  const fetchReservationDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/Reservations/${id}`);
      setReservation(response.data);
      setStatusFormData({
        reservationDate: response.data.reservationDate.split('T')[0],
        startTime: response.data.startTime,
        endTime: response.data.endTime || '',
        notes: response.data.notes || '',
        price: response.data.price,
        status: getStatusNumber(response.data.status),
        paymentStatus: getPaymentStatusNumber(response.data.paymentStatus),
        paymentMethod: response.data.paymentMethod || 'None'
      });
      setLoading(false);
    } catch (err) {
      console.error('Rezervasyon detayları alınamadı:', err);
      setError('Rezervasyon detayları yüklenirken bir hata oluştu.');
      setLoading(false);
      
      // Hata durumunda örnek veri
      const demoReservation = {
        id: parseInt(id || '1'),
        userId: 1,
        userFullName: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        phone: '+905551234567',
        serviceId: 1,
        serviceTitle: 'Ev Temizliği',
        addressId: 1,
        addressTitle: 'Ev',
        addressFullAddress: 'Örnek Mahallesi, Örnek Sokak No:1, D:5, Kadıköy, İstanbul',
        reservationDate: '2024-06-15T00:00:00Z',
        startTime: '10:00:00',
        endTime: null,
        notes: 'Lütfen sabah 10:00\'da gelin.',
        status: 'Pending',
        paymentStatus: 'PartiallyPaid',
        rejectionReason: null,
        cancellationReason: null,
        price: 350,
        discountAmount: 0,
        discountPercentage: 0,
        prepaidAmount: 175,
        finalPrice: 350,
        paidTotal: 175,
        remainingAmount: 175,
        servicePrice: '350',
        createdAt: '2024-04-01T14:30:00Z',
        updatedAt: null,
        paymentDate: '2024-04-01T14:30:00Z',
        paymentMethod: 'Cash'
      };
      
      setReservation(demoReservation);
      setStatusFormData({
        reservationDate: demoReservation.reservationDate.split('T')[0],
        startTime: demoReservation.startTime,
        endTime: demoReservation.endTime || '',
        notes: demoReservation.notes || '',
        price: demoReservation.price,
        status: getStatusNumber(demoReservation.status),
        paymentStatus: getPaymentStatusNumber(demoReservation.paymentStatus),
        paymentMethod: demoReservation.paymentMethod || 'None'
      });
    }
  };

  const getStatusNumber = (status: string): number => {
    const statusMap: { [key: string]: number } = {
      'Pending': 1,
      'Confirmed': 2,
      'Completed': 3,
      'Cancelled': 4,
      'Rejected': 5
    };
    return statusMap[status] || 1;
  };

  const getStatusString = (status: number): string => {
    const statusMap: { [key: number]: string } = {
      1: 'Pending',
      2: 'Confirmed',
      3: 'Completed',
      4: 'Cancelled',
      5: 'Rejected'
    };
    return statusMap[status] || 'Pending';
  };

  const getPaymentStatusNumber = (status: string): number => {
    const statusMap: { [key: string]: number } = {
      'Unpaid': 1,
      'PartiallyPaid': 2,
      'Paid': 3
    };
    return statusMap[status] || 1;
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStatusFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : 
              name === 'status' ? parseInt(value) :
              name === 'paymentStatus' ? parseInt(value) :
              name === 'paymentMethod' ? value : value
    }));
  };

  const handleOpenStatusModal = () => {
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
  };

  const handleUpdateStatus = async () => {
    try {
      setSubmitting(true);
      
      await axios.put(`${API_BASE_URL}/Admin/reservations/${id}`, statusFormData);
      
      // Başarılı ise rezervasyon bilgilerini güncelle
      setReservation(prev => ({
        ...prev!,
        reservationDate: statusFormData.reservationDate,
        startTime: statusFormData.startTime,
        endTime: statusFormData.endTime,
        notes: statusFormData.notes,
        price: statusFormData.price,
        finalPrice: statusFormData.price,
        status: getStatusString(statusFormData.status),
        paymentStatus: statusFormData.paymentStatus === 1 ? 'Unpaid' : 
                      statusFormData.paymentStatus === 2 ? 'PartiallyPaid' : 'Paid',
        paymentMethod: statusFormData.paymentMethod
      }));
      
      setSubmitting(false);
      handleCloseStatusModal();
      
      // Başarılı güncelleme sonrası sayfayı yenile
      fetchReservationDetails();
    } catch (err) {
      console.error('Durum güncellenirken hata oluştu:', err);
      alert('Durum güncellenirken bir hata oluştu.');
      setSubmitting(false);
    }
  };

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

  // Fiyat formatı
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return '0 ₺';
    return `${price.toLocaleString('tr-TR')} ₺`;
  };

  // Tarih formatı
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  // Saat formatı
  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Rezervasyon detayları yükleniyor...</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <Alert variant="danger">
        Rezervasyon bulunamadı veya bir hata oluştu.
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Rezervasyon Detayı</h1>
        <div>
          <Button 
            variant="primary" 
            className="me-2"
            onClick={handleOpenStatusModal}
          >
            Durum Güncelle
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/reservations')}
          >
            Geri Dön
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger">
          {error}
          <p className="mb-0 mt-2">Demo veriler gösteriliyor.</p>
        </Alert>
      )}

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Rezervasyon Bilgileri</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-2">
                <Col md={4} className="text-muted">Rezervasyon ID:</Col>
                <Col md={8}>{reservation.id}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={4} className="text-muted">Durum:</Col>
                <Col md={8}>{getStatusBadge(reservation.status)}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={4} className="text-muted">Hizmet:</Col>
                <Col md={8}>{reservation.serviceTitle}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={4} className="text-muted">Tarih:</Col>
                <Col md={8}>{formatDate(reservation.reservationDate)}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={4} className="text-muted">Saat:</Col>
                <Col md={8}>{formatTime(reservation.startTime)}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={4} className="text-muted">Oluşturulma:</Col>
                <Col md={8}>{formatDate(reservation.createdAt)}</Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Ödeme Bilgileri</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-2">
                <Col md={6} className="text-muted">Toplam Tutar:</Col>
                <Col md={6}><strong>{formatPrice(reservation.finalPrice)}</strong></Col>
              </Row>
              <Row className="mb-2">
                <Col md={6} className="text-muted">Ön Ödeme Tutarı:</Col>
                <Col md={6}>{formatPrice(reservation.paidTotal)}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6} className="text-muted">Kalan Tutar:</Col>
                <Col md={6}>{formatPrice(reservation.remainingAmount)}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6} className="text-muted">Ödeme Durumu:</Col>
                <Col md={6}>{reservation.paymentStatus === 'Paid' ? 
                  <Badge bg="success">Ödenmiş</Badge> : 
                  reservation.paymentStatus === 'PartiallyPaid' ? 
                  <Badge bg="warning">Kısmen Ödenmiş</Badge> : 
                  <Badge bg="danger">Ödenmemiş</Badge>
                }</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6} className="text-muted">Ödeme Yöntemi:</Col>
                <Col md={6}>
                  {reservation.paymentMethod === 'Cash' ? 'Nakit' :
                   reservation.paymentMethod === 'CreditCard' ? 'Kredi Kartı' :
                   reservation.paymentMethod === 'BankTransfer' ? 'Banka Transferi' :
                   'Seçilmedi'}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Müşteri Bilgileri</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-2">
                <Col md={4} className="text-muted">Müşteri ID:</Col>
                <Col md={8}>{reservation.userId}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={4} className="text-muted">Müşteri Adı:</Col>
                <Col md={8}>{reservation.userFullName}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={4} className="text-muted">E-posta:</Col>
                <Col md={8}>{reservation.email}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={4} className="text-muted">Telefon:</Col>
                <Col md={8}>{reservation.phone}</Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Adres Bilgileri</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-2">
                <Col md={4} className="text-muted">Adres ID:</Col>
                <Col md={8}>{reservation.addressId}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={4} className="text-muted">Adres Başlığı:</Col>
                <Col md={8}>{reservation.addressTitle}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={4} className="text-muted">Adres:</Col>
                <Col md={8}>{reservation.addressFullAddress}</Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Notlar</h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-0">
                <strong>Müşteri Notu:</strong> 
                <br />
                {reservation.notes || 'Not bulunmuyor.'}
              </p>
              {reservation.cancellationReason && (
                <>
                  <hr />
                  <p className="mb-0">
                    <strong>İptal Sebebi:</strong> 
                    <br />
                    {reservation.cancellationReason}
                  </p>
                </>
              )}
              {reservation.rejectionReason && (
                <>
                  <hr />
                  <p className="mb-0">
                    <strong>Reddetme Sebebi:</strong> 
                    <br />
                    {reservation.rejectionReason}
                  </p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Durum Güncelleme Modal */}
      <Modal show={showStatusModal} onHide={handleCloseStatusModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Rezervasyon Durumunu Güncelle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rezervasyon Tarihi</Form.Label>
                  <Form.Control
                    type="date"
                    name="reservationDate"
                    value={statusFormData.reservationDate}
                    onChange={handleStatusChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Başlangıç Saati</Form.Label>
                  <Form.Control
                    type="time"
                    name="startTime"
                    value={statusFormData.startTime.substring(0, 5)}
                    onChange={handleStatusChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bitiş Saati</Form.Label>
                  <Form.Control
                    type="time"
                    name="endTime"
                    value={statusFormData.endTime ? statusFormData.endTime.substring(0, 5) : ''}
                    onChange={handleStatusChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fiyat (₺)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={statusFormData.price}
                    onChange={handleStatusChange}
                    min={0}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Durum</Form.Label>
              <Form.Select 
                name="status"
                value={statusFormData.status}
                onChange={handleStatusChange}
              >
                <option value={1}>Beklemede</option>
                <option value={2}>Onaylandı</option>
                <option value={3}>Tamamlandı</option>
                <option value={4}>İptal Edildi</option>
                <option value={5}>Reddedildi</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ödeme Durumu</Form.Label>
              <Form.Select 
                name="paymentStatus"
                value={statusFormData.paymentStatus}
                onChange={handleStatusChange}
              >
                <option value={1}>Ödenmedi</option>
                <option value={2}>Kısmen Ödendi</option>
                <option value={3}>Ödendi</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ödeme Yöntemi</Form.Label>
              <Form.Select 
                name="paymentMethod"
                value={statusFormData.paymentMethod}
                onChange={handleStatusChange}
              >
                <option value="None">Seçilmedi</option>
                <option value="Cash">Nakit</option>
                <option value="CreditCard">Kredi Kartı</option>
                <option value="BankTransfer">Banka Transferi</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notlar</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={statusFormData.notes}
                onChange={handleStatusChange}
                placeholder="Müşteriye iletilecek notunuzu yazın"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseStatusModal}>
            İptal
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateStatus}
            disabled={submitting}
          >
            {submitting ? 'Güncelleniyor...' : 'Güncelle'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReservationDetailPage; 