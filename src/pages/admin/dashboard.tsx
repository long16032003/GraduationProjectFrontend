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
  Progress,
} from 'antd';
import {
  DollarOutlined,
  UserOutlined,
  ShoppingOutlined,
  RiseOutlined,
  TrophyOutlined,
  FireOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Column, Pie, Line } from '@ant-design/plots';
import { CanAccess, useList } from '@refinedev/core';
import dayjs from 'dayjs';
import type { Bill, Order, OrderDish, Dish, Customer } from '@/types';
import { NoPermission } from '@/components/NoPermission';

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

export function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('today');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topDishes, setTopDishes] = useState<TopDishData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(false);

  // Get current period info
  const currentPeriod = PERIODS.find((p) => p.value === selectedPeriod) || PERIODS[0];
  const startDate = dayjs()
    .subtract(currentPeriod.days - 1, 'day')
    .startOf('day');
  const endDate = dayjs().endOf('day');

  // Fetch bills data
  const { data: billsData, isLoading: billsLoading } = useList<Bill>({
    resource: 'bills',
    filters: [
      {
        field: 'created_at',
        operator: 'gte',
        value: startDate.format('YYYY-MM-DD 00:00:00'),
      },
      {
        field: 'created_at',
        operator: 'lte',
        value: endDate.format('YYYY-MM-DD 23:59:59'),
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
        value: startDate.format('YYYY-MM-DD 00:00:00'),
      },
      {
        field: 'created_at',
        operator: 'lte',
        value: endDate.format('YYYY-MM-DD 23:59:59'),
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

      // Debug: Log date range and raw data
      console.log('Date Range Debug:', {
        selectedPeriod,
        startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
        endDate: endDate.format('YYYY-MM-DD HH:mm:ss'),
        today: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        billsCount: bills.length,
        ordersCount: orders.length,
        billsSample: bills.slice(0, 3).map((b) => ({
          id: b.id,
          created_at: b.created_at,
          total_amount: b.total_amount,
          status: b.status,
        })),
      });

      // Process revenue data by date
      const revenueByDate: {
        [key: string]: { revenue: number; orders: number; customers: Set<number> };
      } = {};

      bills.forEach((bill) => {
        if (!bill.created_at || !bill.total_amount) return; // Skip invalid bills

        const billDate = dayjs(bill.created_at);

        // Double check if bill is within date range
        if (billDate.isBefore(startDate) || billDate.isAfter(endDate)) {
          console.log('Bill outside date range:', {
            billId: bill.id,
            billDate: billDate.format('YYYY-MM-DD HH:mm:ss'),
            startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
            endDate: endDate.format('YYYY-MM-DD HH:mm:ss'),
          });
          return;
        }

        const date = billDate.format('YYYY-MM-DD');
        if (!revenueByDate[date]) {
          revenueByDate[date] = {
            revenue: 0,
            orders: 0,
            customers: new Set(),
          };
        }

        revenueByDate[date].revenue += Number(bill.total_amount) || 0;
        revenueByDate[date].orders += 1;
        if (bill.customer_id) {
          revenueByDate[date].customers.add(bill.customer_id);
        }
      });

      const processedRevenueData: RevenueData[] = Object.entries(revenueByDate)
        .map(([date, data]) => ({
          date: dayjs(date).format('DD/MM'),
          revenue: data.revenue,
          orders: data.orders,
          customers: data.customers.size,
        }))
        .sort((a, b) => dayjs(a.date, 'DD/MM').valueOf() - dayjs(b.date, 'DD/MM').valueOf());

      setRevenueData(processedRevenueData);

      // Process top dishes
      const dishStats: { [key: string]: { quantity: number; revenue: number; name: string } } = {};

      orders.forEach((order) => {
        // Check if order is within date range
        if (order.created_at) {
          const orderDate = dayjs(order.created_at);
          if (orderDate.isBefore(startDate) || orderDate.isAfter(endDate)) {
            return; // Skip order outside date range
          }
        }

        order.order_dishes?.forEach((orderDish) => {
          if (!orderDish.dish_id || !orderDish.quantity || !orderDish.price_at_order_time) return;

          const dishId = orderDish.dish_id;
          const dishName = orderDish.dish?.name || 'Món không xác định';

          if (!dishStats[dishId]) {
            dishStats[dishId] = {
              quantity: 0,
              revenue: 0,
              name: dishName,
            };
          }

          const quantity = Number(orderDish.quantity) || 0;
          const price = Number(orderDish.price_at_order_time) || 0;

          dishStats[dishId].quantity += quantity;
          dishStats[dishId].revenue += quantity * price;
        });
      });

      const totalQuantity = Object.values(dishStats).reduce((sum, dish) => sum + dish.quantity, 0);

      const topDishesData: TopDishData[] = Object.values(dishStats)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)
        .map((dish) => ({
          dish_name: dish.name,
          quantity: dish.quantity,
          revenue: dish.revenue,
          percentage: totalQuantity > 0 ? (dish.quantity / totalQuantity) * 100 : 0,
        }));

      setTopDishes(topDishesData);

      // Debug topDishes data
      console.log('TopDishes Debug:', {
        dishStatsKeys: Object.keys(dishStats),
        topDishesData: topDishesData.slice(0, 5),
        totalQuantity,
        dishStatsValues: Object.values(dishStats).slice(0, 3)
      });

      // Process category data
      const categoryStats: { [key: string]: { revenue: number; quantity: number } } = {};

      orders.forEach((order) => {
        // Check if order is within date range for category stats
        if (order.created_at) {
          const orderDate = dayjs(order.created_at);
          if (orderDate.isBefore(startDate) || orderDate.isAfter(endDate)) {
            return; // Skip order outside date range
          }
        }

        order.order_dishes?.forEach((orderDish) => {
          if (!orderDish.quantity || !orderDish.price_at_order_time) return;

          const categoryName = orderDish.dish?.dish_categories?.name || 'Khác';

          if (!categoryStats[categoryName]) {
            categoryStats[categoryName] = {
              revenue: 0,
              quantity: 0,
            };
          }

          const quantity = Number(orderDish.quantity) || 0;
          const price = Number(orderDish.price_at_order_time) || 0;

          categoryStats[categoryName].quantity += quantity;
          categoryStats[categoryName].revenue += quantity * price;
        });
      });

      const processedCategoryData: CategoryData[] = Object.entries(categoryStats).map(
        ([category, data]) => ({
          category,
          revenue: data.revenue,
          quantity: data.quantity,
        }),
      );

      setCategoryData(processedCategoryData);

      // Debug final processed data
      console.log('Final Processed Data:', {
        processedRevenueData,
        revenueByDateKeys: Object.keys(revenueByDate),
        topDishesData: topDishesData.slice(0, 3),
        categoryStats,
        processedCategoryData,
        totalCategories: processedCategoryData.length,
      });
    } catch (error) {
      console.error('Error processing statistics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalOrders = revenueData.reduce((sum, item) => sum + (item.orders || 0), 0);
  const totalCustomers = revenueData.reduce((sum, item) => sum + (item.customers || 0), 0);
  const avgOrderValue =
    totalOrders > 0 && totalRevenue > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Debug logging
  console.log('Dashboard Stats:', {
    totalRevenue,
    totalOrders,
    totalCustomers,
    avgOrderValue,
    revenueDataLength: revenueData.length,
    period: currentPeriod.label,
  });

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

  // Calculate total dishes quantity for percentage
  const totalDishesQuantity = topDishes.reduce((sum, item) => sum + item.quantity, 0);

  const dishPieChartConfig = {
    data: topDishes.slice(0, 5).map((item) => ({
      ...item,
      dish_name: item.dish_name || 'Không xác định',
      percentage:
        totalDishesQuantity > 0 ? ((item.quantity / totalDishesQuantity) * 100).toFixed(1) : '0',
    })),
    angleField: 'quantity',
    colorField: 'dish_name',
    radius: 0.8,
    innerRadius: 0.4,
    label: false,
    statistic: {
      title: {
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
        },
        content: 'Tổng số món',
      },
      content: {
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#1890ff',
        },
        content: `${new Intl.NumberFormat('vi-VN').format(totalDishesQuantity)}`,
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
      {
        type: 'pie-statistic-active',
      },
    ],
    legend: {
      position: 'bottom',
      itemName: {
        style: {
          fontSize: 12,
        },
      },
    },
  };

  const billChartConfig = {
    data: revenueData,
    xField: 'date',
    yField: 'orders',
    color: '#52c41a',
    columnWidthRatio: 0.6,
    meta: {
      orders: {
        alias: 'Số hóa đơn',
      },
      date: {
        alias: 'Ngày',
      },
    },
    label: {
      position: 'middle',
      style: {
        fill: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
      },
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
        <div className='flex items-center'>
          {index < 3 && (
            <TrophyOutlined
              style={{
                color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                marginRight: 8,
              }}
            />
          )}
          <span className='font-medium'>{index + 1}</span>
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
        <Tag
          color='blue'
          className='px-3 py-1'
        >
          {quantity} món
        </Tag>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => (
        <Text
          strong
          style={{ color: '#52c41a' }}
        >
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
          size='small'
          strokeColor='#1890ff'
          showInfo={true}
        />
      ),
    },
  ];

  const isLoading = billsLoading || ordersLoading || loading;

  return (
    <CanAccess
      resource='statistic'
      action='browse'
      fallback={<NoPermission />}
    >
      <div className='p-6 bg-gray-50 min-h-screen'>
        <div className='flex justify-between items-center mb-6'>
          <Title
            level={2}
            className='!mb-0'
          >
            <FireOutlined className='mr-2' />
            Thống kê tổng quan nhà hàng
          </Title>
          <Select
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            style={{ width: 200 }}
            size='large'
          >
            {PERIODS.map((period) => (
              <Option
                key={period.value}
                value={period.value}
              >
                {period.label}
              </Option>
            ))}
          </Select>
        </div>

        {isLoading ? (
          <div className='flex justify-center items-center h-64'>
            <Spin size='large' />
          </div>
        ) : (
          <>
            {/* Summary Statistics */}
            <Row
              gutter={[16, 16]}
              className='mb-6'
            >
              <Col
                xs={24}
                sm={12}
                md={6}
              >
                <Card className='shadow-sm h-full'>
                  <Statistic
                    title='Tổng doanh thu'
                    value={totalRevenue}
                    prefix={<DollarOutlined />}
                    suffix='đ'
                    valueStyle={{ color: '#3f8600' }}
                    formatter={(value) => new Intl.NumberFormat('vi-VN').format(value as number)}
                  />
                  <Text type='secondary'>{currentPeriod.label}</Text>
                </Card>
              </Col>
              <Col
                xs={24}
                sm={12}
                md={6}
              >
                <Card className='shadow-sm h-full'>
                  <Statistic
                    title='Tổng đơn hàng'
                    value={totalOrders}
                    prefix={<ShoppingOutlined />}
                    valueStyle={{ color: '#1677ff' }}
                  />
                  <Text type='secondary'>{currentPeriod.label}</Text>
                </Card>
              </Col>
              <Col
                xs={24}
                sm={12}
                md={6}
              >
                <Card className='shadow-sm h-full'>
                  <Statistic
                    title='Khách hàng'
                    value={totalCustomers}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                  <Text type='secondary'>{currentPeriod.label}</Text>
                </Card>
              </Col>
              <Col
                xs={24}
                sm={12}
                md={6}
              >
                <Card className='shadow-sm h-full'>
                  <Statistic
                    title='Giá trị đơn TB'
                    value={avgOrderValue}
                    prefix={<RiseOutlined />}
                    suffix='đ'
                    valueStyle={{ color: '#fa8c16' }}
                    formatter={(value) => new Intl.NumberFormat('vi-VN').format(value as number)}
                  />
                  <Text type='secondary'>{currentPeriod.label}</Text>
                </Card>
              </Col>
            </Row>

            {/* Charts Row */}
            <Row
              gutter={[16, 16]}
              className='mb-6'
            >
              <Col
                xs={24}
                lg={16}
              >
                <Card
                  title='Biểu đồ doanh thu theo thời gian'
                  className='shadow-sm'
                >
                  {revenueData.length > 0 ? (
                    <Line
                      {...revenueChartConfig}
                      height={350}
                    />
                  ) : (
                    <Alert
                      message='Chưa có dữ liệu doanh thu trong khoảng thời gian này'
                      type='info'
                    />
                  )}
                </Card>
              </Col>
              <Col
                xs={24}
                lg={8}
              >
                <Card
                  title='Hóa đơn thanh toán thành công'
                  className='shadow-sm'
                >
                  {revenueData.length > 0 ? (
                    <Column
                      {...billChartConfig}
                      height={350}
                    />
                  ) : (
                    <Alert
                      message='Chưa có dữ liệu hóa đơn'
                      type='info'
                    />
                  )}
                </Card>
              </Col>
            </Row>
            {/* Top Dishes Table */}
            <Row gutter={[16, 16]}>
              <Col
                xs={24}
                lg={16}
              >
                <Card
                  title='Top món ăn được gọi nhiều nhất'
                  className='shadow-sm'
                >
                  {topDishes.length > 0 ? (
                    <Table
                      columns={topDishColumns}
                      dataSource={topDishes}
                      rowKey='dish_name'
                      pagination={{ pageSize: 10 }}
                      bordered
                    />
                  ) : (
                    <Alert
                      message='Chưa có dữ liệu món ăn trong khoảng thời gian này'
                      type='info'
                    />
                  )}
                </Card>
              </Col>
              <Col
                xs={24}
                lg={8}
              >
                <Card
                  title='Top món ăn được gọi nhiều nhất'
                  className='shadow-sm'
                >
                  {topDishes.length > 0 && topDishes.some(dish => dish.dish_name && dish.quantity > 0) ? (
                    <>
                      <Pie
                        {...dishPieChartConfig}
                        height={300}
                      />
                      <div className='mt-4'>
                        <Title level={5}>Chi tiết theo món ăn:</Title>
                        {topDishes
                          .slice(0, 5)
                          .sort((a, b) => b.quantity - a.quantity)
                          .map((item, index) => {
                            const percentage =
                              totalDishesQuantity > 0
                                ? ((item.quantity / totalDishesQuantity) * 100).toFixed(1)
                                : 0;
                            return (
                              <div
                                key={item.dish_name}
                                className='flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0'
                              >
                                <div className='flex items-center'>
                                  <div
                                    className='w-3 h-3 rounded-full mr-3'
                                    style={{
                                      backgroundColor: [
                                        '#1890ff',
                                        '#52c41a',
                                        '#faad14',
                                        '#f5222d',
                                        '#722ed1',
                                      ][index % 5],
                                    }}
                                  />
                                  <Text strong>{item.dish_name}</Text>
                                </div>
                                <div className='text-right'>
                                  <div>
                                    <Text
                                      strong
                                      style={{ color: '#1890ff' }}
                                    >
                                      {item.quantity} món
                                    </Text>
                                  </div>
                                  <Text
                                    type='secondary'
                                    className='text-sm'
                                  >
                                    {percentage}% • {new Intl.NumberFormat('vi-VN').format(item.revenue)}đ
                                  </Text>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </>
                  ) : (
                    <Alert
                      message='Chưa có dữ liệu món ăn'
                      description={`Không tìm thấy dữ liệu món ăn trong khoảng thời gian ${currentPeriod.label.toLowerCase()}. Hãy thử chọn khoảng thời gian khác.`}
                      type='info'
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </CanAccess>
  );
}
