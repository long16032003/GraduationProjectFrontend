import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  ClockCircleOutlined,
  FireOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { OrderCounts } from './types';

interface KitchenStatsProps {
  orderCounts: OrderCounts;
}

const KitchenStats: React.FC<KitchenStatsProps> = ({ orderCounts }) => {
  return (
    <div className='mb-2'>
      <Row gutter={[8, 8]}>
        <Col xs={8} sm={6} md={4} lg={4}>
          <Card
            size='small'
            styles={{ body: { padding: '8px' } }}
            style={{
              background: '#bbdefb',
              borderRadius: '8px',
              border: '1px solid #2196f3',
            }}
          >
            <Statistic
              title={<span style={{ color: '#1565c0', fontWeight: 600 }}>Chờ chế biến</span>}
              value={orderCounts.pending}
              valueStyle={{ color: '#1890ff', fontSize: '18px', fontWeight: 'bold' }}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        
        <Col xs={8} sm={6} md={4} lg={4}>
          <Card
            size='small'
            styles={{ body: { padding: '8px' } }}
            style={{
              background: '#ffecb3',
              borderRadius: '8px',
              border: '1px solid #ff9800',
            }}
          >
            <Statistic
              title={<span style={{  color: '#e65100', fontWeight: 600 }}>Đang chế biến</span>}
              value={orderCounts.cooking}
              valueStyle={{ color: '#faad14', fontSize: '18px', fontWeight: 'bold' }}
              prefix={<FireOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        
        <Col xs={8} sm={6} md={4} lg={4}>
          <Card
            size='small'
            styles={{ body: { padding: '8px' } }}
            style={{
              background: '#e1bee7',
              borderRadius: '8px',
              border: '1px solid #9c27b0',
            }}
          >
            <Statistic
              title={<span style={{  color: '#6a1b9a', fontWeight: 600 }}>Chờ phục vụ</span>}
              value={orderCounts.ready}
              valueStyle={{ color: '#722ed1', fontSize: '18px', fontWeight: 'bold' }}
              prefix={<CheckOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        
        <Col xs={8} sm={6} md={4} lg={4}>
          <Card
            size='small'
            styles={{ body: { padding: '8px' } }}
            style={{
              background: '#ffcdd2',
              borderRadius: '8px',
              border: '1px solid #f44336',
            }}
          >
            <Statistic
              title={<span style={{  color: '#c62828', fontWeight: 600 }}>Chưa hoàn thành</span>}
              value={orderCounts.pending}
              valueStyle={{ color: '#f5222d', fontSize: '18px', fontWeight: 'bold' }}
              prefix={<WarningOutlined style={{ color: '#f5222d' }} />}
            />
          </Card>
        </Col>
        
        <Col xs={8} sm={6} md={4} lg={4}>
          <Card
            size='small'
            styles={{ body: { padding: '8px' } }}
            style={{
              background: '#c8e6c9',
              borderRadius: '8px',
              border: '1px solid #4caf50',
            }}
          >
            <Statistic
              title={<span style={{  color: '#2e7d32', fontWeight: 600 }}>Hoàn thành</span>}
              value={orderCounts.done}
              valueStyle={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        
        <Col xs={8} sm={6} md={4} lg={4}>
          <Card
            size='small'
            styles={{ body: { padding: '8px' } }}
            style={{
              background: '#f5f5f5',
              borderRadius: '8px',
              border: '1px solid #9e9e9e',
            }}
          >
            <Statistic
              title={<span style={{  color: '#424242', fontWeight: 600 }}>Đã hủy</span>}
              value={orderCounts.cancelled}
              valueStyle={{ color: '#8c8c8c', fontSize: '18px', fontWeight: 'bold' }}
              prefix={<CloseOutlined style={{ color: '#8c8c8c' }} />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default KitchenStats; 