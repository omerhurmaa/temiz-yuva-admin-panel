import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// API URL
const API_URL = 'https://temizyuva.com/api';

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

const ReservationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [statusFormData, setStatusFormData] = useState({
    status: '',
    operatorNotes: '',
    totalPrice: 0,
    markAsPaid: false
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchReservationDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/Reservations/${id}`);
      setReservation(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Rezervasyon detayları alınamadı:', err);
      setError('Rezervasyon detayları yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReservationDetails();
    }
  }, [id]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'status') {
      setStatusFormData({
        ...statusFormData,
        status: value
      });
    } else if (name === 'totalPrice') {
      setStatusFormData({
        ...statusFormData,
        totalPrice: parseFloat(value) || 0
      });
    } else {
      setStatusFormData({
        ...statusFormData,
        [name]: value
      });
    }
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
      
      await axios.post(`${API_URL}/Reservations/${id}/status`, statusFormData);
      
      // Başarılı ise rezervasyon bilgilerini güncelle
      setReservation({
        ...reservation!,
        status: statusFormData.status,
        notes: statusFormData.operatorNotes,
        totalPrice: statusFormData.totalPrice,
        paymentStatus: statusFormData.markAsPaid ? 'Paid' : reservation!.paymentStatus
      });
      
      setSubmitting(false);
      handleCloseStatusModal();
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

  // Tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  // Fiyat formatı
  const formatPrice = (price: number) => {
    return price.toLocaleString('tr-TR') + ' ₺';
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
                <Col md={8}>{reservation.startTime.substring(0, 5)}</Col>
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
                <Col md={6}><strong>{formatPrice(reservation.totalPrice)}</strong></Col>
              </Row>
              <Row className="mb-2">
                <Col md={6} className="text-muted">Ön Ödeme Tutarı:</Col>
                <Col md={6}>{formatPrice(reservation.prepaidAmount)}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6} className="text-muted">Kalan Tutar:</Col>
                <Col md={6}>{formatPrice(reservation.totalPrice - reservation.prepaidAmount)}</Col>
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
            <Form.Group className="mb-3" controlId="formStatus">
              <Form.Label>Durum</Form.Label>
              <Form.Select 
                name="status"
                value={statusFormData.status}
                onChange={handleStatusChange}
              >
                <option value="Pending">Beklemede</option>
                <option value="Confirmed">Onaylandı</option>
                <option value="Completed">Tamamlandı</option>
                <option value="Cancelled">İptal Edildi</option>
                <option value="Rejected">Reddedildi</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTotalPrice">
              <Form.Label>Toplam Tutar (₺)</Form.Label>
              <Form.Control
                type="number"
                name="totalPrice"
                value={statusFormData.totalPrice}
                onChange={handleStatusChange}
                min={0}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formOperatorNotes">
              <Form.Label>Operatör Notu</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="operatorNotes"
                value={statusFormData.operatorNotes}
                onChange={handleStatusChange}
                placeholder="Müşteriye iletilecek notunuzu yazın"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPaymentStatus">
              <Form.Check
                type="checkbox"
                label="Ödeme alındı olarak işaretle"
                name="markAsPaid"
                checked={statusFormData.markAsPaid}
                onChange={(e) => setStatusFormData({
                  ...statusFormData,
                  markAsPaid: e.target.checked
                })}
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