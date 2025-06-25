import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Table, Button, InputNumber, Space, Typography, message, Row, Col, Input, Tag, Form, List, Badge, Tabs, Drawer, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowLeftOutlined, PlusOutlined, MinusOutlined, ShoppingCartOutlined, CheckOutlined, SearchOutlined, MenuOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import { type Dish, type OrderDish, type Bill, type DishCategory, type Order } from '@/types';
import { useCreate, useList, useOne } from '@refinedev/core';
import { caculateTotalAmount } from '@/utils/caculateTotalAmountBill';

const API_URL = import.meta.env.VITE_API_URL;

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface OrderItem extends OrderDish {
  temp_id: string;
  dish?: Dish;
}

const AddOrder: React.FC = () => {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('menu');
  const [isCartDrawerVisible, setIsCartDrawerVisible] = useState(false);

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

  const { data: billData, isLoading: isLoadingBill } = useOne<Bill>({
    resource: 'bills',
    id: billId,
  });

  const { mutate: createOrder, isLoading: isCreatingOrder } = useCreate<Order>();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  // Mock data
  const dishes = listDishes?.data;
  const categories = listDishCategories?.data;
  const bill = billData?.data;
  
  // Filter dishes
  const filteredDishes = useMemo(() => {
    let result = [...dishes || []];
    
    if (selectedCategory !== 'all') {
      result = result.filter(dish => dish.category_id === selectedCategory);
    }
    
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(dish => 
        dish.name.toLowerCase().includes(lowerSearchText) ||
        (dish.description && dish.description.toLowerCase().includes(lowerSearchText))
      );
    }
    
    return result;
  }, [dishes, selectedCategory, searchText]);

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
        order_id: 0, // Will be set when creating order
        quantity: 1,
        price_at_order_time: dish.price,
        temp_id: `new_${Date.now()}_${dish.id}`,
        dish: dish
      };
      setCart([...cart, newItem]);
    }
    
    message.success(`Đã thêm ${dish.name} vào giỏ hàng`);
    
    // Trên mobile, mở giỏ hàng sau khi thêm món
    if (isMobile && !isCartDrawerVisible) {
      setIsCartDrawerVisible(true);
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

  const handleSubmitOrder = (values: { note?: string }) => {
    if (cart.length === 0) {
      message.warning('Vui lòng chọn ít nhất một món!');
      return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.price_at_order_time), 0);
    const orderData = {
      bill_id: bill?.id || 0,
      table_id: bill?.table_id || 0,
      order_dishes: cart,
      note: values.note
    }

    createOrder({
      resource: 'orders',
      values: orderData,
    }, {
      onSuccess: () => {
        message.success(`Đã thêm đơn gọi món mới vào hóa đơn #${billId}!`);
        // navigate('/admin/order');
      },
      onError: () => {
        message.error('Đã xảy ra lỗi khi thêm đơn gọi món!');
      }
    });

    // message.success(`Đã thêm đơn gọi món mới vào hóa đơn #${billId}!`);
    // navigate('/admin/order');
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.quantity * item.price_at_order_time), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Render menu món ăn
  const renderMenu = () => {
    return (
      <>
        <div className="mb-4">
          <div className="mb-3">
            <Input 
              placeholder="Tìm kiếm món ăn..." 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: '100%' }}
              size="large"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              type={selectedCategory === 'all' ? 'primary' : 'default'}
              onClick={() => setSelectedCategory('all')}
              size={isMobile ? 'small' : 'middle'}
              style={{ 
                borderRadius: '20px',
                fontWeight: selectedCategory === 'all' ? 'bold' : 'normal'
              }}
            >
              Tất cả
            </Button>
            {categories?.map(category => (
              <Button
                key={category.id}
                type={selectedCategory === category.id ? 'primary' : 'default'}
                onClick={() => setSelectedCategory(category.id as unknown as number)}
                size={isMobile ? 'small' : 'middle'}
                style={{ 
                  borderRadius: '20px',
                  fontWeight: selectedCategory === category.id ? 'bold' : 'normal'
                }}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        
        <List
          grid={{ 
            gutter: 8, 
            xs: 2,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 3,
            xxl: 3
          }}
          dataSource={filteredDishes}
          renderItem={(dish: Dish) => (
            <List.Item>
              <Card
                hoverable
                cover={ 
                    <div className='relative h-60 overflow-hidden'>
                        {dish.image?.path ? <Image
                        src={`${API_URL}/storage/${dish.image?.path}`}
                        alt={dish.name}
                        className='w-full h-full object-cover'
                        preview={false} /> : <Image
                            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200" 
                            alt={dish.name}
                            className="w-full h-full object-cover"
                            preview={false}
                        />}
                    </div>
                }
                onClick={() => handleAddToCart(dish)}
                style={{ height: '100%' }}
                size={isMobile ? "small" : "default"}
                bodyStyle={isMobile ? { padding: '8px' } : {}}
              >
                <Card.Meta
                  title={<div style={isMobile ? { fontSize: '14px', marginBottom: '4px' } : {}}>{dish.name}</div>}
                  description={
                    <div>
                      {!isMobile && <Text type="secondary">{dish.description}</Text>}
                      <Text strong style={{ 
                        display: 'block', 
                        marginTop: isMobile ? 0 : 8, 
                        fontSize: isMobile ? '12px' : '14px',
                        color: '#f5222d'
                      }}>
                        {dish.price.toLocaleString('vi-VN')} VNĐ
                      </Text>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </>
    );
  };

  // Render giỏ hàng
  const renderCart = () => {
    const cartColumns: ColumnsType<OrderItem> = [
      {
        title: 'Món ăn',
        dataIndex: ['dish', 'name'],
        key: 'dish_name',
        width: isMobile ? '40%' : '40%',
      },
      {
        title: 'Đơn giá',
        dataIndex: 'price_at_order_time',
        key: 'price',
        width: isMobile ? '25%' : '20%',
        render: (price: number) => `${price.toLocaleString('vi-VN')} VNĐ`,
        responsive: ['md'],
      },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        width: isMobile ? '35%' : '25%',
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
            {(record.quantity * record.price_at_order_time).toLocaleString('vi-VN')} VNĐ
          </Text>
        ),
        responsive: ['md'],
      },
    ];

    return (
      <>
        <Table
          columns={cartColumns}
          dataSource={cart}
          rowKey="temp_id"
          pagination={false}
          size={isMobile ? "small" : "middle"}
          locale={{ emptyText: 'Chưa có món ăn nào được chọn' }}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={isMobile ? 1 : 3}>
                <strong>Tổng cộng</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} colSpan={isMobile ? 2 : 2}>
                <strong style={{ color: '#f5222d', fontSize: '16px' }}>
                  {cartTotal.toLocaleString('vi-VN')} VNĐ
                </strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
        
        <Form
          form={form}
          onFinish={handleSubmitOrder}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="note"
            label="Ghi chú cho đơn này"
          >
            <TextArea 
              rows={2} 
              placeholder="Ví dụ: Không cay, ít đường..."
            />
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<CheckOutlined />}
              block={isMobile}
              size="large"
              disabled={cart.length === 0}
            >
              Gửi đơn đến bếp
            </Button>
          </Form.Item>
        </Form>
      </>
    );
  };

  // Render desktop layout
  const renderDesktopLayout = () => {
    return (
      <Row gutter={16}>
        {/* Menu */}
        <Col span={16}>
          <Card title="Thực đơn" className="h-full">
            {renderMenu()}
          </Card>
        </Col>

        {/* Cart */}
        <Col span={8}>
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span>Đơn gọi món mới</span>
                <Tag color="blue">{cart.length} món</Tag>
              </div>
            }
            className="h-full"
          >
            {cart.length > 0 ? renderCart() : (
              <div className="text-center py-8">
                <ShoppingCartOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <div className="mt-4 text-gray-500">
                  Chưa có món nào được chọn
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Chọn món từ thực đơn bên trái
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    );
  };

  // Render mobile layout
  const renderMobileLayout = () => {
    return (
      <>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          centered
          style={{ marginBottom: 16 }}
        >
          <TabPane 
            tab={
              <span>
                <MenuOutlined />
                Thực đơn
              </span>
            } 
            key="menu"
          >
            {renderMenu()}
          </TabPane>
        </Tabs>
        
        {/* Floating cart button */}
        {cart.length > 0 && (
          <div 
            style={{ 
              position: 'fixed', 
              bottom: 20, 
              right: 20, 
              zIndex: 1000 
            }}
          >
            <Badge count={cartItemCount}>
              <Button 
                type="primary" 
                shape="circle" 
                icon={<ShoppingCartOutlined />} 
                onClick={() => setIsCartDrawerVisible(true)}
                size="large"
                style={{ width: 60, height: 60 }}
              />
            </Badge>
          </div>
        )}
        
        {/* Cart drawer */}
        <Drawer
          title="Giỏ hàng"
          placement="bottom"
          onClose={() => setIsCartDrawerVisible(false)}
          open={isCartDrawerVisible}
          height="80vh"
          extra={
            <Badge count={cartItemCount}>
              <ShoppingCartOutlined style={{ fontSize: 20 }} />
            </Badge>
          }
        >
          {renderCart()}
        </Drawer>
      </>
    );
  };

  if (!bill) {
    return <div>Không tìm thấy hóa đơn</div>;
  }

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
        
        <Title level={3} style={{ fontSize: isMobile ? '18px' : '24px' }}>
          Thêm đơn gọi món
        </Title>
        
        {/* Bill Info */}
        <Card size="small" className="mb-4">
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Hóa đơn:</Text> #{bill.id}
              <br />
              <Text strong>Bàn:</Text> {bill.table?.name}
            </Col>
            <Col span={8}>
              <Text strong>Khách hàng:</Text> {bill.customer_name || bill.customer_by_phone?.name}
              <br />
              <Text strong>SĐT:</Text> {bill.customer_phone || bill.customer_by_phone?.phone}
            </Col>
            <Col span={8}>
              <Text strong>Tổng hiện tại:</Text> 
              <Text strong style={{ color: '#f5222d', marginLeft: 8 }}>
                {caculateTotalAmount(bill).toLocaleString('vi-VN')} {cartTotal ? `+ ${Number(cartTotal).toLocaleString('vi-VN')} = ${Number(caculateTotalAmount(bill) + cartTotal).toLocaleString('vi-VN')} VNĐ` : ''}
              </Text>
              <br />
              <Text strong>Thời gian:</Text> {dayjs().format('HH:mm DD/MM/YYYY')}
            </Col>
          </Row>
        </Card>
      </div>

      {/* Responsive layout */}
      {isMobile ? renderMobileLayout() : renderDesktopLayout()}
    </div>
  );
};

export default AddOrder; 