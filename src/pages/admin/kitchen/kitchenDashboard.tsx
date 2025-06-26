import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Tag, Input, Select, Row, Col, Tabs, Typography, List, Space, Badge, Modal, message, Spin, Divider, Statistic, Avatar, Tooltip, Checkbox, Radio } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router';
import { CheckOutlined, ClockCircleOutlined, FireOutlined, SearchOutlined, BellOutlined, HistoryOutlined, CloseOutlined, UserOutlined, ExclamationCircleOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useList, useUpdate } from '@refinedev/core';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { confirm } = Modal;

// Định nghĩa kiểu dữ liệu theo database schema thực tế
interface Order {
  id: number;
  table_id: number;
  table?: {
    id: number;
    number: number;
  };
  bill_id: number;
  creator_id: number;
  order_time: string;
  note?: string;
  status: 'init' | 'processing' | 'finished process' | 'not completed' | 'done' | 'cancelled';
  created_at: string;
  updated_at: string;
  order_dishes: OrderDish[];
  chef_id?: number; // ID của đầu bếp được giao đơn này
  chef_name?: string; // Tên đầu bếp
  priority?: number; // Độ ưu tiên: càng cao càng ưu tiên (cho đơn bị thiếu)
  cancelled_reason?: string; // Lý do hủy đơn
}

interface OrderDish {
  id: number;
  dish_id: number;
  order_id: number;
  quantity: number;
  price_at_order_time: number;
  dish?: {
    id: number;
    name: string;
    category_id: number;
    preparation_time?: number; // Thời gian chế biến (phút)
  };
  is_available?: boolean; // Đánh dấu món có thể làm được không
  note?: string; // Ghi chú riêng cho món này
  status?: 'active' | 'cancelled'; // Trạng thái của món trong đơn
  cancelled_reason?: string; // Lý do hủy món
}

// Định nghĩa nhân viên bếp
interface Staff {
  id: number;
  name: string;
  role: 'chef' | 'server' | 'manager';
  avatar?: string;
}

const KitchenDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [chefs, setChefs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<string>('init');
  const [isStartCookingModalVisible, setIsStartCookingModalVisible] = useState(false);
  const [isFinishCookingModalVisible, setIsFinishCookingModalVisible] = useState(false);
  const [isVerifyOrderModalVisible, setIsVerifyOrderModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignedChef, setAssignedChef] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'kitchen' | 'server'>('kitchen');
  const [verificationResults, setVerificationResults] = useState<{[key: number]: boolean}>({});
  
  // Thêm state cho chức năng hủy đơn
  const [isCancelOrderModalVisible, setIsCancelOrderModalVisible] = useState(false);
  const [isCancelDishModalVisible, setIsCancelDishModalVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<OrderDish | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelType, setCancelType] = useState<'out_of_stock' | 'kitchen_issue' | 'customer_request' | 'other'>('out_of_stock');
  
  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  
  // Fetch orders từ API
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useList<Order>({
    resource: 'orders',
    pagination: { mode: 'off' },
    meta: {
      populate: {
        table: { fields: ['id', 'number'] },
        order_dishes: {
          populate: {
            dish: { fields: ['id', 'name', 'category_id', 'preparation_time'] }
          }
        }
      }
    },
    queryOptions: {
      refetchInterval: 30000, // Tự động làm mới mỗi 30 giây
    }
  });
  
  const {mutate: updateOrder, isLoading: isUpdatingOrder} = useUpdate();

  // Tạo dữ liệu mẫu cho nhân viên (trong thực tế sẽ fetch từ API)
  useEffect(() => {
    const fakeChefs: Staff[] = [
      { id: 1, name: 'Nguyễn Văn A', role: 'chef', avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: 2, name: 'Trần Thị B', role: 'chef', avatar: 'https://i.pravatar.cc/150?img=2' },
      { id: 3, name: 'Lê Văn C', role: 'chef', avatar: 'https://i.pravatar.cc/150?img=3' },
    ];
    setChefs(fakeChefs);
  }, []);

  useEffect(() => {
    if (ordersData?.data) {
      setOrders(ordersData.data);
      setLoading(ordersLoading);
    }
  }, [ordersData, ordersLoading]);
  
  // Lọc đơn hàng theo tab và tìm kiếm
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    
    // Lọc theo tab
    if (activeTab !== 'all') {
      result = result.filter(order => {
        switch (activeTab) {
          case 'init':
            return order.status === 'init';
          case 'processing':
            return order.status === 'processing';
          case 'finished_process':
            return order.status === 'finished process';
          case 'not_completed':
            return order.status === 'not completed';
          case 'done':
            return order.status === 'done';
          case 'cancelled':
            return order.status === 'cancelled';
          default:
            return true;
        }
      });
    }
    
    // Lọc theo tìm kiếm
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(order => 
        order.table?.number?.toString().includes(lowerSearchText) ||
        order.order_dishes.some(dish => dish.dish?.name?.toLowerCase().includes(lowerSearchText))
      );
    }
    
    // Sắp xếp theo ưu tiên (cao đến thấp) và thời gian (cũ đến mới)
    result.sort((a, b) => {
      // Đơn bị thiếu (not completed) có ưu tiên cao nhất
      if (a.status === 'not completed' && b.status !== 'not completed') return -1;
      if (b.status === 'not completed' && a.status !== 'not completed') return 1;
      
      // Sau đó sắp xếp theo thời gian tạo
      return dayjs(a.created_at).diff(dayjs(b.created_at));
    });
    
    return result;
  }, [orders, activeTab, searchText]);
  
  // Số lượng đơn theo trạng thái
  const orderCounts = useMemo(() => {
    const counts = {
      init: 0,
      processing: 0,
      finished_process: 0,
      not_completed: 0,
      done: 0,
      cancelled: 0,
      all: orders.length
    };
    
    orders.forEach(order => {
      switch (order.status) {
        case 'init':
          counts.init++;
          break;
        case 'processing':
          counts.processing++;
          break;
        case 'finished process':
          counts.finished_process++;
          break;
        case 'not completed':
          counts.not_completed++;
          break;
        case 'done':
          counts.done++;
          break;
        case 'cancelled':
          counts.cancelled++;
          break;
      }
    });
    
    return counts;
  }, [orders]);
  
  // Bắt đầu chế biến đơn (init → processing)
  const handleStartCooking = (order: Order) => {
    setSelectedOrder(order);
    setAssignedChef(undefined);
    setIsStartCookingModalVisible(true);
  };
  
  // Xác nhận bắt đầu chế biến
  const confirmStartCooking = async () => {
    if (selectedOrder && assignedChef) {
      try {
        // Trong thực tế sẽ gọi API để cập nhật trạng thái
        updateOrder({
          resource: 'orders',
          id: selectedOrder.id,
          values: { status: 'processing' },
        });
        
        // Tạm thời cập nhật local state
        const chef = chefs.find(c => c.id === assignedChef);
        const updatedOrders = orders.map(order => {
          if (order.id === selectedOrder.id) {
            return {
              ...order,
              status: 'processing' as const,
              chef_id: assignedChef,
              chef_name: chef?.name,
              updated_at: dayjs().format()
            };
          }
          return order;
        });
        
        setOrders(updatedOrders);
        setIsStartCookingModalVisible(false);
        message.success(`Đã bắt đầu chế biến đơn bàn #${selectedOrder.table?.number}`);
        refetchOrders();
      } catch (error) {
        message.error('Có lỗi xảy ra khi cập nhật trạng thái');
      }
    } else {
      message.error('Vui lòng chọn đầu bếp phụ trách');
    }
  };
  
  // Hoàn thành chế biến đơn (processing → finished process)
  const handleFinishCooking = (order: Order) => {
    setSelectedOrder(order);
    setIsFinishCookingModalVisible(true);
  };
  
  // Xác nhận hoàn thành chế biến
  const confirmFinishCooking = async () => {
    if (selectedOrder) {
      try {
        // Trong thực tế sẽ gọi API để cập nhật trạng thái
        // await update({ resource: 'orders', id: selectedOrder.id, values: { status: 'finished process' } });
        
        // Tạm thời cập nhật local state
        const updatedOrders = orders.map(order => {
          if (order.id === selectedOrder.id) {
            return {
              ...order,
              status: 'finished process' as const,
              updated_at: dayjs().format()
            };
          }
          return order;
        });
        
        setOrders(updatedOrders);
        setIsFinishCookingModalVisible(false);
        message.success(`Đã hoàn thành chế biến đơn bàn #${selectedOrder.table?.number}`);
        refetchOrders();
      } catch (error) {
        message.error('Có lỗi xảy ra khi cập nhật trạng thái');
      }
    }
  };
  
  // Xác minh đơn hàng (nhân viên phục vụ kiểm tra)
  const handleVerifyOrder = (order: Order) => {
    setSelectedOrder(order);
    // Reset verification results - Fix: sử dụng order_dish.id thay vì dish.id
    const initialResults: {[key: number]: boolean} = {};
    order.order_dishes.forEach(orderDish => {
      initialResults[orderDish.id] = orderDish.is_available !== false; // Dựa trên trạng thái hiện tại
    });
    setVerificationResults(initialResults);
    setIsVerifyOrderModalVisible(true);
  };
  
  // Cập nhật kết quả xác minh món ăn - Fix: sử dụng orderDishId
  const handleDishVerification = (orderDishId: number, isAvailable: boolean) => {
    setVerificationResults(prev => ({
      ...prev,
      [orderDishId]: isAvailable
    }));
  };
  
  // Xác nhận kết quả xác minh
  const confirmVerifyOrder = async () => {
    if (selectedOrder) {
      const allDishesAvailable = Object.values(verificationResults).every(result => result === true);
      
      try {
        if (allDishesAvailable) {
          // Tất cả món đều đủ → finished process → done
          const updatedOrders = orders.map(order => {
            if (order.id === selectedOrder.id) {
              return {
                ...order,
                status: 'done' as const,
                updated_at: dayjs().format()
              };
            }
            return order;
          });
          
          setOrders(updatedOrders);
          message.success(`Đã xác nhận hoàn thành đơn bàn #${selectedOrder.table?.number}`);
        } else {
          // Có món thiếu → finished process → not completed (với độ ưu tiên cao)
          const updatedOrders = orders.map(order => {
            if (order.id === selectedOrder.id) {
              const updatedOrderDishes = order.order_dishes.map(dish => ({
                ...dish,
                is_available: verificationResults[dish.id]
              }));
              
              return {
                ...order,
                status: 'not completed' as const,
                priority: 5, // Độ ưu tiên cao nhất
                order_dishes: updatedOrderDishes,
                updated_at: dayjs().format()
              };
            }
            return order;
          });
          
          setOrders(updatedOrders);
          message.warning(`Đơn bàn #${selectedOrder.table?.number} chưa hoàn thành - đã chuyển về danh sách ưu tiên`);
        }
        
        setIsVerifyOrderModalVisible(false);
        refetchOrders();
      } catch (error) {
        message.error('Có lỗi xảy ra khi xác minh đơn hàng');
      }
    }
  };
  
  // Lấy văn bản hiển thị cho trạng thái
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'init':
        return 'Chờ chế biến';
      case 'processing':
        return 'Đang chế biến';
      case 'finished process':
        return 'Chờ kiểm tra';
      case 'not completed':
        return 'Chưa hoàn thành';
      case 'done':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };
  
  // Lấy màu cho trạng thái
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'init':
        return 'blue';
      case 'processing':
        return 'orange';
      case 'finished process':
        return 'green';
      case 'not completed':
        return 'red';
      case 'done':
        return 'purple';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };
  
  // Lấy Icon cho trạng thái
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'init':
        return <ClockCircleOutlined />;
      case 'processing':
        return <FireOutlined />;
      case 'finished process':
        return <CheckOutlined />;
      case 'not completed':
        return <WarningOutlined />;
      case 'done':
        return <CheckCircleOutlined />;
      default:
        return <ExclamationCircleOutlined />;
    }
  };
  
  // Tính thời gian đã trôi qua từ khi đặt hàng
  const getElapsedTime = (createdAt: string): string => {
    return dayjs(createdAt).fromNow();
  };
  
  // Lấy màu background cho card theo trạng thái
  const getStatusBackgroundColor = (status: string, isHighPriority: boolean = false): string => {
    // Nếu đơn có độ ưu tiên cao (thiếu món), trả về màu cảnh báo
    if (isHighPriority || status === 'not completed') {
      return 'rgba(245, 34, 45, 0.08)'; // Đỏ nhạt cảnh báo
    }
    
    switch (status) {
      case 'init':
        return 'rgba(24, 144, 255, 0.08)'; // Xanh nhạt
      case 'processing':
        return 'rgba(250, 173, 20, 0.08)'; // Cam nhạt
      case 'finished process':
        return 'rgba(82, 196, 26, 0.08)'; // Xanh lá nhạt
      case 'done':
        return 'rgba(114, 46, 209, 0.08)'; // Tím nhạt
      default:
        return 'white';
    }
  };
  
  // Render card cho đơn hàng
  const renderOrderCard = (order: Order) => {
    const elapsedTime = getElapsedTime(order.created_at);
    const isHighPriority = order.status === 'not completed' || (order.priority !== undefined && order.priority > 3);
    
    // Tính tổng thời gian chế biến dự kiến
    const maxPrepTime = Math.max(...order.order_dishes.map(dish => dish.dish?.preparation_time || 15));
    
    return (
      <Card
        key={order.id}
        className="mb-0"
        size="small"
        style={{ 
          borderLeft: `3px solid ${getStatusColor(order.status)}`,
          backgroundColor: getStatusBackgroundColor(order.status, isHighPriority),
          height: '100%'
        }}
        title={
          <div className="flex justify-between items-center" style={{ padding: '0' }}>
            <div className="flex items-center">
              <span className="font-bold mr-2" style={{ fontSize: '16px' }}>
                Bàn #{order.table?.number}
              </span>
              {isHighPriority && (
                <Badge 
                  count="!" 
                  style={{ backgroundColor: '#f5222d' }} 
                />
              )}
            </div>
            <Space size={4}>
              <Tag color={getStatusColor(order.status)} style={{ margin: 0, padding: '0 4px', fontSize: '14px' }}>
                {getStatusIcon(order.status)} {getStatusText(order.status)}
              </Tag>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                {elapsedTime}
              </Text>
            </Space>
          </div>
        }
        bodyStyle={{ padding: '8px' }}
      >
        <List
          size="small"
          dataSource={order.order_dishes.slice(0, 3)}
          renderItem={dish => (
            <List.Item style={{ padding: '2px 0' }}>
              <div className="w-full flex justify-between items-center">
                <div className="flex items-center flex-1">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Text 
                        strong 
                        className="mr-1" 
                        style={{ 
                          fontSize: '14px',
                          textDecoration: dish.is_available === false || dish.status === 'cancelled' ? 'line-through' : 'none',
                          color: dish.is_available === false || dish.status === 'cancelled' ? '#ff4d4f' : 'inherit'
                        }}
                      >
                        {dish.dish?.name}
                      </Text>
                      <Text style={{ fontSize: '14px' }}>x{dish.quantity}</Text>
                      {dish.is_available === false && (
                        <Tag color="red" className="ml-1">Thiếu</Tag>
                      )}
                      {dish.status === 'cancelled' && (
                        <Tag color="default" className="ml-1">Đã hủy</Tag>
                      )}
                    </div>
                    {dish.note && (
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        Ghi chú: {dish.note}
                      </Text>
                    )}
                    {dish.cancelled_reason && (
                      <Text type="danger" style={{ fontSize: '12px' }}>
                        Lý do hủy: {dish.cancelled_reason}
                      </Text>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  {order.chef_name && (
                    <Tooltip title={`Đầu bếp: ${order.chef_name}`}>
                      <Avatar size="small" icon={<UserOutlined />} className="mr-2" />
                    </Tooltip>
                  )}
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    {dish.dish?.preparation_time || 15} phút
                  </Text>
                  {/* Nút hủy món riêng lẻ - chỉ hiển thị khi đơn chưa hoàn thành */}
                  {viewMode === 'kitchen' && order.status !== 'done' && order.status !== 'cancelled' && dish.status !== 'cancelled' && (
                    <Button
                      danger
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelDish(order, dish);
                      }}
                      style={{ 
                        fontSize: '10px', 
                        padding: '0 4px', 
                        height: '20px', 
                        marginLeft: '4px' 
                      }}
                    >
                      ✗
                    </Button>
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
        
        {order.order_dishes.length > 3 && (
          <div className="text-center py-1">
            <Text type="secondary" style={{ fontSize: '13px' }}>
              + {order.order_dishes.length - 3} món khác
            </Text>
          </div>
        )}
        
        {order.note && (
          <div className="mt-1">
            <Text type="secondary" style={{ fontSize: '13px' }}>Ghi chú: {order.note}</Text>
          </div>
        )}
        
        <Divider style={{ margin: '4px 0' }} />
        
        <div className="flex justify-between items-center">
          <div>
            <Space size={4}>
              <Statistic 
                title={<span style={{ fontSize: '13px' }}>Thời gian chờ</span>} 
                value={dayjs().diff(dayjs(order.created_at), 'minute')} 
                suffix="phút"
                valueStyle={{ fontSize: '14px' }}
              />
            </Space>
          </div>
          <div>
            {renderOrderActions(order)}
          </div>
        </div>
      </Card>
    );
  };
  
  // Render các action cho đơn hàng
  const renderOrderActions = (order: Order) => {
    if (order.status === 'cancelled') {
      return (
        <Tag color="default" style={{ fontSize: '12px' }}>
          Đã hủy
        </Tag>
      );
    }

    if (viewMode === 'kitchen') {
      // Hiển thị nút chức năng cho nhà bếp
      if (order.status === 'init' || order.status === 'not completed') {
        return (
          <Space size={4}>
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleStartCooking(order)}
              style={{ fontSize: '12px', padding: '0 6px', height: '24px' }}
            >
              Bắt đầu
            </Button>
            <Button 
              danger
              size="small"
              onClick={() => handleCancelOrder(order)}
              style={{ fontSize: '12px', padding: '0 6px', height: '24px' }}
            >
              Hủy
            </Button>
          </Space>
        );
      } else if (order.status === 'processing') {
        return (
          <Space size={4}>
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleFinishCooking(order)}
              style={{ fontSize: '12px', padding: '0 6px', height: '24px' }}
            >
              Hoàn thành
            </Button>
            <Button 
              danger
              size="small"
              onClick={() => handleCancelOrder(order)}
              style={{ fontSize: '12px', padding: '0 6px', height: '24px' }}
            >
              Hủy
            </Button>
          </Space>
        );
      }
    } else {
      // Hiển thị nút chức năng cho nhân viên phục vụ
      if (order.status === 'finished process') {
        return (
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleVerifyOrder(order)}
            style={{ fontSize: '12px', padding: '0 6px', height: '24px' }}
          >
            Kiểm tra
          </Button>
        );
      }
    }
    
    return null;
  };
  
  // Render danh sách đơn hàng cho mỗi tab
  const renderOrders = () => {
    if (filteredOrders.length === 0) {
      return (
        <div className="text-center py-8">
          <Text type="secondary">Không có đơn hàng nào</Text>
        </div>
      );
    }
    
    return (
      <Row gutter={[8, 8]}>
        {filteredOrders.map(order => (
          <Col xs={24} sm={12} md={12} lg={12} xl={12} key={order.id}>
            {renderOrderCard(order)}
          </Col>
        ))}
      </Row>
    );
  };
  
  // Hủy toàn bộ đơn hàng
  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setCancelReason('');
    setCancelType('out_of_stock');
    setIsCancelOrderModalVisible(true);
  };

  // Xác nhận hủy đơn hàng
  const confirmCancelOrder = async () => {
    if (selectedOrder && cancelReason.trim()) {
      try {
        const updatedOrders = orders.map(order => {
          if (order.id === selectedOrder.id) {
            return {
              ...order,
              status: 'cancelled' as const,
              cancelled_reason: `${getCancelTypeText(cancelType)}: ${cancelReason}`,
              updated_at: dayjs().format()
            };
          }
          return order;
        });
        
        setOrders(updatedOrders);
        setIsCancelOrderModalVisible(false);
        message.success(`Đã hủy đơn bàn #${selectedOrder.table?.number}`);
        refetchOrders();
      } catch (error) {
        message.error('Có lỗi xảy ra khi hủy đơn hàng');
      }
    } else {
      message.error('Vui lòng nhập lý do hủy đơn');
    }
  };

  // Hủy món cụ thể trong đơn
  const handleCancelDish = (order: Order, dish: OrderDish) => {
    setSelectedOrder(order);
    setSelectedDish(dish);
    setCancelReason('');
    setCancelType('out_of_stock');
    setIsCancelDishModalVisible(true);
  };

  // Xác nhận hủy món
  const confirmCancelDish = async () => {
    if (selectedOrder && selectedDish && cancelReason.trim()) {
      try {
        const updatedOrders = orders.map(order => {
          if (order.id === selectedOrder.id) {
            const updatedOrderDishes = order.order_dishes.map(dish => {
              if (dish.id === selectedDish.id) {
                return {
                  ...dish,
                  status: 'cancelled' as const,
                  cancelled_reason: `${getCancelTypeText(cancelType)}: ${cancelReason}`,
                  is_available: false
                };
              }
              return dish;
            });

            // Kiểm tra xem còn món nào active không
            const hasActiveDishes = updatedOrderDishes.some(dish => dish.status !== 'cancelled');
            
            return {
              ...order,
              order_dishes: updatedOrderDishes,
              status: !hasActiveDishes ? 'cancelled' as const : order.status,
              updated_at: dayjs().format()
            };
          }
          return order;
        });
        
        setOrders(updatedOrders);
        setIsCancelDishModalVisible(false);
        message.success(`Đã hủy món ${selectedDish.dish?.name} trong đơn bàn #${selectedOrder.table?.number}`);
        refetchOrders();
      } catch (error) {
        message.error('Có lỗi xảy ra khi hủy món');
      }
    } else {
      message.error('Vui lòng nhập lý do hủy món');
    }
  };

  // Lấy text cho loại hủy
  const getCancelTypeText = (type: string): string => {
    switch (type) {
      case 'out_of_stock':
        return 'Hết hàng';
      case 'kitchen_issue':
        return 'Sự cố bếp';
      case 'customer_request':
        return 'Yêu cầu khách hàng';
      case 'other':
        return 'Khác';
      default:
        return 'Khác';
    }
  };
  
  return (
    <Spin spinning={loading}>
      <Card className="m-4" bodyStyle={{ padding: isMobile ? '12px' : '16px' }}>
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <Title level={4} style={{ margin: 0 }}>Bảng điều khiển bếp</Title>
            <Radio.Group 
              value={viewMode} 
              onChange={e => setViewMode(e.target.value)}
              optionType="button" 
              buttonStyle="solid"
              size="middle"
            >
              <Radio.Button value="kitchen">Đầu bếp</Radio.Button>
              <Radio.Button value="server">Phục vụ</Radio.Button>
            </Radio.Group>
          </div>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {viewMode === 'kitchen' 
              ? 'Quản lý đơn gọi món và trạng thái chế biến' 
              : 'Kiểm tra và xác nhận món ăn đã hoàn thành'}
          </Text>
        </div>
        
        <div className="mb-2">
          <Row gutter={[8, 8]}>
            <Col xs={8} sm={6} md={4} lg={4}>
              <Card size="small" bodyStyle={{ padding: '8px' }}>
                <Statistic 
                  title={<span style={{ fontSize: '13px' }}>Chờ chế biến</span>} 
                  value={orderCounts.init} 
                  valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={8} sm={6} md={4} lg={4}>
              <Card size="small" bodyStyle={{ padding: '8px' }}>
                <Statistic 
                  title={<span style={{ fontSize: '13px' }}>Đang chế biến</span>} 
                  value={orderCounts.processing} 
                  valueStyle={{ color: '#faad14', fontSize: '18px' }}
                  prefix={<FireOutlined />}
                />
              </Card>
            </Col>
            <Col xs={8} sm={6} md={4} lg={4}>
              <Card size="small" bodyStyle={{ padding: '8px' }}>
                <Statistic 
                  title={<span style={{ fontSize: '13px' }}>Chờ kiểm tra</span>} 
                  value={orderCounts.finished_process} 
                  valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                  prefix={<CheckOutlined />}
                />
              </Card>
            </Col>
            <Col xs={8} sm={6} md={4} lg={4}>
              <Card size="small" bodyStyle={{ padding: '8px' }}>
                <Statistic 
                  title={<span style={{ fontSize: '13px' }}>Chưa hoàn thành</span>} 
                  value={orderCounts.not_completed} 
                  valueStyle={{ color: '#f5222d', fontSize: '18px' }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
            <Col xs={8} sm={6} md={4} lg={4}>
              <Card size="small" bodyStyle={{ padding: '8px' }}>
                <Statistic 
                  title={<span style={{ fontSize: '13px' }}>Hoàn thành</span>} 
                  value={orderCounts.done} 
                  valueStyle={{ color: '#722ed1', fontSize: '18px' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={8} sm={6} md={4} lg={4}>
              <Card size="small" bodyStyle={{ padding: '8px' }}>
                <Statistic 
                  title={<span style={{ fontSize: '13px' }}>Đã hủy</span>} 
                  value={orderCounts.cancelled} 
                  valueStyle={{ color: '#8c8c8c', fontSize: '18px' }}
                  prefix={<CloseOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </div>
        
        <Divider style={{ margin: '8px 0' }} />
        
        <div className="mb-2 flex justify-between items-center flex-wrap">
          <Space wrap className="mb-2">
            <Input 
              placeholder="Tìm kiếm theo bàn hoặc món" 
              prefix={<SearchOutlined />}
              style={{ width: isMobile ? '100%' : 200 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              size="middle"
            />
          </Space>
          
          <div>
            <Text style={{ fontSize: '14px' }}>Tự động làm mới: </Text>
            <Tag color="processing" style={{ margin: 0, fontSize: '14px' }}>30 giây</Tag>
          </div>
        </div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="middle"
          tabBarStyle={{ marginBottom: '8px' }}
          tabBarExtraContent={
            <Badge 
              count={orderCounts.init + orderCounts.not_completed} 
              offset={[-10, 0]}
              style={{ display: (orderCounts.init + orderCounts.not_completed) > 0 ? 'block' : 'none' }}
            >
              <BellOutlined style={{ fontSize: 18, color: '#1890ff' }} />
            </Badge>
          }
        >
          {viewMode === 'kitchen' ? (
            <>
              <TabPane 
                tab={
                  <span>
                    <ClockCircleOutlined /> Chờ chế biến ({orderCounts.init})
                  </span>
                } 
                key="init"
              >
                {renderOrders()}
              </TabPane>
              <TabPane 
                tab={
                  <span>
                    <FireOutlined /> Đang chế biến ({orderCounts.processing})
                  </span>
                } 
                key="processing"
              >
                {renderOrders()}
              </TabPane>
              <TabPane 
                tab={
                  <span>
                    <WarningOutlined /> Chưa hoàn thành ({orderCounts.not_completed})
                  </span>
                } 
                key="not_completed"
              >
                {renderOrders()}
              </TabPane>
            </>
          ) : (
            <>
              <TabPane 
                tab={
                  <span>
                    <CheckOutlined /> Chờ kiểm tra ({orderCounts.finished_process})
                  </span>
                } 
                key="finished_process"
              >
                {renderOrders()}
              </TabPane>
              <TabPane 
                tab={
                  <span>
                    <CheckCircleOutlined /> Hoàn thành ({orderCounts.done})
                  </span>
                } 
                key="done"
              >
                {renderOrders()}
              </TabPane>
            </>
          )}
          
          <TabPane 
            tab={
              <span>
                <HistoryOutlined /> Tất cả ({orderCounts.all})
              </span>
            } 
            key="all"
          >
            {renderOrders()}
          </TabPane>
          <TabPane 
            tab={
              <span>
                <CloseOutlined /> Đã hủy ({orderCounts.cancelled})
              </span>
            } 
            key="cancelled"
          >
            {renderOrders()}
          </TabPane>
        </Tabs>
        
        {/* Modal xác nhận bắt đầu chế biến */}
        <Modal
          title="Bắt đầu chế biến đơn gọi món"
          open={isStartCookingModalVisible}
          onOk={confirmStartCooking}
          onCancel={() => setIsStartCookingModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
          width={400}
        >
          {selectedOrder && (
            <>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <Text strong>Bàn #{selectedOrder.table?.number}</Text>
                  <Text>{dayjs(selectedOrder.created_at).format('HH:mm:ss DD/MM/YYYY')}</Text>
                </div>
                
                <div className="text-sm mb-2">
                  <Text type="secondary">
                    Thời gian chờ: {dayjs().diff(dayjs(selectedOrder.created_at), 'minute')} phút
                  </Text>
                </div>
                
                {selectedOrder.status === 'not completed' && (
                  <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
                    <Text type="danger">
                      ⚠️ Đơn này đã được chế biến trước đó nhưng chưa hoàn thành. Vui lòng kiểm tra kỹ các món bị thiếu.
                    </Text>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <Text strong>Chọn đầu bếp phụ trách:</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Chọn đầu bếp"
                  value={assignedChef}
                  onChange={setAssignedChef}
                >
                  {chefs.map(chef => (
                    <Option key={chef.id} value={chef.id}>
                      <div className="flex items-center">
                        <Avatar size="small" src={chef.avatar} icon={<UserOutlined />} className="mr-2" />
                        <Text>{chef.name}</Text>
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>
              
              <List
                size="small"
                header={<div className="font-bold">Danh sách món cần chế biến:</div>}
                bordered
                dataSource={selectedOrder.order_dishes}
                renderItem={dish => (
                  <List.Item>
                    <div className="flex justify-between w-full">
                      <Text 
                        style={{ 
                          textDecoration: dish.is_available === false ? 'line-through' : 'none',
                          color: dish.is_available === false ? '#ff4d4f' : 'inherit'
                        }}
                      >
                        {dish.dish?.name} x{dish.quantity}
                        {dish.is_available === false && (
                          <Tag color="red" className="ml-1">Đã thiếu lần trước</Tag>
                        )}
                      </Text>
                      <Text type="secondary">{dish.dish?.preparation_time || 15} phút</Text>
                    </div>
                  </List.Item>
                )}
              />
              
              {selectedOrder.note && (
                <div className="mt-2">
                  <Text type="secondary">Ghi chú đơn: {selectedOrder.note}</Text>
                </div>
              )}
            </>
          )}
        </Modal>
        
        {/* Modal xác nhận hoàn thành chế biến */}
        <Modal
          title="Xác nhận hoàn thành chế biến"
          open={isFinishCookingModalVisible}
          onOk={confirmFinishCooking}
          onCancel={() => setIsFinishCookingModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
          width={400}
        >
          {selectedOrder && (
            <>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <Text strong>Bàn #{selectedOrder.table?.number}</Text>
                  <Text>{dayjs(selectedOrder.created_at).format('HH:mm:ss DD/MM/YYYY')}</Text>
                </div>
                
                <div className="text-sm mb-2">
                  <Text type="secondary">
                    Thời gian chế biến: {dayjs().diff(dayjs(selectedOrder.updated_at), 'minute')} phút
                  </Text>
                </div>
              </div>
              
              <List
                size="small"
                header={<div className="font-bold">Danh sách món đã hoàn thành:</div>}
                bordered
                dataSource={selectedOrder.order_dishes}
                renderItem={dish => (
                  <List.Item>
                    <div className="flex justify-between w-full">
                      <Text>{dish.dish?.name} x{dish.quantity}</Text>
                      {selectedOrder.chef_name && (
                        <div className="flex items-center">
                          <Avatar size="small" icon={<UserOutlined />} className="mr-1" />
                          <Text type="secondary">{selectedOrder.chef_name}</Text>
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
              
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <Text>
                  ✅ Tất cả món ăn đã được chế biến xong và sẵn sàng để nhân viên phục vụ kiểm tra.
                </Text>
              </div>
            </>
          )}
        </Modal>
        
        {/* Modal xác minh đơn hàng (nhân viên phục vụ) */}
        <Modal
          title="Kiểm tra và xác nhận đơn hàng"
          open={isVerifyOrderModalVisible}
          onOk={confirmVerifyOrder}
          onCancel={() => setIsVerifyOrderModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
          width={600}
        >
          {selectedOrder && (
            <>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <Text strong>Bàn #{selectedOrder.table?.number}</Text>
                  <Text>{dayjs(selectedOrder.created_at).format('HH:mm:ss DD/MM/YYYY')}</Text>
                </div>
                
                <div className="mb-2">
                  <Text>
                    Vui lòng kiểm tra từng món ăn và đánh dấu những món đã có đủ:
                  </Text>
                </div>

                {/* Nút chọn tất cả */}
                <div className="mb-3 flex gap-2">
                  <Button
                    size="small"
                    onClick={() => {
                      const allAvailable: {[key: number]: boolean} = {};
                      selectedOrder.order_dishes.forEach(dish => {
                        allAvailable[dish.id] = true;
                      });
                      setVerificationResults(allAvailable);
                    }}
                  >
                    ✓ Chọn tất cả đủ
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      const allUnavailable: {[key: number]: boolean} = {};
                      selectedOrder.order_dishes.forEach(dish => {
                        allUnavailable[dish.id] = false;
                      });
                      setVerificationResults(allUnavailable);
                    }}
                  >
                    ✗ Chọn tất cả thiếu
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      const mixed: {[key: number]: boolean} = {};
                      selectedOrder.order_dishes.forEach(dish => {
                        mixed[dish.id] = dish.is_available !== false;
                      });
                      setVerificationResults(mixed);
                    }}
                  >
                    🔄 Reset
                  </Button>
                </div>
              </div>
              
              <List
                size="small"
                bordered
                dataSource={selectedOrder.order_dishes}
                renderItem={dish => (
                  <List.Item
                    style={{
                      backgroundColor: verificationResults[dish.id] === true 
                        ? 'rgba(82, 196, 26, 0.1)' 
                        : verificationResults[dish.id] === false 
                          ? 'rgba(245, 34, 45, 0.1)' 
                          : 'white'
                    }}
                  >
                    <div className="flex justify-between w-full items-center">
                      <div className="flex items-center flex-1">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Text strong style={{ fontSize: '16px' }}>
                              {dish.dish?.name}
                            </Text>
                            <Tag color="blue" style={{ marginLeft: '8px' }}>
                              x{dish.quantity}
                            </Tag>
                          </div>
                          {dish.note && (
                            <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: '4px' }}>
                              Ghi chú: {dish.note}
                            </Text>
                          )}
                          {dish.is_available === false && (
                            <Text type="danger" style={{ fontSize: '13px', display: 'block', marginTop: '4px' }}>
                              ⚠️ Món này đã bị thiếu lần trước
                            </Text>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Radio.Group
                          value={verificationResults[dish.id]}
                          onChange={e => handleDishVerification(dish.id, e.target.value)}
                          size="small"
                        >
                          <Radio.Button 
                            value={true} 
                            style={{ 
                              color: verificationResults[dish.id] === true ? '#fff' : '#52c41a',
                              backgroundColor: verificationResults[dish.id] === true ? '#52c41a' : 'transparent',
                              borderColor: '#52c41a'
                            }}
                          >
                            ✓ Đủ
                          </Radio.Button>
                          <Radio.Button 
                            value={false} 
                            style={{ 
                              color: verificationResults[dish.id] === false ? '#fff' : '#ff4d4f',
                              backgroundColor: verificationResults[dish.id] === false ? '#ff4d4f' : 'transparent',
                              borderColor: '#ff4d4f'
                            }}
                          >
                            ✗ Thiếu
                          </Radio.Button>
                        </Radio.Group>
                      </div>
                    </div>
                  </List.Item>
                )}
              />

              {/* Thông tin tổng kết */}
              <div className="mt-3">
                {(() => {
                  const availableCount = Object.values(verificationResults).filter(v => v === true).length;
                  const unavailableCount = Object.values(verificationResults).filter(v => v === false).length;
                  const totalCount = selectedOrder.order_dishes.length;
                  
                  return (
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <Text strong>Tổng kết: </Text>
                        <Tag color="green">{availableCount} đủ</Tag>
                        <Tag color="red">{unavailableCount} thiếu</Tag>
                        <Tag color="default">{totalCount - availableCount - unavailableCount} chưa chọn</Tag>
                      </div>
                      <div>
                        {availableCount === totalCount && (
                          <Tag color="success" style={{ fontSize: '14px' }}>
                            🎉 Tất cả món đều đủ!
                          </Tag>
                        )}
                        {unavailableCount > 0 && (
                          <Tag color="warning" style={{ fontSize: '14px' }}>
                            ⚠️ Có {unavailableCount} món thiếu
                          </Tag>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <Text type="warning">
                  ⚠️ Nếu có món thiếu, đơn hàng sẽ được chuyển về danh sách ưu tiên để bếp làm lại.
                  Những món thiếu sẽ không được tính tiền trong hóa đơn cuối cùng.
                </Text>
              </div>
            </>
          )}
        </Modal>
        
        {/* Modal hủy đơn hàng */}
        <Modal
          title="Hủy đơn hàng"
          open={isCancelOrderModalVisible}
          onOk={confirmCancelOrder}
          onCancel={() => {
            setIsCancelOrderModalVisible(false);
            setCancelReason('');
            setCancelType('out_of_stock');
          }}
          okText="Xác nhận hủy"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          width={500}
        >
          {selectedOrder && (
            <>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <Text strong>Bàn #{selectedOrder.table?.number}</Text>
                  <Text>{dayjs(selectedOrder.created_at).format('HH:mm:ss DD/MM/YYYY')}</Text>
                </div>
                
                <div className="p-3 bg-red-50 border border-red-200 rounded mb-3">
                  <Text type="danger" strong>
                    ⚠️ Bạn có chắc chắn muốn hủy toàn bộ đơn hàng này?
                  </Text>
                  <br />
                  <Text type="secondary">
                    Hành động này không thể hoàn tác và sẽ ảnh hưởng đến hóa đơn của khách hàng.
                  </Text>
                </div>
              </div>
              
              <div className="mb-4">
                <Text strong>Lý do hủy đơn:</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Chọn lý do hủy"
                  value={cancelType}
                  onChange={setCancelType}
                >
                  <Option value="out_of_stock">🍽️ Hết hàng/Không có nguyên liệu</Option>
                  <Option value="kitchen_issue">🔥 Sự cố bếp/Thiết bị</Option>
                  <Option value="customer_request">👤 Yêu cầu khách hàng</Option>
                  <Option value="other">❓ Lý do khác</Option>
                </Select>
              </div>
              
              <div className="mb-4">
                <Text strong>Chi tiết lý do:</Text>
                <Input.TextArea
                  rows={3}
                  style={{ marginTop: 8 }}
                  placeholder="Nhập mô tả chi tiết lý do hủy đơn..."
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                />
              </div>
              
              <List
                size="small"
                header={<div className="font-bold">Danh sách món sẽ bị hủy:</div>}
                bordered
                dataSource={selectedOrder.order_dishes}
                renderItem={dish => (
                  <List.Item>
                    <div className="flex justify-between w-full">
                      <Text>{dish.dish?.name} x{dish.quantity}</Text>
                      <Text type="secondary">{dish.price_at_order_time.toLocaleString('vi-VN')} VNĐ</Text>
                    </div>
                  </List.Item>
                )}
              />
            </>
          )}
        </Modal>

        {/* Modal hủy món cụ thể */}
        <Modal
          title="Hủy món ăn"
          open={isCancelDishModalVisible}
          onOk={confirmCancelDish}
          onCancel={() => {
            setIsCancelDishModalVisible(false);
            setCancelReason('');
            setCancelType('out_of_stock');
          }}
          okText="Xác nhận hủy"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          width={400}
        >
          {selectedOrder && selectedDish && (
            <>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <Text strong>Bàn #{selectedOrder.table?.number}</Text>
                  <Text>{dayjs(selectedOrder.created_at).format('HH:mm:ss DD/MM/YYYY')}</Text>
                </div>
                
                <div className="p-3 bg-orange-50 border border-orange-200 rounded mb-3">
                  <Text type="warning" strong>
                    ⚠️ Hủy món: {selectedDish.dish?.name} x{selectedDish.quantity}
                  </Text>
                  <br />
                  <Text type="secondary">
                    Món này sẽ không được tính tiền trong hóa đơn cuối cùng.
                  </Text>
                </div>
              </div>
              
              <div className="mb-4">
                <Text strong>Lý do hủy món:</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Chọn lý do hủy"
                  value={cancelType}
                  onChange={setCancelType}
                >
                  <Option value="out_of_stock">🍽️ Hết hàng/Không có nguyên liệu</Option>
                  <Option value="kitchen_issue">🔥 Sự cố trong quá trình chế biến</Option>
                  <Option value="customer_request">👤 Khách hàng yêu cầu hủy</Option>
                  <Option value="other">❓ Lý do khác</Option>
                </Select>
              </div>
              
              <div className="mb-4">
                <Text strong>Chi tiết lý do:</Text>
                <Input.TextArea
                  rows={2}
                  style={{ marginTop: 8 }}
                  placeholder="Nhập mô tả chi tiết..."
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                />
              </div>
            </>
          )}
        </Modal>
      </Card>
    </Spin>
  );
};

export default KitchenDashboard; 