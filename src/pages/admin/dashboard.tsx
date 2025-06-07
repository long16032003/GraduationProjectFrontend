import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Divider } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';

// Import Ant Design Charts
import { Column, Pie, Line, Area } from '@ant-design/plots';

const { Title, Text } = Typography;

// Define types for the data
interface RevenueItem {
  month: string;
  type: string;
  value: number;
}

interface CategoryItem {
  type: string;
  value: number;
}

interface TimeItem {
  time: string;
  value: number;
}

interface DailyItem {
  day: string;
  type: string;
  value: number;
}

// Fake data for the dashboard
const generateRevenueData = (): RevenueItem[] => {
  const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  
  const result: RevenueItem[] = [];
  months.forEach(month => {
    const revenue = Math.floor(Math.random() * 100000) + 50000;
    const expenses = Math.floor(Math.random() * 50000) + 20000;
    const profit = Math.floor(Math.random() * 50000) + 30000;
    
    result.push({
      month,
      type: 'Doanh thu',
      value: revenue
    });
    
    result.push({
      month,
      type: 'Chi phí',
      value: expenses
    });
    
    result.push({
      month,
      type: 'Lợi nhuận',
      value: profit
    });
  });
  
  return result;
};

const generateCategoryData = (): CategoryItem[] => {
  const categories = ['Món chính', 'Tráng miệng', 'Đồ uống', 'Khai vị', 'Combo'];
  return categories.map(category => ({
    type: category,
    value: Math.floor(Math.random() * 500) + 100
  }));
};

const generateTimeData = (): TimeItem[] => {
  const times = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  return times.map(time => ({
    time,
    value: Math.floor(Math.random() * 100) + 10
  }));
};

const generateDailyData = (): DailyItem[] => {
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  
  const result: DailyItem[] = [];
  days.forEach(day => {
    const customers = Math.floor(Math.random() * 500) + 100;
    const revenue = Math.floor(Math.random() * 20000000) + 5000000;
    
    result.push({
      day,
      type: 'Khách hàng',
      value: customers
    });
    
    result.push({
      day,
      type: 'Doanh thu (triệu VND)',
      value: revenue / 1000000 // Convert to millions for better display
    });
  });
  
  return result;
};

export function DashboardPage() {
  const [revenueData] = useState(generateRevenueData());
  const [categoryData] = useState(generateCategoryData());
  const [timeData] = useState(generateTimeData());
  const [dailyData] = useState(generateDailyData());

  // Calculate summary statistics
  const totalRevenue = revenueData
    .filter(item => item.type === 'Doanh thu')
    .reduce((sum, item) => sum + item.value, 0);
    
  const totalProfit = revenueData
    .filter(item => item.type === 'Lợi nhuận')
    .reduce((sum, item) => sum + item.value, 0);
    
  const totalCustomers = dailyData
    .filter(item => item.type === 'Khách hàng')
    .reduce((sum, item) => sum + item.value, 0);
    
  const totalOrders = Math.floor(totalCustomers * 1.2); // Assume some customers make multiple orders
  const averageCheck = Math.floor(totalRevenue / totalOrders);
  const tableUtilization = 78; // Percentage
  const reservationsCount = Math.floor(totalCustomers * 0.6); // Assume 60% of customers have reservations

  // Column Chart Config
  const columnConfig = {
    data: revenueData,
    isStack: true,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    label: {
      position: 'middle',
    },
    legend: {
      position: 'top',
    },
    color: ['#4ade80', '#f43f5e', '#3b82f6'],
  };

  // Pie Chart Config
  const pieConfig = {
    data: categoryData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    color: ['#3b82f6', '#f97316', '#8b5cf6', '#ef4444', '#10b981'],
  };

  // Line Chart Config
  const lineConfig = {
    data: timeData,
    xField: 'time',
    yField: 'value',
    label: {},
    point: {
      size: 5,
      shape: 'diamond',
    },
    smooth: true,
    color: '#f59e0b',
  };

  // Area Chart Config
  const areaConfig = {
    data: dailyData,
    xField: 'day',
    yField: 'value',
    seriesField: 'type',
    color: ['#14b8a6', '#6366f1'],
    areaStyle: {
      fillOpacity: 0.7,
    },
    legend: {
      position: 'top',
    },
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Title level={2} className="mb-6">Bảng điều khiển nhà hàng</Title>
      
      {/* Summary Overview */}
      <Card bordered={false} className="shadow-sm mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <RiseOutlined style={{ fontSize: 24, color: '#1677ff' }} />
              </div>
              <div>
                <Title level={4} className="!mb-0">Tổng quan hiệu suất</Title>
                <Text type="secondary">Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</Text>
              </div>
            </div>
            <Divider />
            <Text>
              Hiệu suất kinh doanh tháng này tăng <Text strong style={{ color: '#3f8600' }}>12%</Text> so với tháng trước. 
              Số lượng khách hàng tăng <Text strong style={{ color: '#3f8600' }}>8%</Text>. 
              Món ăn bán chạy nhất là <Text strong>Bò bít tết</Text> với <Text strong>428</Text> đơn.
            </Text>
          </Col>
          <Col xs={24} md={12}>
            <div className="flex items-center justify-between">
              <div>
                <Title level={5} className="!mb-1">Tỷ lệ khách quay lại</Title>
                <Text type="secondary">65% khách hàng quay lại trong tháng này</Text>
              </div>
              <div>
                <Title level={5} className="!mb-1">Đánh giá trung bình</Title>
                <Text type="secondary">4.7/5 (dựa trên 342 đánh giá)</Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
      
      {/* Overview Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} className="shadow-sm h-full">
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue.toLocaleString('vi-VN')}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: '#3f8600' }}
            />
            <Text type="secondary">Tháng này</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} className="shadow-sm h-full">
            <Statistic
              title="Lợi nhuận"
              value={totalProfit.toLocaleString('vi-VN')}
              prefix={<RiseOutlined />}
              suffix="VND"
              valueStyle={{ color: '#cf1322' }}
            />
            <Text type="secondary">Tháng này</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} className="shadow-sm h-full">
            <Statistic
              title="Khách hàng"
              value={totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
            <Text type="secondary">Tháng này</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} className="shadow-sm h-full">
            <Statistic
              title="Đơn hàng"
              value={totalOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Text type="secondary">Tháng này</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} className="shadow-sm h-full">
            <Statistic
              title="Trung bình hóa đơn"
              value={averageCheck.toLocaleString('vi-VN')}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: '#faad14' }}
            />
            <Text type="secondary">Tháng này</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} className="shadow-sm h-full">
            <Statistic
              title="Công suất bàn"
              value={tableUtilization}
              suffix="%"
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary">Tháng này</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} className="shadow-sm h-full">
            <Statistic
              title="Lượt đặt bàn"
              value={reservationsCount}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
            <Text type="secondary">Tháng này</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} className="shadow-sm h-full">
            <Statistic
              title="Thời gian phục vụ TB"
              value={24}
              prefix={<ClockCircleOutlined />}
              suffix="phút"
              valueStyle={{ color: '#fa8c16' }}
            />
            <Text type="secondary">Tháng này</Text>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="Doanh thu - Chi phí - Lợi nhuận" bordered={false} className="shadow-sm">
            <Column {...columnConfig} height={350} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân bổ doanh số theo danh mục" bordered={false} className="shadow-sm">
            <Pie {...pieConfig} height={350} />
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Phân bổ khách hàng theo khung giờ" bordered={false} className="shadow-sm">
            <Line {...lineConfig} height={350} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Hoạt động theo ngày trong tuần" bordered={false} className="shadow-sm">
            <Area {...areaConfig} height={350} />
          </Card>
        </Col>
      </Row>

      {/* Additional content can be added here */}
      <Divider />
      <div className="text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Restaurant Management Dashboard. All rights reserved.</p>
      </div>
    </div>
  );
}