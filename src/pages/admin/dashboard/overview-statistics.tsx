import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Select, 
  Table, 
  Tag, 
  Spin,
  Alert,
  Progress
} from 'antd';
import {
  DollarOutlined,
  UserOutlined,
  ShoppingOutlined,
  RiseOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FireOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Column, Pie, Line } from '@ant-design/plots';
import { useList } from '@refinedev/core';
import dayjs from 'dayjs';
import type { Bill, Order, OrderDish, Dish, Customer } from '@/types';

const { Title, Text } = Typography;
const { Option } = Select;

interface StatisticPeriod {
  label: string;
  value: string;
  days: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface TopDishData {
  dish_name: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

interface CategoryData {
  category: string;
  revenue: number;
  quantity: number;
}

const PERIODS: StatisticPeriod[] = [
  { label: 'Hôm nay', value: 'today', days: 1 },
  { label: '7 ngày qua', value: '7days', days: 7 },
  { label: '1 tháng qua', value: '30days', days: 30 },
  { label: '1 năm qua', value: '365days', days: 365 },
];

const OverviewStatistics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('today');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topDishes, setTopDishes] = useState<TopDishData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(false);

  // Get current period info
  const currentPeriod = PERIODS.find(p => p.value === selectedPeriod) || PERIODS[0];
  const startDate = dayjs().subtract(currentPeriod.days - 1, 'day').startOf('day');
  const endDate = dayjs().endOf('day');

  // Fetch bills data
  const { data: billsData, isLoading: billsLoading } = useList<Bill>({
    resource: 'bills',
    filters: [
      {
        field: 'created_at',
        operator: 'gte',
        value: startDate.format('YYYY-MM-DD'),
      },
      {
        field: 'created_at',
        operator: 'lte',
        value: endDate.format('YYYY-MM-DD'),
      },
      {
        field: 'status',
        operator: 'eq',
        value: 'paid',
      },
    ],
    pagination: {
      mode: 'off',
    },
    meta: {
      populate: ['customer', 'orders.order_dishes.dish.dish_categories', 'table'],
    },
  });

  // Fetch orders data  
  const { data: ordersData, isLoading: ordersLoading } = useList<Order>({
    resource: 'orders',
    filters: [
      {
        field: 'created_at',
        operator: 'gte',
        value: startDate.format('YYYY-MM-DD'),
      },
      {
        field: 'created_at',
        operator: 'lte',
        value: endDate.format('YYYY-MM-DD'),
      },
    ],
    pagination: {
      mode: 'off',
    },
    meta: {
      populate: ['order_dishes.dish.dish_categories', 'bill'],
    },
  });

  // Process data when fetched
  useEffect(() => {
    if (billsData?.data && ordersData?.data) {
      processStatisticsData();
    }
  }, [billsData, ordersData, selectedPeriod]);

  const processStatisticsData = () => {
    setLoading(true);
    
    try {
      const bills = billsData?.data || [];
      const orders = ordersData?.data || [];
      
      // Process revenue data by date
      const revenueByDate: { [key: string]: { revenue: number; orders: number; customers: Set<number> } } = {};
      
      bills.forEach(bill => {
        const date = dayjs(bill.created_at).format('YYYY-MM-DD');
        if (!revenueByDate[date]) {
          revenueByDate[date] = {
            revenue: 0,
            orders: 0,
            customers: new Set()
          };
        }
        
        revenueByDate[date].revenue += bill.total_amount;
        revenueByDate[date].orders += 1;
        if (bill.customer_id) {
          revenueByDate[date].customers.add(bill.customer_id);
        }
      });

      const processedRevenueData: RevenueData[] = Object.entries(revenueByDate).map(([date, data]) => ({
        date: dayjs(date).format('DD/MM'),
        revenue: data.revenue,
        orders: data.orders,
        customers: data.customers.size,
      })).sort((a, b) => dayjs(a.date, 'DD/MM').valueOf() - dayjs(b.date, 'DD/MM').valueOf());

      setRevenueData(processedRevenueData);

      // Process top dishes
      const dishStats: { [key: string]: { quantity: number; revenue: number; name: string } } = {};
      
      orders.forEach(order => {
        order.order_dishes?.forEach(orderDish => {
          const dishId = orderDish.dish_id;
          const dishName = orderDish.dish?.name || 'Món không xác định';
          
          if (!dishStats[dishId]) {
            dishStats[dishId] = {
              quantity: 0,
              revenue: 0,
              name: dishName
            };
          }
          
          dishStats[dishId].quantity += orderDish.quantity;
          dishStats[dishId].revenue += orderDish.quantity * orderDish.price_at_order_time;
        });
      });

      const totalQuantity = Object.values(dishStats).reduce((sum, dish) => sum + dish.quantity, 0);
      
      const topDishesData: TopDishData[] = Object.values(dishStats)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)
        .map(dish => ({
          dish_name: dish.name,
          quantity: dish.quantity,
          revenue: dish.revenue,
          percentage: totalQuantity > 0 ? (dish.quantity / totalQuantity) * 100 : 0,
        }));

      setTopDishes(topDishesData);

      // Process category data
      const categoryStats: { [key: string]: { revenue: number; quantity: number } } = {};
      
      orders.forEach(order => {
        order.order_dishes?.forEach(orderDish => {
          const categoryName = orderDish.dish?.dish_categories?.name || 'Khác';
          
          if (!categoryStats[categoryName]) {
            categoryStats[categoryName] = {
              revenue: 0,
              quantity: 0
            };
          }
          
          categoryStats[categoryName].quantity += orderDish.quantity;
          categoryStats[categoryName].revenue += orderDish.quantity * orderDish.price_at_order_time;
        });
      });

      const processedCategoryData: CategoryData[] = Object.entries(categoryStats).map(([category, data]) => ({
        category,
        revenue: data.revenue,
        quantity: data.quantity,
      }));

      setCategoryData(processedCategoryData);
      
    } catch (error) {
      console.error('Error processing statistics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = revenueData.reduce((sum, item) => sum + item.orders, 0);
  const totalCustomers = revenueData.reduce((sum, item) => sum + item.customers, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Chart configurations
  const revenueChartConfig = {
    data: revenueData,
    xField: 'date',
    yField: 'revenue',
    color: '#1890ff',
    smooth: true,
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  const categoryChartConfig = {
    data: categoryData,
    angleField: 'revenue',
    colorField: 'category',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const dishChartConfig = {
    data: topDishes.slice(0, 5),
    xField: 'quantity',
    yField: 'dish_name',
    seriesField: 'dish_name',
    color: '#52c41a',
    label: {
      position: 'middle',
    },
  };

  // Top dishes table columns
  const topDishColumns = [
    {
      title: 'Thứ hạng',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_: unknown, __: unknown, index: number) => (
        <div className="flex items-center">
          {index < 3 && <TrophyOutlined style={{ color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32', marginRight: 8 }} />}
          <span className="font-medium">{index + 1}</span>
        </div>
      ),
    },
    {
      title: 'Tên món',
      dataIndex: 'dish_name',
      key: 'dish_name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => (
        <Tag color="blue" className="px-3 py-1">
          {quantity} món
        </Tag>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {new Intl.NumberFormat('vi-VN').format(revenue)}đ
        </Text>
      ),
    },
    {
      title: 'Tỷ lệ',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => (
        <Progress 
          percent={Math.round(percentage)} 
          size="small" 
          strokeColor="#1890ff"
          showInfo={true}
        />
      ),
    },
  ];

  const isLoading = billsLoading || ordersLoading || loading;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="!mb-0">
          <FireOutlined className="mr-2" />
          Thống kê tổng quan
        </Title>
        <Select
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          style={{ width: 200 }}
          size="large"
        >
          {PERIODS.map(period => (
            <Option key={period.value} value={period.value}>
              {period.label}
            </Option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Summary Statistics */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm h-full">
                <Statistic
                  title="Tổng doanh thu"
                  value={totalRevenue}
                  prefix={<DollarOutlined />}
                  suffix="đ"
                  valueStyle={{ color: '#3f8600' }}
                  formatter={(value) => new Intl.NumberFormat('vi-VN').format(value as number)}
                />
                <Text type="secondary">{currentPeriod.label}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm h-full">
                <Statistic
                  title="Tổng đơn hàng"
                  value={totalOrders}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#1677ff' }}
                />
                <Text type="secondary">{currentPeriod.label}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm h-full">
                <Statistic
                  title="Khách hàng"
                  value={totalCustomers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
                <Text type="secondary">{currentPeriod.label}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm h-full">
                <Statistic
                  title="Giá trị đơn TB"
                  value={avgOrderValue}
                  prefix={<RiseOutlined />}
                  suffix="đ"
                  valueStyle={{ color: '#fa8c16' }}
                  formatter={(value) => new Intl.NumberFormat('vi-VN').format(value as number)}
                />
                <Text type="secondary">{currentPeriod.label}</Text>
              </Card>
            </Col>
          </Row>

          {/* Charts Row */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} lg={16}>
              <Card title="Biểu đồ doanh thu theo thời gian" className="shadow-sm">
                {revenueData.length > 0 ? (
                  <Line {...revenueChartConfig} height={350} />
                ) : (
                  <Alert message="Chưa có dữ liệu doanh thu trong khoảng thời gian này" type="info" />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Doanh thu theo danh mục" className="shadow-sm">
                {categoryData.length > 0 ? (
                  <Pie {...categoryChartConfig} height={350} />
                ) : (
                  <Alert message="Chưa có dữ liệu danh mục" type="info" />
                )}
              </Card>
            </Col>
          </Row>

          {/* Top Dishes Table */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Top món ăn được gọi nhiều nhất" className="shadow-sm">
                {topDishes.length > 0 ? (
                  <Table
                    columns={topDishColumns}
                    dataSource={topDishes}
                    rowKey="dish_name"
                    pagination={{ pageSize: 10 }}
                    bordered
                  />
                ) : (
                  <Alert message="Chưa có dữ liệu món ăn trong khoảng thời gian này" type="info" />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Top 5 món bán chạy" className="shadow-sm">
                {topDishes.length > 0 ? (
                  <Column {...dishChartConfig} height={350} />
                ) : (
                  <Alert message="Chưa có dữ liệu" type="info" />
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default OverviewStatistics; 