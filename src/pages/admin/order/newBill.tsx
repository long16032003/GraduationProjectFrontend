import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Table, Button, InputNumber, Space, Typography, message, Row, Col, Input, Tag, Divider, Form, List, Badge, Tabs, Drawer, Select, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowLeftOutlined, PlusOutlined, MinusOutlined, ShoppingCartOutlined, CheckOutlined, UserOutlined, SearchOutlined, MenuOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import { type Bill, type Dish, type DishCategory, type Order, type OrderDish, type TableModel } from '@/types';
import { useCreate, useList } from '@refinedev/core';
import { areas } from '@/utils/constant';

const API_URL = import.meta.env.VITE_API_URL;

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

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

// Fake categories
const generateFakeCategories = () => {
  return [
    { id: 1, name: 'Món chính' },
    { id: 2, name: 'Khai vị' },
    { id: 3, name: 'Đồ uống' },
    { id: 4, name: 'Tráng miệng' },
    { id: 5, name: 'Nước uống' }
  ];
};

// Fake table data
const generateFakeTable = (tableId: number): TableModel => {
  return {
    id: tableId,
    creator_id: 1,
    name: `Bàn ${tableId}`,
    capacity: Math.floor(Math.random() * 6) + 2,
    status: 'available',
    area: '1st floor',
    created_at: dayjs().format(),
    updated_at: dayjs().format(),
  };
};

interface OrderItem extends OrderDish {
  temp_id: string;
  dish?: Dish;
}

interface CustomerInfo {
  customer_name?: string;
  customer_phone: string;
  number_of_guests: number;
}

const NewBill: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const [customerForm] = Form.useForm();
  const [orderForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [step, setStep] = useState<'customer' | 'order'>('customer');
  const [activeTab, setActiveTab] = useState<string>('menu');
  const [isCartDrawerVisible, setIsCartDrawerVisible] = useState(false);

  const { mutate: createBill, isLoading: isCreatingBill } = useCreate<Bill>();
  const { mutate: createOrder, isLoading: isCreatingOrder } = useCreate<Order>();

  const { data: listTables, isLoading: isLoadingListTables } = useList<TableModel>({
    resource: 'tables',
  });

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  // API call
  const { data: listDishes, isLoading: isLoadingListDishes } = useList<Dish>({
    resource: 'dishes',
  });
  const { data: listDishCategories, isLoading: isLoadingListDishCategories } = useList<DishCategory>({
    resource: 'dish-categories',
  });
  const dishes = listDishes?.data;
  const categories = listDishCategories?.data;
  const table = listTables?.data?.find(table => table.id === parseInt(tableId || '0'));
  
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

  const handleCustomerSubmit = async (values: CustomerInfo) => {
    setCustomerInfo(values);
    setStep('order');
  };

  const handleEditCustomer = () => {
    setStep('customer');
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
        order_id: 0,
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

  const handleSubmitOrder = async (values: { note?: string }) => {
    if (!customerInfo) {
      message.error('Thông tin khách hàng không hợp lệ!');
      return;
    }

    if (cart.length === 0) {
      message.warning('Vui lòng chọn ít nhất một món!');
      return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.price_at_order_time), 0);
    
    try {
      // Bước 1: Tạo Bill trước
      const billData = {
        table_id: parseInt(tableId!),
        customer_name: customerInfo.customer_name,
        customer_phone: customerInfo.customer_phone || null,
      };

      console.log('Tạo Bill với data:', billData);

      const billResponse = await new Promise<{ data: Bill }>((resolve, reject) => {
        createBill(
          {
            resource: 'bills',
            values: billData,
          },
          {
            onSuccess: (data) => {
              console.log('Bill tạo thành công:', data);
              resolve(data);
            //   navigate(`/admin/order`);
            },
            onError: (error) => {
              console.error('Lỗi tạo Bill:', error);
              reject(error);
            },
          }
        );
      });

      const newBill = billResponse;
      console.log('newBill', newBill);
      
      // Bước 2: Tạo Order đầu tiên
      const orderData = {
        table_id: parseInt(tableId!),
        bill_id: newBill?.id,
        note: values.note || null,
        order_dishes: cart.map(item => ({
          dish_id: item.dish_id,
          quantity: item.quantity,
          price_at_order_time: item.price_at_order_time
        }))
      };

      console.log('Tạo Order với data:', orderData);

      await new Promise<{ data: Order }>((resolve, reject) => {
        createOrder(
          {
            resource: 'orders',
            values: orderData,
          },
          {
            onSuccess: (data) => {
              console.log('Order tạo thành công:', data);
              resolve(data);
            },
            onError: (error) => {
              console.error('Lỗi tạo Order:', error);
              reject(error);
            },
          }
        );
      });

      // Thành công
      message.success(`Đã tạo hóa đơn mới cho ${table?.name} và gửi đơn đầu tiên đến bếp!`);
      navigate('/admin/order');

    } catch (error: unknown) {
      console.error('Lỗi tạo hóa đơn và order:', error);
      
      // Hiển thị lỗi chi tiết nếu có
      let errorMessage = 'Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại!';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }
      
      message.error(errorMessage);
    }
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
          renderItem={dish => (
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
          form={orderForm}
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
              loading={isCreatingBill || isCreatingOrder}
            >
              {isCreatingBill || isCreatingOrder ? 'Đang tạo...' : 'Tạo hóa đơn & Gửi đơn đến bếp'}
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
                <span>Đơn gọi món đầu tiên</span>
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

  if (!table) {
    return <div>Không tìm thấy bàn</div>;
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
          Tạo hóa đơn mới - {table.name}
        </Title>
        
        {/* Table Info */}
        <Card size="small" className="mb-4">
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Bàn:</Text> {table.name}
              <br />
              <Text strong>Sức chứa:</Text> {table.capacity} người
            </Col>
            <Col span={8}>
              <Text strong>Khu vực:</Text> {areas[table.area as keyof typeof areas]}
              <br />
              <Text strong>Thời gian:</Text> {dayjs().format('HH:mm DD/MM/YYYY')}
            </Col>
            <Col span={8}>
              <Text strong>Trạng thái:</Text> <Tag color="green">Sẵn sàng phục vụ</Tag>
            </Col>
          </Row>
        </Card>
      </div>

      {step === 'customer' ? (
        // Customer Information Step
        <Card title="Thông tin khách hàng" className="max-w-md mx-auto">
          <Form
            form={customerForm}
            layout="vertical"
            onFinish={handleCustomerSubmit}
            initialValues={{ number_of_guests: 2 }}
          >
            <Form.Item
              name="customer_name"
              label="Tên khách hàng"
              rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
            >
              <Input 
                prefix={<UserOutlined />}
                placeholder="Nhập tên khách hàng"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="customer_phone"
              label="Số điện thoại (tùy chọn)"
            >
              <Input 
                placeholder="Nhập số điện thoại"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="number_of_guests"
              label="Số lượng khách"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng khách' }]}
            >
              <InputNumber
                min={1}
                max={table.capacity}
                style={{ width: '100%' }}
                size="large"
                placeholder="Số lượng khách"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
              >
                Tiếp tục gọi món
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ) : (
        // Order Step
        <>
          {/* Customer Info Display */}
          <Card size="small" className="mb-4">
            <Row gutter={16} align="middle">
              <Col span={18}>
                <Space size="large">
                  <div>
                    <Text strong>Khách hàng:</Text> {customerInfo?.customer_name}
                  </div>
                  <div>
                    <Text strong>SĐT:</Text> {customerInfo?.customer_phone || 'Không có'}
                  </div>
                  <div>
                    <Text strong>Số khách:</Text> {customerInfo?.number_of_guests}
                  </div>
                </Space>
              </Col>
              <Col span={6} className="text-right">
                <Button onClick={handleEditCustomer}>
                  Sửa thông tin
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Responsive layout */}
          {isMobile ? renderMobileLayout() : renderDesktopLayout()}
        </>
      )}
    </div>
  );
};

export default NewBill; 