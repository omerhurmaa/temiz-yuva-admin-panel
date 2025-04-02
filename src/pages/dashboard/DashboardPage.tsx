import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// API URL
const API_URL = 'https://temizyuva.com';

interface DashboardData {
  totalReservations: number;
  pendingReservations: number;
  completedReservations: number;
  canceledReservations: number;
  recentReservations: number;
  totalRevenue: number;
  pendingPayments: number;
  activeServices: number;
  totalUsers: number;
  newUsers: number;
}

const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalReservations: 0,
    pendingReservations: 0,
    completedReservations: 0,
    canceledReservations: 0,
    recentReservations: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    activeServices: 0,
    totalUsers: 0,
    newUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/Admin/dashboard`);
      
      if (response.data.isSuccess) {
        setDashboardData(response.data.data);
      } else {
        throw new Error('API başarısız yanıt döndü');
      }
    } catch (err: any) {
      console.error('Dashboard verileri yüklenirken hata:', err);
      setError(`Veriler yüklenirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
      
      if (err.response) {
        console.error('API Yanıt Detayları:', {
          status: err.response.status,
          data: err.response.data
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Alert variant="warning">Lütfen giriş yapın.</Alert>;
  }

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
        <div className="mt-2">
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            Tekrar Dene
          </button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="dashboard">
      <h2 className="mb-4">Dashboard</h2>
      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Toplam Kullanıcı</Card.Title>
              <Card.Text className="display-4">{dashboardData.totalUsers}</Card.Text>
              <small className="text-muted">Yeni Kullanıcı: {dashboardData.newUsers}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Aktif Hizmetler</Card.Title>
              <Card.Text className="display-4">{dashboardData.activeServices}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Bekleyen Rezervasyonlar</Card.Title>
              <Card.Text className="display-4">{dashboardData.pendingReservations}</Card.Text>
              <small className="text-muted">Toplam: {dashboardData.totalReservations}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Tamamlanan Rezervasyonlar</Card.Title>
              <Card.Text className="display-4">{dashboardData.completedReservations}</Card.Text>
              <small className="text-muted">İptal: {dashboardData.canceledReservations}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Toplam Gelir</Card.Title>
              <Card.Text className="display-4">{dashboardData.totalRevenue.toFixed(2)} ₺</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Bekleyen Ödemeler</Card.Title>
              <Card.Text className="display-4">{dashboardData.pendingPayments.toFixed(2)} ₺</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Son Rezervasyonlar</Card.Title>
              <Card.Text className="display-4">{dashboardData.recentReservations}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Son Aktiviteler</h5>
            </Card.Header>
            <Card.Body>
              <p>Son aktiviteler burada listelenecek.</p>
              <p className="text-muted">Not: Bu bölüm API'den gelecek verilere göre güncellenecektir.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage; 