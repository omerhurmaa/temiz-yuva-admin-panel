import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';

// API URL
const API_URL = 'https://temizyuva.com/api';

interface DashboardStats {
  userCount: number;
  serviceCount: number;
  pendingReservations: number;
  completedReservations: number;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    serviceCount: 0,
    pendingReservations: 0,
    completedReservations: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Normalde burada API'den dashboard verilerini alacağız
        // Şimdilik mock data ile gösteriyoruz
        
        // Kullanıcı sayısını al
        const userResponse = await axios.get(`${API_URL}/Admin/users`);
        const userCount = userResponse.data.length;
        
        // Hizmet sayısını al
        const serviceResponse = await axios.get(`${API_URL}/Services`);
        const serviceCount = serviceResponse.data.length;
        
        // Rezervasyon verilerini al
        const reservationResponse = await axios.get(`${API_URL}/Reservations/all`);
        const reservations = reservationResponse.data;
        
        const pendingReservations = reservations.filter((res: any) => res.status === 0).length;
        const completedReservations = reservations.filter((res: any) => res.status === 2).length;
        
        setStats({
          userCount,
          serviceCount,
          pendingReservations,
          completedReservations
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Dashboard verileri alınamadı:', err);
        setError('Dashboard verileri yüklenirken bir hata oluştu.');
        setLoading(false);
        
        // Hata durumunda örnek veriler gösterelim
        setStats({
          userCount: 25,
          serviceCount: 8,
          pendingReservations: 12,
          completedReservations: 48
        });
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-danger">
        <p>{error}</p>
        <p>Demo verileri gösteriliyor.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      
      <Row>
        <Col md={3}>
          <Card className="text-center mb-4 bg-primary text-white">
            <Card.Body>
              <h2>{stats.userCount}</h2>
              <Card.Title>Toplam Kullanıcı</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center mb-4 bg-success text-white">
            <Card.Body>
              <h2>{stats.serviceCount}</h2>
              <Card.Title>Aktif Hizmet</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center mb-4 bg-warning text-white">
            <Card.Body>
              <h2>{stats.pendingReservations}</h2>
              <Card.Title>Bekleyen Rezervasyon</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center mb-4 bg-info text-white">
            <Card.Body>
              <h2>{stats.completedReservations}</h2>
              <Card.Title>Tamamlanan Rezervasyon</Card.Title>
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