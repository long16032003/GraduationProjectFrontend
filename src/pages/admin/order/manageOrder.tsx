import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Badge, Button, Space, Typography, Tag, Input, Modal, Table, message, Divider, Timeline } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, PlusOutlined, ClockCircleOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useMediaQuery } from 'react-responsive';
import dayjs from 'dayjs';
import { type TableModel, type Bill, type Order, type OrderDish, type Dish, type DishCategory } from '@/types';
import { useList } from '@refinedev/core';
import { caculateTotalAmount } from '@/utils/caculateTotalAmountBill';
import { areas } from '@/utils/constant';

const { Title, Text } = Typography;
const { Search } = Input;

const ManageOrder: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<TableModel | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  //API call
  const { data: listDishCategories, isLoading: isLoadingListDishCategories } = useList<DishCategory>({
    resource: 'dish-categories',
  });

  const { data: listDishes, isLoading: isLoadingListDishes } = useList<Dish>({
    resource: 'dishes',
    filters: [
      {
        field: 'is_active',
        operator: 'eq',
        value: 1,
      },
    ],
  });

  const { data: listTables, isLoading: isLoadingListTables } = useList<TableModel>({
    resource: 'tables',
  });

  const { data: listBills, isLoading: isLoadingListBills } = useList<Bill>({
    resource: 'bills',
  });

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const tables = listTables?.data;
  const billsWithOrders = listBills?.data;

  // Filter tables
  const filteredTables = useMemo(() => {
    let filtered = tables;
    
    if (selectedArea !== 'all') {
      filtered = filtered?.filter(table => table.area === selectedArea);
    }
    
    if (searchText) {
      filtered = filtered?.filter(table => 
        table.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return filtered;
  }, [tables, selectedArea, searchText]);

  const handleTableClick = (table: TableModel) => {
    setSelectedTable(table);
    const bill = billsWithOrders?.find(bill => bill.table_id === table.id && bill.status === 'unpaid');
    
    if (bill) {
      // Bàn đã có hóa đơn - hiển thị chi tiết
      setSelectedBill(bill);
      setIsDetailModalVisible(true);
    } else {
      if(table.status === 'occupied') {
        // Bàn chưa có hóa đơn - tạo hóa đơn mới và gọi món
        navigate(`/admin/order/table/${table.id}/new-bill`);
      }
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

  const getTableStatusText = (status: TableModel['status'], bill: Bill) => {
    // Có khách và hóa đơn chưa thanh toán
    if(status === 'occupied' && bill && bill.status === 'unpaid') {
      return 'Có khách';
    }
    // Có khách và không có hóa đơn chưa thanh toán
    else if(status === 'occupied' && !bill) {
      return 'Trống';
    }
    // Bảo trì
    else if(status === 'maintenance') {
      return 'Bảo trì';
    }
    return status;
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
      case 'init':
        return 'orange';
      case 'processing':
        return 'blue';
      case 'finished process':
        return 'green';
      case 'not completed':
        return 'default';
      case 'done':
        return 'red';
      default:
        return 'default';
    }
  };

  const getOrderStatusText = (status: Order['status']) => {
    switch (status) {
      case 'init':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang chuẩn bị';
      case 'finished process':
        return 'Sẵn sàng';
      case 'not completed':
        return 'Đã phục vụ';
      case 'done':
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
          {filteredTables?.map((table: TableModel) => {
            const bill = billsWithOrders?.find(bill => bill.table_id === table.id && bill.status === 'unpaid');
            const hasOrders = bill && bill.orders && bill.orders.length > 0;
            const pendingOrders = bill?.orders?.filter(order => order.status === 'init').length || 0;
            
            return (
              <Col xs={12} sm={8} md={6} lg={4} xl={4} key={table.id}>
                <Badge.Ribbon 
                  text={getTableStatusText(table.status, bill!)} 
                  color={getTableStatusColor(table.status)}
                >
                  <Card
                    hoverable
                    className="text-center cursor-pointer transition-all duration-300 hover:shadow-lg"
                    onClick={() => handleTableClick(table)}
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
                        {areas[table.area as keyof typeof areas]}
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
                          💰 {caculateTotalAmount(bill).toLocaleString('vi-VN')} VNĐ
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
                    {caculateTotalAmount(selectedBill).toLocaleString('vi-VN')} VNĐ
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
                  dot={order.status === 'finished process' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
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
                          : `${Number(price).toLocaleString('vi-VN')} VNĐ`,
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