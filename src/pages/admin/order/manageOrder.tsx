import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Badge, Button, Space, Typography, Tag, Input, Modal, Table, message, Divider, Timeline } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, PlusOutlined, ClockCircleOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useMediaQuery } from 'react-responsive';
import dayjs from 'dayjs';
import { type TableModel, type Bill, type Order, type OrderDish, type Dish } from '@/types';

const { Title, Text } = Typography;
const { Search } = Input;

// Fake data for tables
const generateFakeTables = (): TableModel[] => {
  const areas: TableModel['area'][] = ['1st floor', '2nd floor', '3rd floor', 'rooftop'];
  const statuses: TableModel['status'][] = ['available', 'occupied', 'reserved', 'maintenance'];
  
  const tables: TableModel[] = [];
  
  for (let i = 1; i <= 20; i++) {
    tables.push({
      id: i,
      creator_id: 1,
      name: `Bàn ${i}`,
      capacity: Math.floor(Math.random() * 6) + 2,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      area: areas[Math.floor(Math.random() * areas.length)],
      created_at: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format(),
      updated_at: dayjs().subtract(Math.floor(Math.random() * 7), 'day').format(),
    });
  }
  
  return tables;
};

// Fake data for dishes
const generateFakeDishes = (): Dish[] => {
  return [
    { id: 1, creator_id: 1, name: 'Phở bò tái', description: 'Phở bò tái truyền thống', image_id: null, price: 65000, category_id: 1, is_active: true, created_at: '', updated_at: '' },
    { id: 2, creator_id: 1, name: 'Bún chả', description: 'Bún chả Hà Nội', image_id: null, price: 55000, category_id: 1, is_active: true, created_at: '', updated_at: '' },
    { id: 3, creator_id: 1, name: 'Cơm tấm sườn', description: 'Cơm tấm sườn nướng', image_id: null, price: 45000, category_id: 2, is_active: true, created_at: '', updated_at: '' },
    { id: 4, creator_id: 1, name: 'Bánh mì thịt nướng', description: 'Bánh mì thịt nướng đặc biệt', image_id: null, price: 25000, category_id: 3, is_active: true, created_at: '', updated_at: '' },
    { id: 5, creator_id: 1, name: 'Gỏi cuốn tôm thịt', description: 'Gỏi cuốn tôm thịt tươi', image_id: null, price: 35000, category_id: 4, is_active: true, created_at: '', updated_at: '' },
    { id: 6, creator_id: 1, name: 'Chả cá Lã Vọng', description: 'Chả cá Lã Vọng truyền thống', image_id: null, price: 85000, category_id: 1, is_active: true, created_at: '', updated_at: '' },
    { id: 7, creator_id: 1, name: 'Bún bò Huế', description: 'Bún bò Huế cay nồng', image_id: null, price: 60000, category_id: 1, is_active: true, created_at: '', updated_at: '' },
    { id: 8, creator_id: 1, name: 'Cao lầu', description: 'Cao lầu Hội An', image_id: null, price: 50000, category_id: 1, is_active: true, created_at: '', updated_at: '' },
    { id: 9, creator_id: 1, name: 'Nước cam tươi', description: 'Nước cam tươi vắt', image_id: null, price: 20000, category_id: 5, is_active: true, created_at: '', updated_at: '' },
    { id: 10, creator_id: 1, name: 'Trà đá', description: 'Trà đá truyền thống', image_id: null, price: 5000, category_id: 5, is_active: true, created_at: '', updated_at: '' },
  ];
};

// Fake data for bills with orders
const generateFakeBillsWithOrders = (): Record<number, Bill> => {
  const bills: Record<number, Bill> = {};
  const dishes = generateFakeDishes();
  
  // Tạo hóa đơn cho các bàn đã có khách
  const occupiedTables = [2, 5, 8, 12, 15, 18];
  
  occupiedTables.forEach(tableId => {
    const ordersCount = Math.floor(Math.random() * 3) + 1; // 1-3 đơn gọi món
    const orders: Order[] = [];
    let totalAmount = 0;
    
    for (let i = 0; i < ordersCount; i++) {
      const orderDishes: OrderDish[] = [];
      const dishCount = Math.floor(Math.random() * 4) + 1; // 1-4 món mỗi đơn
      
      for (let j = 0; j < dishCount; j++) {
        const dish = dishes[Math.floor(Math.random() * dishes.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        
        orderDishes.push({
          dish_id: dish.id,
          order_id: 1000 + tableId * 10 + i,
          quantity: quantity,
          price_at_order_time: dish.price,
          dish: dish
        });
        
        totalAmount += quantity * dish.price;
      }
      
      orders.push({
        id: 1000 + tableId * 10 + i,
        bill_id: 1000 + tableId,
        creator_id: 1,
        order_time: dayjs().subtract(Math.floor(Math.random() * 120), 'minute').format(),
        note: Math.random() > 0.7 ? 'Ghi chú đặc biệt' : undefined,
        status: ['pending', 'preparing', 'ready', 'served'][Math.floor(Math.random() * 4)] as Order['status'],
        order_dishes: orderDishes
      });
    }
    
    bills[tableId] = {
      id: 1000 + tableId,
      creator_id: 1,
      customer_id: tableId,
      customer_name: `Khách bàn ${tableId}`,
      customer_phone: `090${Math.floor(1000000 + Math.random() * 9000000)}`,
      table_id: tableId,
      table_number: tableId,
      total_amount: totalAmount,
      created_at: dayjs().subtract(Math.floor(Math.random() * 3), 'hour').format(),
      payment_method: null,
      status: 'unpaid' as const,
      orders: orders
    };
  });
  
  return bills;
};

const ManageOrder: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<TableModel | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  // Mock data
  const tables = useMemo(() => generateFakeTables(), []);
  const billsWithOrders = useMemo(() => generateFakeBillsWithOrders(), []);

  // Filter tables
  const filteredTables = useMemo(() => {
    let filtered = tables;
    
    if (selectedArea !== 'all') {
      filtered = filtered.filter(table => table.area === selectedArea);
    }
    
    if (searchText) {
      filtered = filtered.filter(table => 
        table.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return filtered;
  }, [tables, selectedArea, searchText]);

  const handleTableClick = (table: TableModel) => {
    setSelectedTable(table);
    const bill = billsWithOrders[table.id];
    
    if (bill) {
      // Bàn đã có hóa đơn - hiển thị chi tiết
      setSelectedBill(bill);
      setIsDetailModalVisible(true);
    } else {
      // Bàn chưa có hóa đơn - tạo hóa đơn mới và gọi món
      navigate(`/admin/order/table/${table.id}/new-bill`);
    }
  };

  const handleAddOrder = (billId: number) => {
    navigate(`/admin/order/bill/${billId}/add-order`);
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setSelectedTable(null);
    setSelectedBill(null);
  };

  const getTableStatusColor = (status: TableModel['status']) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'error';
      case 'reserved':
        return 'warning';
      case 'maintenance':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTableStatusText = (status: TableModel['status']) => {
    switch (status) {
      case 'available':
        return 'Trống';
      case 'occupied':
        return 'Có khách';
      case 'reserved':
        return 'Đã đặt';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  const getStatusColor = (status: TableModel['status']) => {
    switch (status) {
      case 'available':
        return '#52c41a';
      case 'occupied':
        return '#faad14';
      case 'reserved':
        return '#1890ff';
      case 'maintenance':
        return '#d9d9d9';
      default:
        return '#d9d9d9';
    }
  };

  const getOrderStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'preparing':
        return 'blue';
      case 'ready':
        return 'green';
      case 'served':
        return 'default';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getOrderStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'preparing':
        return 'Đang chuẩn bị';
      case 'ready':
        return 'Sẵn sàng';
      case 'served':
        return 'Đã phục vụ';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <Title level={3} style={{ fontSize: isMobile ? '18px' : '24px' }}>
            Quản lý đơn hàng
          </Title>
          
          <div className="mb-4">
            <div className="mb-3">
              <Search
                placeholder="Tìm kiếm bàn..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: isMobile ? '100%' : 300 }}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                type={selectedArea === 'all' ? 'primary' : 'default'}
                onClick={() => setSelectedArea('all')}
                size={isMobile ? 'small' : 'middle'}
              >
                Tất cả
              </Button>
              <Button 
                type={selectedArea === '1st floor' ? 'primary' : 'default'}
                onClick={() => setSelectedArea('1st floor')}
                size={isMobile ? 'small' : 'middle'}
              >
                Tầng 1
              </Button>
              <Button 
                type={selectedArea === '2nd floor' ? 'primary' : 'default'}
                onClick={() => setSelectedArea('2nd floor')}
                size={isMobile ? 'small' : 'middle'}
              >
                Tầng 2
              </Button>
              <Button 
                type={selectedArea === '3rd floor' ? 'primary' : 'default'}
                onClick={() => setSelectedArea('3rd floor')}
                size={isMobile ? 'small' : 'middle'}
              >
                Tầng 3
              </Button>
              <Button 
                type={selectedArea === 'rooftop' ? 'primary' : 'default'}
                onClick={() => setSelectedArea('rooftop')}
                size={isMobile ? 'small' : 'middle'}
              >
                Sân thượng
              </Button>
            </div>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          {filteredTables.map(table => {
            const bill = billsWithOrders[table.id];
            const hasOrders = bill && bill.orders && bill.orders.length > 0;
            const pendingOrders = bill?.orders?.filter(order => order.status === 'pending').length || 0;
            
            return (
              <Col xs={12} sm={8} md={6} lg={4} xl={4} key={table.id}>
                <Badge.Ribbon 
                  text={getTableStatusText(table.status)} 
                  color={getTableStatusColor(table.status)}
                >
                  <Card
                    hoverable
                    className="text-center cursor-pointer transition-all duration-300 hover:shadow-lg"
                    onClick={() => handleTableClick(table)}
                    bodyStyle={{ 
                      padding: isMobile ? '16px' : '20px',
                      background: hasOrders ? 'linear-gradient(135deg, #fff7e6 0%, #fff2d9 100%)' : '#ffffff'
                    }}
                    style={{
                      borderRadius: '12px',
                      border: hasOrders ? '2px solid #faad14' : '1px solid #d9d9d9',
                      boxShadow: hasOrders ? '0 4px 12px rgba(250, 173, 20, 0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Status indicator */}
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: getStatusColor(table.status),
                      }}
                    />
                    
                    {/* Table header */}
                    <div className="mb-3">
                      <div className="flex items-center justify-center mb-2">
                        <div 
                          className="flex items-center justify-center"
                          style={{
                            width: isMobile ? '40px' : '48px',
                            height: isMobile ? '40px' : '48px',
                            borderRadius: '50%',
                            background: hasOrders ? '#faad14' : '#1890ff',
                            color: 'white',
                            fontSize: isMobile ? '16px' : '20px',
                            fontWeight: 'bold',
                            marginBottom: '8px'
                          }}
                        >
                          {table.id}
                        </div>
                      </div>
                      <Title 
                        level={4} 
                        className="mb-1" 
                        style={{ 
                          fontSize: isMobile ? '16px' : '18px',
                          margin: 0,
                          color: hasOrders ? '#d46b08' : '#262626'
                        }}
                      >
                        {table.name}
                      </Title>
                      <Text 
                        type="secondary" 
                        style={{ 
                          fontSize: isMobile ? '12px' : '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <UserOutlined style={{ fontSize: '12px' }} />
                        {table.capacity} người
                      </Text>
                    </div>
                    
                    {/* Area tag */}
                    <div className="mb-3">
                      <Tag 
                        color="blue" 
                        style={{ 
                          fontSize: isMobile ? '11px' : '12px',
                          borderRadius: '12px',
                          padding: '2px 8px'
                        }}
                      >
                        {table.area}
                      </Tag>
                    </div>
                    
                    {/* Order info */}
                    {hasOrders && (
                      <div className="mb-3 p-2 rounded-lg" style={{ background: 'rgba(250, 173, 20, 0.1)' }}>
                        <div className="flex justify-center gap-2 mb-2">
                          <Tag 
                            color="orange" 
                            style={{ 
                              fontSize: isMobile ? '10px' : '11px',
                              borderRadius: '8px',
                              margin: 0
                            }}
                          >
                            <EyeOutlined /> {bill.orders?.length} đơn
                          </Tag>
                          {pendingOrders > 0 && (
                            <Tag 
                              color="red" 
                              style={{ 
                                fontSize: isMobile ? '10px' : '11px',
                                borderRadius: '8px',
                                margin: 0
                              }}
                            >
                              <ClockCircleOutlined /> {pendingOrders} chờ
                            </Tag>
                          )}
                        </div>
                        <div 
                          style={{ 
                            fontSize: isMobile ? '12px' : '13px',
                            fontWeight: '600',
                            color: '#d46b08'
                          }}
                        >
                          💰 {bill.total_amount.toLocaleString('vi-VN')} VNĐ
                        </div>
                      </div>
                    )}
                    
                    {/* Action button */}
                    <Button
                      type={hasOrders ? "default" : "primary"}
                      icon={<ShoppingCartOutlined />}
                      size={isMobile ? 'small' : 'middle'}
                      disabled={table.status === 'maintenance'}
                      style={{ 
                        fontSize: isMobile ? '11px' : '12px',
                        borderRadius: '8px',
                        fontWeight: '500',
                        width: '100%',
                        background: hasOrders ? '#fff' : undefined,
                        borderColor: hasOrders ? '#faad14' : undefined,
                        color: hasOrders ? '#faad14' : undefined
                      }}
                    >
                      {hasOrders ? 'Gọi món thêm' : 'Bắt đầu gọi món'}
                    </Button>
                  </Card>
                </Badge.Ribbon>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* Bill Detail Modal */}
      <Modal
        title={`Chi tiết hóa đơn - ${selectedTable?.name}`}
        open={isDetailModalVisible}
        onCancel={handleCloseModal}
        width={isMobile ? '95vw' : 1000}
        style={isMobile ? { top: 20 } : {}}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>,
          <Button
            key="add-order"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => selectedBill && handleAddOrder(selectedBill.id)}
          >
            Gọi món thêm
          </Button>,
        ]}
      >
        {selectedBill && (
          <div>
            {/* Bill Info */}
            <Card size="small" className="mb-4">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Text strong>Khách hàng:</Text> {selectedBill.customer_name}
                  <br />
                  <Text strong>Số điện thoại:</Text> {selectedBill.customer_phone}
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Thời gian vào:</Text> {dayjs(selectedBill.created_at).format('HH:mm DD/MM/YYYY')}
                  <br />
                  <Text strong>Tổng tiền hiện tại:</Text> 
                  <Text strong style={{ color: '#f5222d', marginLeft: 8 }}>
                    {selectedBill.total_amount.toLocaleString('vi-VN')} VNĐ
                  </Text>
                </Col>
              </Row>
            </Card>

            {/* Orders Timeline */}
            <Title level={4} style={{ fontSize: isMobile ? '16px' : '20px' }}>
              Lịch sử gọi món
            </Title>
            <Timeline>
              {selectedBill.orders?.map((order, index) => (
                <Timeline.Item
                  key={order.id}
                  color={getOrderStatusColor(order.status)}
                  dot={order.status === 'served' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                >
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <Text strong>Đơn #{order.id}</Text>
                      <Tag color={getOrderStatusColor(order.status)}>
                        {getOrderStatusText(order.status)}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                        {dayjs(order.order_time).format('HH:mm DD/MM/YYYY')}
                      </Text>
                    </div>
                  </div>
                  
                  {order.note && (
                    <div className="mb-2">
                      <Text italic>Ghi chú: {order.note}</Text>
                    </div>
                  )}
                  
                  <Table
                    size="small"
                    pagination={false}
                    dataSource={order.order_dishes}
                    rowKey={(record) => `${record.order_id}_${record.dish_id}`}
                    scroll={isMobile ? { x: 400 } : undefined}
                    columns={[
                      {
                        title: 'Món ăn',
                        dataIndex: ['dish', 'name'],
                        key: 'dish_name',
                        width: isMobile ? 120 : undefined,
                      },
                      {
                        title: 'SL',
                        dataIndex: 'quantity',
                        key: 'quantity',
                        width: isMobile ? 40 : '15%',
                      },
                      {
                        title: 'Đơn giá',
                        dataIndex: 'price_at_order_time',
                        key: 'price',
                        width: isMobile ? 80 : '20%',
                        render: (price: number) => isMobile 
                          ? `${(price / 1000).toFixed(0)}k`
                          : `${price.toLocaleString('vi-VN')} VNĐ`,
                      },
                      {
                        title: 'Thành tiền',
                        key: 'total',
                        width: isMobile ? 80 : '20%',
                        render: (_: unknown, record: OrderDish) => {
                          const total = record.quantity * record.price_at_order_time;
                          return isMobile 
                            ? `${(total / 1000).toFixed(0)}k`
                            : `${total.toLocaleString('vi-VN')} VNĐ`;
                        },
                      },
                    ]}
                    summary={(pageData) => {
                      const total = pageData.reduce(
                        (sum, item) => sum + (item.quantity * item.price_at_order_time),
                        0,
                      );
                      return (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={3}>
                            <strong>Tổng đơn này</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1}>
                            <strong>
                              {isMobile 
                                ? `${(total / 1000).toFixed(0)}k`
                                : `${total.toLocaleString('vi-VN')} VNĐ`
                              }
                            </strong>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      );
                    }}
                  />
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageOrder;