import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Table, Button, InputNumber, Space, Typography, message, Row, Col, Input, Tag, Divider } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, MinusOutlined, ShoppingCartOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { type Dish, type BillItem } from '@/types';

const { Title, Text } = Typography;
const { Search } = Input;

// Fake data for dishes (same as in manageOrder.tsx)
const generateFakeDishes = (): Dish[] => {
  const dishes: Dish[] = [
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
  
  return dishes;
};

interface OrderItem extends BillItem {
  temp_id: string;
}

const TableOrder: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Mock data
  const dishes = useMemo(() => generateFakeDishes(), []);
  
  // Filter dishes
  const filteredDishes = useMemo(() => {
    if (!searchText) return dishes;
    return dishes.filter(dish => 
      dish.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [dishes, searchText]);

  const handleBack = () => {
    navigate('/admin/order');
  };

  const handleAddToCart = (dish: Dish) => {
    const existingItem = cart.find(item => item.dish_id === dish.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.dish_id === dish.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        dish_id: dish.id,
        dish_name: dish.name,
        quantity: 1,
        unit_price: dish.price,
        temp_id: `new_${Date.now()}_${dish.id}`
      };
      setCart([...cart, newItem]);
    }
  };

  const handleUpdateQuantity = (tempId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.temp_id !== tempId));
    } else {
      setCart(cart.map(item => 
        item.temp_id === tempId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      message.warning('Vui lòng chọn ít nhất một món!');
      return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    
    console.log('Đơn hàng cho bàn', tableId, ':', {
      table_id: tableId,
      items: cart,
      total_amount: totalAmount
    });

    message.success(`Đã thêm đơn hàng cho bàn ${tableId}!`);
    navigate('/admin/order');
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const dishColumns = [
    {
      title: 'Món ăn',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Dish) => (
        <div>
          <div className="font-medium">{name}</div>
          {record.description && (
            <div className="text-sm text-gray-500">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: '20%',
      render: (price: number) => (
        <Text strong>{price.toLocaleString('vi-VN')} VNĐ</Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_: unknown, record: Dish) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleAddToCart(record)}
        >
          Thêm
        </Button>
      ),
    },
  ];

  const cartColumns = [
    {
      title: 'Món ăn',
      dataIndex: 'dish_name',
      key: 'dish_name',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: '20%',
      render: (price: number) => `${price.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '25%',
      render: (quantity: number, record: OrderItem) => (
        <Space>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => handleUpdateQuantity(record.temp_id, quantity - 1)}
          />
          <InputNumber
            size="small"
            min={1}
            value={quantity}
            onChange={(value) => handleUpdateQuantity(record.temp_id, value || 1)}
            style={{ width: 60 }}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleUpdateQuantity(record.temp_id, quantity + 1)}
          />
        </Space>
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: '20%',
      render: (_: unknown, record: OrderItem) => (
        <Text strong>
          {(record.quantity * record.unit_price).toLocaleString('vi-VN')} VNĐ
        </Text>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="mb-4"
        >
          Quay lại
        </Button>
        
        <Title level={3}>Gọi món cho Bàn {tableId}</Title>
        <Text type="secondary">
          Thời gian: {dayjs().format('HH:mm:ss DD/MM/YYYY')}
        </Text>
      </div>

      <Row gutter={16}>
        {/* Menu */}
        <Col span={16}>
          <Card title="Thực đơn" className="h-full">
            <Search
              placeholder="Tìm kiếm món ăn..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="mb-4"
            />
            <Table
              columns={dishColumns}
              dataSource={filteredDishes}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ y: 500 }}
            />
          </Card>
        </Col>

        {/* Cart */}
        <Col span={8}>
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span>Đơn hàng</span>
                <Tag color="blue">{cart.length} món</Tag>
              </div>
            }
            className="h-full"
          >
            {cart.length > 0 ? (
              <>
                <Table
                  columns={cartColumns}
                  dataSource={cart}
                  rowKey="temp_id"
                  pagination={false}
                  size="small"
                  scroll={{ y: 300 }}
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <strong>Tổng cộng</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong style={{ color: '#f5222d', fontSize: '16px' }}>
                          {cartTotal.toLocaleString('vi-VN')} VNĐ
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
                
                <Divider />
                
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleSubmitOrder}
                  block
                  size="large"
                >
                  Xác nhận đơn hàng
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <ShoppingCartOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <div className="mt-4 text-gray-500">
                  Chưa có món nào được chọn
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TableOrder; 