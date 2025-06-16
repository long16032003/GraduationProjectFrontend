import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Tag, Input, Select, Row, Col, Form, InputNumber, Space, Divider, Typography, List, Avatar, Modal, message, Spin, Badge, Tabs, Drawer } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useParams, useNavigate } from 'react-router';
import { PlusOutlined, MinusOutlined, DeleteOutlined, SendOutlined, ArrowLeftOutlined, QuestionCircleOutlined, SearchOutlined, ShoppingCartOutlined, HistoryOutlined, MenuOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useOne, useList } from '@refinedev/core';
import { tax_percentage, type Bill, type BillItem } from '@/types';
import { useMediaQuery } from 'react-responsive';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Giả lập dữ liệu món ăn từ database
interface Dish {
  id: number;
  name: string;
  price: number;
  category_id: number;
  description: string;
  image_url?: string;
}

interface DishCategory {
  id: number;
  name: string;
}

// Tạo dữ liệu mẫu cho món ăn
const generateFakeDishes = (): Dish[] => {
  const dishes: Dish[] = [];
  const dishNames = [
    'Bò bít tết', 'Gà nướng', 'Cá hấp', 'Tôm sú nướng', 'Lẩu hải sản',
    'Salad trộn', 'Súp kem nấm', 'Pizza hải sản', 'Mì Ý sốt bò bằm', 'Cơm chiên dương châu',
    'Bánh mì kẹp thịt', 'Hamburger bò', 'Khoai tây chiên', 'Nước ép cam', 'Trà đào',
    'Sinh tố xoài', 'Bia Tiger', 'Coca Cola', 'Rượu vang đỏ', 'Bánh cheesecake'
  ];

  for (let i = 0; i < dishNames.length; i++) {
    dishes.push({
      id: i + 1,
      name: dishNames[i],
      price: Math.floor(Math.random() * 200000) + 50000,
      category_id: Math.floor(i / 5) + 1,
      description: `Mô tả cho món ${dishNames[i]}`,
      image_url: `https://picsum.photos/seed/${i}/200/200`
    });
  }

  return dishes;
};

// Tạo dữ liệu mẫu cho danh mục món ăn
const generateFakeCategories = (): DishCategory[] => {
  return [
    { id: 1, name: 'Món chính' },
    { id: 2, name: 'Khai vị' },
    { id: 3, name: 'Đồ uống' },
    { id: 4, name: 'Tráng miệng' }
  ];
};

// Tạo dữ liệu mẫu cho hóa đơn
const generateFakeBill = (id: number): Bill => {
  return {
    id: id,
    creator_id: Math.floor(Math.random() * 10) + 1,
    customer_id: Math.floor(Math.random() * 100) + 1,
    table_id: Math.floor(Math.random() * 20) + 1,
    customer_name: `Khách hàng ${id}`,
    customer_phone: `090${Math.floor(1000000 + Math.random() * 9000000)}`,
    table_number: Math.floor(Math.random() * 20) + 1,
    total_amount: 0, // Sẽ tính sau khi có đơn gọi món
    created_at: dayjs().format(),
    payment_method: null,
    status: 'unpaid',
    items: [],
    has_new_orders: false
  };
};

// Order item trên mỗi đợt gọi món
interface OrderItem extends BillItem {
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  order_batch_id: number;
}

// Batch đơn gọi món
interface OrderBatch {
  id: number;
  bill_id: number;
  created_at: string;
  status: 'pending' | 'processing' | 'completed';
  items: OrderItem[];
  notes?: string;
}

// Tạo dữ liệu mẫu cho các đợt gọi món
const generateFakeOrderBatches = (billId: string): OrderBatch[] => {
  const allDishes = generateFakeDishes();
  const batches: OrderBatch[] = [];
  
  // Tạo 2 đợt gọi món mẫu
  for (let i = 1; i <= 2; i++) {
    const items: OrderItem[] = [];
    const itemCount = Math.floor(Math.random() * 3) + 2;
    const usedDishIds = new Set<number>();
    
    for (let j = 0; j < itemCount; j++) {
      let dishId;
      do {
        dishId = Math.floor(Math.random() * allDishes.length) + 1;
      } while (usedDishIds.has(dishId));
      
      usedDishIds.add(dishId);
      const dish = allDishes.find(d => d.id === dishId);
      
      if (dish) {
        items.push({
          dish_id: dish.id,
          dish_name: dish.name,
          quantity: Math.floor(Math.random() * 3) + 1,
          unit_price: dish.price,
          status: i === 1 ? 'completed' : 'pending',
          order_batch_id: i
        });
      }
    }
    
    batches.push({
      id: i,
      bill_id: parseInt(billId || '0'),
      created_at: dayjs().subtract(i, 'hour').format(),
      status: i === 1 ? 'completed' : 'pending',
      items: items,
      notes: i % 2 === 0 ? 'Ghi chú cho đợt gọi món này' : undefined
    });
  }
  
  return batches;
};

const ManageOrder: React.FC = () => {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [allDishes, setAllDishes] = useState<Dish[]>(generateFakeDishes());
  const [categories, setCategories] = useState<DishCategory[]>(generateFakeCategories());
  const [bill, setBill] = useState<Bill | null>(null);
  const [orderBatches, setOrderBatches] = useState<OrderBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [orderItems, setOrderItems] = useState<BillItem[]>([]);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState<string>('menu');
  const [isCartDrawerVisible, setIsCartDrawerVisible] = useState(false);
  
  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  
  // Trong môi trường thực tế, sẽ fetch dữ liệu từ API
  useEffect(() => {
    // Mô phỏng API call
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Giả lập delay API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (billId) {
          const billData = generateFakeBill(parseInt(billId));
          const orderBatchesData = generateFakeOrderBatches(billId);
          
          setBill(billData);
          setOrderBatches(orderBatchesData);
        }
      } catch (error) {
        message.error('Có lỗi xảy ra khi tải dữ liệu');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [billId]);
  
  // Lọc món ăn theo danh mục và tìm kiếm
  const filteredDishes = useMemo(() => {
    let result = [...allDishes];
    
    if (selectedCategory !== 'all') {
      result = result.filter(dish => dish.category_id === selectedCategory);
    }
    
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(dish => 
        dish.name.toLowerCase().includes(lowerSearchText) ||
        dish.description.toLowerCase().includes(lowerSearchText)
      );
    }
    
    return result;
  }, [allDishes, selectedCategory, searchText]);
  
  // Thêm món ăn vào đơn gọi món hiện tại
  const handleAddDish = (dish: Dish) => {
    const existingItemIndex = orderItems.findIndex(item => item.dish_id === dish.id);
    
    if (existingItemIndex >= 0) {
      // Nếu món ăn đã có trong đơn, tăng số lượng
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1
      };
      setOrderItems(updatedItems);
    } else {
      // Nếu món ăn chưa có trong đơn, thêm mới
      setOrderItems([
        ...orderItems,
        {
          dish_id: dish.id,
          dish_name: dish.name,
          quantity: 1,
          unit_price: dish.price
        }
      ]);
    }
    
    // Hiển thị thông báo nhỏ
    message.success(`Đã thêm ${dish.name} vào giỏ hàng`);
    
    // Trên mobile, mở giỏ hàng sau khi thêm món
    if (isMobile && !isCartDrawerVisible) {
      setIsCartDrawerVisible(true);
    }
  };
  
  // Tăng số lượng món ăn
  const handleIncreaseQuantity = (dishId: number) => {
    const updatedItems = orderItems.map(item => 
      item.dish_id === dishId 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    );
    setOrderItems(updatedItems);
  };
  
  // Giảm số lượng món ăn
  const handleDecreaseQuantity = (dishId: number) => {
    const updatedItems = orderItems.map(item => 
      item.dish_id === dishId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    );
    setOrderItems(updatedItems);
  };
  
  // Xóa món ăn khỏi đơn
  const handleRemoveDish = (dishId: number) => {
    const updatedItems = orderItems.filter(item => item.dish_id !== dishId);
    setOrderItems(updatedItems);
  };
  
  // Gửi đơn gọi món
  const handleSubmitOrder = () => {
    if (orderItems.length === 0) {
      message.warning('Vui lòng chọn ít nhất một món ăn');
      return;
    }
    
    setIsConfirmModalVisible(true);
  };
  
  // Xác nhận gửi đơn gọi món
  const handleConfirmOrder = () => {
    // Trong thực tế, sẽ gửi API request
    message.success('Đã gửi đơn gọi món thành công!');
    
    // Thêm đơn gọi món mới vào danh sách
    const newBatchId = (orderBatches.length > 0 ? Math.max(...orderBatches.map(b => b.id)) : 0) + 1;
    
    const newOrderItems: OrderItem[] = orderItems.map(item => ({
      ...item,
      status: 'pending',
      order_batch_id: newBatchId
    }));
    
    const newBatch: OrderBatch = {
      id: newBatchId,
      bill_id: parseInt(billId || '0'),
      created_at: dayjs().format(),
      status: 'pending',
      items: newOrderItems,
      notes: noteText || undefined
    };
    
    setOrderBatches([...orderBatches, newBatch]);
    setOrderItems([]);
    setNoteText('');
    setIsConfirmModalVisible(false);
    
    // Đóng drawer giỏ hàng trên mobile
    if (isMobile) {
      setIsCartDrawerVisible(false);
    }
    
    // Chuyển sang tab lịch sử gọi món
    setActiveTab('history');
  };
  
  // Quay lại trang quản lý hóa đơn
  const handleGoBack = () => {
    navigate('/admin/bill/manageBills');
  };
  
  // Tính tổng tiền đơn gọi món hiện tại
  const currentOrderTotal = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price, 
    0
  );
  
  // Tổng số món trong giỏ hàng
  const cartItemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Cột cho bảng đơn gọi món hiện tại
  const currentOrderColumns: ColumnsType<BillItem> = [
    {
      title: 'Món ăn',
      dataIndex: 'dish_name',
      key: 'dish_name',
      width: isMobile ? '40%' : '40%',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: isMobile ? '25%' : '20%',
      render: (price: number) => `${price.toLocaleString('vi-VN')} VNĐ`,
      responsive: ['md'],
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      width: isMobile ? '35%' : '20%',
      render: (_: unknown, record: BillItem) => (
        <Space>
          <Button 
            icon={<MinusOutlined />} 
            onClick={() => handleDecreaseQuantity(record.dish_id)}
            disabled={record.quantity <= 1}
            size="small"
          />
          <span>{record.quantity}</span>
          <Button 
            icon={<PlusOutlined />} 
            onClick={() => handleIncreaseQuantity(record.dish_id)}
            size="small"
          />
        </Space>
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: '15%',
      render: (_: unknown, record: BillItem) => 
        `${(record.quantity * record.unit_price).toLocaleString('vi-VN')} VNĐ`,
      responsive: ['md'],
    },
    {
      title: '',
      key: 'action',
      width: '5%',
      render: (_: unknown, record: BillItem) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveDish(record.dish_id)}
          size="small"
        />
      ),
    },
  ];

  // Lấy trạng thái hiển thị cho item
  const getOrderItemStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="blue">Đang chờ</Tag>;
      case 'processing':
        return <Tag color="orange">Đang chế biến</Tag>;
      case 'completed':
        return <Tag color="green">Hoàn thành</Tag>;
      case 'cancelled':
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };
  
  // Render menu món ăn
  const renderMenu = () => {
    return (
      <>
        <div className="mb-4 flex justify-between flex-wrap">
          <Space wrap className="mb-2">
            <Select 
              style={{ width: isMobile ? '100%' : 200 }} 
              placeholder="Chọn danh mục"
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              <Option value="all">Tất cả danh mục</Option>
              {categories.map(category => (
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
            <Input 
              placeholder="Tìm kiếm món ăn" 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: isMobile ? '100%' : 250 }}
            />
          </Space>
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
                cover={dish.image_url && <img alt={dish.name} src={dish.image_url} style={{ height: isMobile ? 100 : 250, objectFit: 'cover' }} />}
                onClick={() => handleAddDish(dish)}
                style={{ height: '100%' }}
                size={isMobile ? "small" : "default"}
                bodyStyle={isMobile ? { padding: '8px' } : {}}
              >
                <Card.Meta
                  title={<div style={isMobile ? { fontSize: '14px', marginBottom: '4px' } : {}}>{dish.name}</div>}
                  description={
                    <div>
                      {!isMobile && <Text>{dish.description}</Text>}
                      <Text strong style={{ display: 'block', marginTop: isMobile ? 0 : 8, fontSize: isMobile ? '12px' : '14px' }}>
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
    return (
      <>
        <Table
          columns={currentOrderColumns}
          dataSource={orderItems}
          rowKey="dish_id"
          pagination={false}
          locale={{ emptyText: 'Chưa có món ăn nào được chọn' }}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={isMobile ? 1 : 3}>
                <strong>Tổng cộng</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} colSpan={isMobile ? 2 : 2}>
                <strong>{currentOrderTotal.toLocaleString('vi-VN')} VNĐ</strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
          size={isMobile ? "small" : "middle"}
        />
        
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Ghi chú">
            <Input.TextArea 
              rows={2} 
              placeholder="Nhập ghi chú cho đơn gọi món này" 
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            />
          </Form.Item>
        </Form>
        
        <div className="mt-4 flex justify-end">
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSubmitOrder}
            disabled={orderItems.length === 0}
            block={isMobile}
          >
            Gửi đơn gọi món
          </Button>
        </div>
      </>
    );
  };
  
  // Render lịch sử gọi món
  const renderHistory = () => {
    return (
      <>
        {orderBatches.length > 0 ? (
          orderBatches.map((batch, index) => (
            <Card 
              key={batch.id} 
              title={`Đợt gọi món #${batch.id}`}
              extra={<Text type="secondary">{dayjs(batch.created_at).format('HH:mm:ss DD/MM/YYYY')}</Text>}
              style={{ marginBottom: 16 }}
              type="inner"
              size={isMobile ? "small" : "default"}
            >
              <List
                itemLayout="horizontal"
                dataSource={batch.items}
                renderItem={item => (
                  <List.Item
                    actions={[getOrderItemStatusTag(item.status)]}
                  >
                    <List.Item.Meta
                      title={`${item.dish_name} x${item.quantity}`}
                      description={`${(item.quantity * item.unit_price).toLocaleString('vi-VN')} VNĐ`}
                    />
                  </List.Item>
                )}
              />
              {batch.notes && (
                <div className="mt-2">
                  <Text type="secondary">Ghi chú: {batch.notes}</Text>
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center p-8">
            <Text type="secondary">Chưa có lịch sử gọi món</Text>
          </div>
        )}
      </>
    );
  };
  
  // Render desktop layout
  const renderDesktopLayout = () => {
    return (
      <Row gutter={24}>
        {/* Cột trái: Danh sách món ăn */}
        <Col span={14}>
          <Title level={5}>Danh sách món ăn</Title>
          {renderMenu()}
        </Col>
        
        {/* Cột phải: Đơn gọi món hiện tại */}
        <Col span={10}>
          <div className="mb-4">
            <Title level={5}>Đơn gọi món hiện tại</Title>
            {renderCart()}
          </div>
          
          <Divider />
          
          {/* Lịch sử gọi món */}
          <div>
            <Title level={5}>Lịch sử gọi món</Title>
            {renderHistory()}
          </div>
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
          <TabPane 
            tab={
              <span>
                <HistoryOutlined />
                Lịch sử
              </span>
            } 
            key="history"
          >
            {renderHistory()}
          </TabPane>
        </Tabs>
        
        {/* Floating cart button */}
        {orderItems.length > 0 && (
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
  
  return (
    <Spin spinning={loading}>
      <Card className="m-4" bodyStyle={{ padding: isMobile ? '12px' : '24px' }}>
        <div className="mb-4 flex justify-between items-center">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleGoBack}>
              Quay lại
            </Button>
            <Title level={4} style={{ margin: 0, fontSize: isMobile ? '18px' : '24px' }}>
              Gọi món cho hóa đơn #{billId}
            </Title>
          </Space>
          {bill && (
            <Space>
              <Text strong>Bàn: {bill.table_number}</Text>
              {!isMobile && <Text strong>Khách hàng: {bill.customer_name}</Text>}
            </Space>
          )}
        </div>
        
        <Divider style={{ margin: '12px 0' }} />
        
        {/* Responsive layout */}
        {isMobile ? renderMobileLayout() : renderDesktopLayout()}
        
        {/* Modal xác nhận gửi đơn */}
        <Modal
          title="Xác nhận gửi đơn gọi món"
          open={isConfirmModalVisible}
          onOk={handleConfirmOrder}
          onCancel={() => setIsConfirmModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn gửi đơn gọi món này không?</p>
          <p>Tổng số món: <strong>{orderItems.length}</strong></p>
          <p>Tổng tiền: <strong>{currentOrderTotal.toLocaleString('vi-VN')} VNĐ</strong></p>
        </Modal>
      </Card>
    </Spin>
  );
};

export default ManageOrder;