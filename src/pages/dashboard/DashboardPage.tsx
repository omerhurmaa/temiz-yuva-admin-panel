import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

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
  const [loading, setLoading] = useState(true);
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
    newUsers: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/Admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.isSuccess) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Dashboard verisi alınırken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Para formatı
  const formatPrice = (price: number) => {
    return price.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺';
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Dashboard yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      
      <Row>
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Toplam Rezervasyon</h6>
                  <h4 className="mb-0">{dashboardData.totalReservations}</h4>
                </div>
                <div className="text-primary fs-3">
                  📅
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Bekleyen Rezervasyon</h6>
                  <h4 className="mb-0">{dashboardData.pendingReservations}</h4>
                </div>
                <div className="text-warning fs-3">
                  ⏱️
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Tamamlanan</h6>
                  <h4 className="mb-0">{dashboardData.completedReservations}</h4>
                </div>
                <div className="text-success fs-3">
                  ✅
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">İptal Edilen</h6>
                  <h4 className="mb-0">{dashboardData.canceledReservations}</h4>
                </div>
                <div className="text-danger fs-3">
                  ❌
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Toplam Gelir</h6>
                  <h4 className="mb-0">{formatPrice(dashboardData.totalRevenue)}</h4>
                </div>
                <div className="text-success fs-3">
                  💰
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Bekleyen Ödemeler</h6>
                  <h4 className="mb-0">{dashboardData.pendingPayments}</h4>
                </div>
                <div className="text-warning fs-3">
                  💸
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Aktif Hizmetler</h6>
                  <h4 className="mb-0">{dashboardData.activeServices}</h4>
                </div>
                <div className="text-info fs-3">
                  🔧
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Toplam Kullanıcı</h6>
                  <h4 className="mb-0">{dashboardData.totalUsers}</h4>
                </div>
                <div className="text-primary fs-3">
                  👥
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Yeni Kullanıcılar</h6>
                  <h4 className="mb-0">{dashboardData.newUsers}</h4>
                </div>
                <div className="text-success fs-3">
                  👤
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage; 