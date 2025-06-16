import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Tag, Input, Select, Row, Col, Tabs, Typography, List, Space, Badge, Modal, message, Spin, Divider, Statistic, Avatar, Tooltip, Checkbox, Radio } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router';
import { CheckOutlined, ClockCircleOutlined, FireOutlined, SearchOutlined, BellOutlined, HistoryOutlined, CloseOutlined, UserOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { confirm } = Modal;

// Định nghĩa kiểu dữ liệu
interface Dish {
  id: number;
  name: string;
  price: number;
  category_id: number;
  preparation_time: number; // Thời gian chế biến (phút)
}

interface OrderItem {
  id: number;
  order_id: number;
  dish_id: number;
  dish_name: string;
  quantity: number;
  unit_price: number;
  status: 'pending' | 'processing' | 'completed' | 'served' | 'cancelled';
  created_at: string;
  updated_at: string;
  preparation_time: number; // Thời gian chế biến (phút)
  notes?: string;
  is_checked?: boolean; // Để nhân viên phục vụ đánh dấu đã kiểm tra
  chef_id?: number; // ID của đầu bếp được giao món này
  chef_name?: string; // Tên đầu bếp
}

interface Order {
  id: number;
  bill_id: number;
  table_number: number;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'partially_completed' | 'completed' | 'served' | 'cancelled';
  priority: number; // Độ ưu tiên: càng cao càng ưu tiên
  created_at: string;
  updated_at: string;
  notes?: string;
  server_id?: number; // ID của nhân viên phục vụ
  server_name?: string; // Tên nhân viên phục vụ
}

// Định nghĩa nhân viên bếp
interface Staff {
  id: number;
  name: string;
  role: 'chef' | 'server' | 'manager';
  avatar?: string;
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
      preparation_time: Math.floor(Math.random() * 15) + 5 // 5-20 phút
    });
  }

  return dishes;
};

// Tạo dữ liệu mẫu cho nhân viên
const generateFakeStaff = (): Staff[] => {
  return [
    { id: 1, name: 'Nguyễn Văn A', role: 'chef', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Trần Thị B', role: 'chef', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Lê Văn C', role: 'server', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 4, name: 'Phạm Thị D', role: 'server', avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: 5, name: 'Hoàng Văn E', role: 'manager', avatar: 'https://i.pravatar.cc/150?img=5' },
  ];
};

// Tạo dữ liệu mẫu cho đơn hàng
const generateFakeOrders = (): Order[] => {
  const allDishes = generateFakeDishes();
  const allStaff = generateFakeStaff();
  const chefs = allStaff.filter(staff => staff.role === 'chef');
  const servers = allStaff.filter(staff => staff.role === 'server');
  const orders: Order[] = [];
  
  for (let i = 1; i <= 12; i++) {
    const items: OrderItem[] = [];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const usedDishIds = new Set<number>();
    const randomServer = servers[Math.floor(Math.random() * servers.length)];
    
    for (let j = 0; j < itemCount; j++) {
      let dishId;
      do {
        dishId = Math.floor(Math.random() * allDishes.length) + 1;
      } while (usedDishIds.has(dishId));
      
      usedDishIds.add(dishId);
      const dish = allDishes.find(d => d.id === dishId);
      const randomChef = chefs[Math.floor(Math.random() * chefs.length)];
      
      if (dish) {
        let status: OrderItem['status'] = 'pending';
        let is_checked = false;
        
        // Phân bố trạng thái
        if (i <= 3) {
          status = 'pending'; // 3 đơn đang chờ
        } else if (i <= 6) {
          status = 'processing'; // 3 đơn đang chế biến
        } else if (i <= 9) {
          status = 'completed'; // 3 đơn đã hoàn thành, chờ phục vụ
        } else {
          status = 'served'; // 3 đơn đã phục vụ
          is_checked = true;
        }
        
        // Tạo thời gian đặt món
        let createdTime;
        if (status === 'pending') {
          createdTime = dayjs().subtract(Math.floor(Math.random() * 10) + 1, 'minute');
        } else if (status === 'processing') {
          createdTime = dayjs().subtract(Math.floor(Math.random() * 20) + 10, 'minute');
        } else if (status === 'completed') {
          createdTime = dayjs().subtract(Math.floor(Math.random() * 30) + 30, 'minute');
        } else {
          createdTime = dayjs().subtract(Math.floor(Math.random() * 60) + 60, 'minute');
        }
        
        items.push({
          id: j + 1,
          order_id: i,
          dish_id: dish.id,
          dish_name: dish.name,
          quantity: Math.floor(Math.random() * 3) + 1,
          unit_price: dish.price,
          status: status,
          created_at: createdTime.format(),
          updated_at: dayjs().subtract(Math.floor(Math.random() * 5), 'minute').format(),
          preparation_time: dish.preparation_time,
          notes: Math.random() > 0.7 ? `Ghi chú cho món ${dish.name}` : undefined,
          is_checked: is_checked,
          chef_id: status !== 'pending' ? randomChef.id : undefined,
          chef_name: status !== 'pending' ? randomChef.name : undefined
        });
      }
    }
    
    // Tính trạng thái của đơn hàng dựa trên trạng thái của các món
    let orderStatus: Order['status'] = 'pending';
    const hasCompleted = items.some(item => item.status === 'completed');
    const hasPending = items.some(item => item.status === 'pending');
    const hasProcessing = items.some(item => item.status === 'processing');
    const hasServed = items.some(item => item.status === 'served');
    
    if (hasServed && items.every(item => item.status === 'served')) {
      orderStatus = 'served';
    } else if (hasCompleted && items.every(item => item.status === 'completed')) {
      orderStatus = 'completed';
    } else if (hasProcessing && items.every(item => item.status === 'processing')) {
      orderStatus = 'processing';
    } else if (hasCompleted || hasProcessing) {
      orderStatus = 'partially_completed';
    }
    
    orders.push({
      id: i,
      bill_id: 1000 + i,
      table_number: Math.floor(Math.random() * 20) + 1,
      items: items,
      status: orderStatus,
      priority: i <= 3 ? 3 : (i <= 6 ? 2 : 1), // Các đơn pending có ưu tiên cao nhất
      created_at: items[0]?.created_at || dayjs().format(),
      updated_at: items[0]?.updated_at || dayjs().format(),
      notes: Math.random() > 0.7 ? 'Ghi chú cho đơn hàng này' : undefined,
      server_id: randomServer.id,
      server_name: randomServer.name
    });
  }
  
  return orders;
};

const KitchenDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [chefs, setChefs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [isStartCookingModalVisible, setIsStartCookingModalVisible] = useState(false);
  const [isCompleteCookingModalVisible, setIsCompleteCookingModalVisible] = useState(false);
  const [isServeOrderModalVisible, setIsServeOrderModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignedChef, setAssignedChef] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'kitchen' | 'server'>('kitchen');
  const [errorItems, setErrorItems] = useState<OrderItem[]>([]);
  
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
        
        const ordersData = generateFakeOrders();
        const chefsData = generateFakeStaff().filter(staff => staff.role === 'chef');
        setOrders(ordersData);
        setChefs(chefsData);
      } catch (error) {
        message.error('Có lỗi xảy ra khi tải dữ liệu');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Giả lập cập nhật dữ liệu realtime
    const intervalId = setInterval(() => {
      setOrders(prevOrders => {
        // Random cập nhật trạng thái một đơn
        if (prevOrders.length > 0) {
          const randomIndex = Math.floor(Math.random() * prevOrders.length);
          const newOrders = [...prevOrders];
          const order = { ...newOrders[randomIndex] };
          
          // Chỉ cập nhật nếu trạng thái chưa phải là served
          if (order.status !== 'served' && order.status !== 'cancelled') {
            let newStatus: Order['status'] = order.status;
            
            // Xác định trạng thái mới
            if (order.status === 'pending') {
              newStatus = 'processing';
            } else if (order.status === 'processing' || order.status === 'partially_completed') {
              newStatus = 'completed';
            }
            
            // Cập nhật trạng thái của đơn hàng
            if (newStatus !== order.status) {
              order.status = newStatus;
              order.updated_at = dayjs().format();
              
              // Cập nhật trạng thái của tất cả các món trong đơn
              const statusMap: Record<string, OrderItem['status']> = {
                'processing': 'processing',
                'completed': 'completed'
              };
              
              if (statusMap[newStatus]) {
                order.items = order.items.map(item => ({
                  ...item,
                  status: statusMap[newStatus] as OrderItem['status'],
                  updated_at: dayjs().format()
                }));
              }
              
              newOrders[randomIndex] = order;
              
              // Hiển thị thông báo
              message.info(`Đơn bàn #${order.table_number} đã chuyển sang trạng thái ${getStatusText(newStatus)}`);
            }
          }
          
          return newOrders;
        }
        return prevOrders;
      });
    }, 45000); // 45 giây
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Lọc đơn hàng theo tab và tìm kiếm
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    
    // Lọc theo tab
    if (activeTab !== 'all') {
      result = result.filter(order => {
        switch (activeTab) {
          case 'pending':
            return order.status === 'pending';
          case 'processing':
            return order.status === 'processing' || order.status === 'partially_completed';
          case 'completed':
            return order.status === 'completed';
          case 'served':
            return order.status === 'served';
          default:
            return true;
        }
      });
    }
    
    // Lọc theo tìm kiếm
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(order => 
        order.table_number.toString().includes(lowerSearchText) ||
        order.items.some(item => item.dish_name.toLowerCase().includes(lowerSearchText))
      );
    }
    
    // Sắp xếp theo ưu tiên (cao đến thấp) và thời gian (cũ đến mới)
    result.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return dayjs(a.created_at).diff(dayjs(b.created_at));
    });
    
    return result;
  }, [orders, activeTab, searchText]);
  
  // Số lượng đơn theo trạng thái
  const orderCounts = useMemo(() => {
    const counts = {
      pending: 0,
      processing: 0,
      completed: 0,
      served: 0,
      all: orders.length
    };
    
    orders.forEach(order => {
      if (order.status === 'pending') {
        counts.pending++;
      } else if (order.status === 'processing' || order.status === 'partially_completed') {
        counts.processing++;
      } else if (order.status === 'completed') {
        counts.completed++;
      } else if (order.status === 'served') {
        counts.served++;
      }
    });
    
    return counts;
  }, [orders]);
  
  // Bắt đầu chế biến đơn
  const handleStartCooking = (order: Order) => {
    setSelectedOrder(order);
    setAssignedChef(undefined);
    setIsStartCookingModalVisible(true);
  };
  
  // Xác nhận bắt đầu chế biến
  const confirmStartCooking = () => {
    if (selectedOrder) {
      const chef = chefs.find(c => c.id === assignedChef);
      
      if (!assignedChef || !chef) {
        message.error('Vui lòng chọn đầu bếp phụ trách');
        return;
      }
      
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          const updatedItems = order.items.map(item => ({
            ...item,
            status: 'processing' as const,
            updated_at: dayjs().format(),
            chef_id: chef.id,
            chef_name: chef.name
          }));
          
          return {
            ...order,
            status: 'processing' as Order['status'],
            updated_at: dayjs().format(),
            items: updatedItems
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      setIsStartCookingModalVisible(false);
      message.success(`Đã bắt đầu chế biến đơn bàn #${selectedOrder.table_number}`);
    }
  };
  
  // Hoàn thành chế biến đơn
  const handleCompleteCooking = (order: Order) => {
    setSelectedOrder(order);
    setIsCompleteCookingModalVisible(true);
  };
  
  // Xác nhận hoàn thành chế biến
  const confirmCompleteCooking = () => {
    if (selectedOrder) {
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          const updatedItems = order.items.map(item => ({
            ...item,
            status: 'completed' as const,
            updated_at: dayjs().format()
          }));
          
          return {
            ...order,
            status: 'completed' as Order['status'],
            updated_at: dayjs().format(),
            items: updatedItems
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      setIsCompleteCookingModalVisible(false);
      message.success(`Đã hoàn thành chế biến đơn bàn #${selectedOrder.table_number}`);
    }
  };
  
  // Xác nhận món ăn trước khi phục vụ
  const handleServeOrder = (order: Order) => {
    // Reset danh sách món lỗi
    setErrorItems([]);
    
    // Reset trạng thái kiểm tra cho tất cả các món
    const resetOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        is_checked: false
      }))
    };
    
    setSelectedOrder(resetOrder);
    setIsServeOrderModalVisible(true);
  };
  
  // Đánh dấu món ăn đã kiểm tra
  const handleCheckItem = (item: OrderItem, checked: boolean) => {
    if (selectedOrder) {
      const updatedItems = selectedOrder.items.map(i => 
        i.id === item.id ? { ...i, is_checked: checked } : i
      );
      
      setSelectedOrder({
        ...selectedOrder,
        items: updatedItems
      });
    }
  };
  
  // Xác nhận phục vụ đơn hàng
  const confirmServeOrder = () => {
    if (selectedOrder) {
      // Kiểm tra xem tất cả các món đã được đánh dấu chưa
      const uncheckedItems = selectedOrder.items.filter(item => !item.is_checked);
      
      if (uncheckedItems.length > 0) {
        setErrorItems(uncheckedItems);
        message.error('Vui lòng kiểm tra tất cả các món trước khi phục vụ');
        return;
      }
      
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          const updatedItems = order.items.map(item => ({
            ...item,
            status: 'served' as const,
            updated_at: dayjs().format(),
            is_checked: true
          }));
          
          return {
            ...order,
            status: 'served' as Order['status'],
            updated_at: dayjs().format(),
            items: updatedItems
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      setIsServeOrderModalVisible(false);
      message.success(`Đã xác nhận phục vụ đơn bàn #${selectedOrder.table_number}`);
    }
  };
  
  // Hủy đơn hàng
  const handleCancelOrder = (order: Order) => {
    confirm({
      title: 'Xác nhận hủy đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn hủy đơn hàng bàn #${order.table_number}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
        const updatedOrders = orders.map(o => {
          if (o.id === order.id) {
            const updatedItems = o.items.map(item => ({
              ...item,
              status: 'cancelled' as const,
              updated_at: dayjs().format()
            }));
            
            return {
              ...o,
              status: 'cancelled' as Order['status'],
              updated_at: dayjs().format(),
              items: updatedItems
            };
          }
          return o;
        });
        
        setOrders(updatedOrders);
        message.success(`Đã hủy đơn hàng bàn #${order.table_number}`);
      }
    });
  };
  
  // Lấy văn bản hiển thị cho trạng thái
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Đang chờ';
      case 'processing':
        return 'Đang chế biến';
      case 'partially_completed':
        return 'Đang chế biến';
      case 'completed':
        return 'Hoàn thành';
      case 'served':
        return 'Đã phục vụ';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };
  
  // Lấy màu cho trạng thái
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'blue';
      case 'processing':
        return 'orange';
      case 'partially_completed':
        return 'orange';
      case 'completed':
        return 'green';
      case 'served':
        return 'purple';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };
  
  // Lấy Icon cho trạng thái
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined />;
      case 'processing':
      case 'partially_completed':
        return <FireOutlined />;
      case 'completed':
        return <CheckOutlined />;
      case 'served':
        return <CheckCircleOutlined />;
      case 'cancelled':
        return <CloseOutlined />;
      default:
        return <ExclamationCircleOutlined />;
    }
  };
  
  // Tính thời gian đã trôi qua từ khi đặt hàng
  const getElapsedTime = (createdAt: string): string => {
    return dayjs(createdAt).fromNow();
  };
  
  // Lấy màu background cho card theo trạng thái
  const getStatusBackgroundColor = (status: string, isDelayed: boolean = false): string => {
    // Nếu đơn đang bị delay, trả về màu cảnh báo
    if (isDelayed) {
      return 'rgba(245, 34, 45, 0.08)'; // Đỏ nhạt cảnh báo
    }
    
    switch (status) {
      case 'pending':
        return 'rgba(24, 144, 255, 0.08)'; // Xanh nhạt
      case 'processing':
      case 'partially_completed':
        return 'rgba(250, 173, 20, 0.08)'; // Cam nhạt
      case 'completed':
        return 'rgba(82, 196, 26, 0.08)'; // Xanh lá nhạt
      case 'served':
        return 'rgba(114, 46, 209, 0.08)'; // Tím nhạt
      case 'cancelled':
        return 'rgba(245, 34, 45, 0.08)'; // Đỏ nhạt
      default:
        return 'white';
    }
  };
  
  // Render card cho đơn hàng
  const renderOrderCard = (order: Order) => {
    // Tính thời gian đã trôi qua
    const elapsedTime = getElapsedTime(order.created_at);
    
    // Tính tổng thời gian chế biến dự kiến (lấy món có thời gian lâu nhất)
    const maxPrepTime = Math.max(...order.items.map(item => item.preparation_time));
    
    // Kiểm tra xem đơn có đang chậm không (đã chờ quá thời gian chế biến dự kiến)
    const isDelayed = order.status === 'pending' && dayjs().diff(dayjs(order.created_at), 'minute') > maxPrepTime;
    
    // Phiên bản gọn hơn của card
    return (
      <Card
        key={order.id}
        className="mb-0"
        size="small"
        style={{ 
          borderLeft: `3px solid ${isDelayed ? '#f5222d' : getStatusColor(order.status)}`,
          backgroundColor: getStatusBackgroundColor(order.status, isDelayed),
          height: '100%'
        }}
        title={
          <div className="flex justify-between items-center" style={{ padding: '0' }}>
            <div className="flex items-center">
              <span className="font-bold mr-2" style={{ fontSize: '16px' }}>Bàn #{order.table_number}</span>
              {isDelayed && (
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
          dataSource={order.items.slice(0, 3)} // Giới hạn hiển thị tối đa 3 món
          renderItem={item => (
            <List.Item
              style={{ padding: '2px 0' }}
              className={errorItems.some(err => err.id === item.id) ? 'bg-red-50' : ''}
            >
              <div className="w-full flex justify-between items-center">
                <div className="flex items-center">
                  {viewMode === 'server' && order.status === 'completed' && (
                    <Checkbox 
                      checked={item.is_checked} 
                      onChange={e => handleCheckItem(item, e.target.checked)}
                      className="mr-2"
                    />
                  )}
                  <div>
                    <div className="flex items-center">
                      <Text strong className="mr-1" style={{ fontSize: '14px' }}>{item.dish_name}</Text>
                      <Text style={{ fontSize: '14px' }}>x{item.quantity}</Text>
                    </div>
                    {item.notes && (
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        Ghi chú: {item.notes}
                      </Text>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  {item.chef_name && (
                    <Tooltip title={`Đầu bếp: ${item.chef_name}`}>
                      <Avatar size="small" icon={<UserOutlined />} className="mr-2" />
                    </Tooltip>
                  )}
                  <Text type="secondary" style={{ fontSize: '13px' }}>{item.preparation_time} phút</Text>
                </div>
              </div>
            </List.Item>
          )}
        />
        
        {order.items.length > 3 && (
          <div className="text-center py-1">
            <Text type="secondary" style={{ fontSize: '13px' }}>
              + {order.items.length - 3} món khác
            </Text>
          </div>
        )}
        
        {order.notes && (
          <div className="mt-1 text-xs text-gray-500">
            <Text type="secondary" style={{ fontSize: '13px' }}>Ghi chú: {order.notes}</Text>
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
    if (viewMode === 'kitchen') {
      // Hiển thị nút chức năng cho nhà bếp
      if (order.status === 'pending') {
        return (
          <Space size={4}>
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleStartCooking(order)}
              style={{ fontSize: '14px', padding: '0 8px', height: '28px' }}
            >
              Bắt đầu
            </Button>
            <Button 
              danger 
              size="small"
              onClick={() => handleCancelOrder(order)}
              style={{ fontSize: '14px', padding: '0 8px', height: '28px' }}
            >
              Hủy
            </Button>
          </Space>
        );
      } else if (order.status === 'processing' || order.status === 'partially_completed') {
        return (
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleCompleteCooking(order)}
            style={{ fontSize: '14px', padding: '0 8px', height: '28px' }}
          >
            Hoàn thành
          </Button>
        );
      }
    } else {
      // Hiển thị nút chức năng cho nhân viên phục vụ
      if (order.status === 'completed') {
        return (
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleServeOrder(order)}
            style={{ fontSize: '14px', padding: '0 8px', height: '28px' }}
          >
            Xác nhận
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
  
  return (
    <Spin spinning={loading}>
      <Card className="m-4" bodyStyle={{ padding: isMobile ? '12px' : '16px' }}>
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <Title level={4} style={{ margin: 0 }}>Bảng điều khiển nhà bếp</Title>
            <Radio.Group 
              value={viewMode} 
              onChange={e => setViewMode(e.target.value)}
              optionType="button" 
              buttonStyle="solid"
              size="middle"
            >
              <Radio.Button value="kitchen">Bếp</Radio.Button>
              <Radio.Button value="server">Phục vụ</Radio.Button>
            </Radio.Group>
          </div>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {viewMode === 'kitchen' 
              ? 'Quản lý đơn hàng và trạng thái chế biến' 
              : 'Kiểm tra và xác nhận phục vụ món ăn'}
          </Text>
        </div>
        
        <div className="mb-2">
          <Row gutter={[8, 8]}>
            <Col xs={12} sm={6} md={6} lg={6}>
              <Card size="small" bodyStyle={{ padding: '8px' }}>
                <Statistic 
                  title={<span style={{ fontSize: '14px' }}>Đơn đang chờ</span>} 
                  value={orderCounts.pending} 
                  valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} md={6} lg={6}>
              <Card size="small" bodyStyle={{ padding: '8px' }}>
                <Statistic 
                  title={<span style={{ fontSize: '14px' }}>Đang chế biến</span>} 
                  value={orderCounts.processing} 
                  valueStyle={{ color: '#faad14', fontSize: '20px' }}
                  prefix={<FireOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} md={6} lg={6}>
              <Card size="small" bodyStyle={{ padding: '8px' }}>
                <Statistic 
                  title={<span style={{ fontSize: '14px' }}>Chờ phục vụ</span>} 
                  value={orderCounts.completed} 
                  valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                  prefix={<CheckOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} md={6} lg={6}>
              <Card size="small" bodyStyle={{ padding: '8px' }}>
                <Statistic 
                  title={<span style={{ fontSize: '14px' }}>Đã phục vụ</span>} 
                  value={orderCounts.served} 
                  valueStyle={{ color: '#722ed1', fontSize: '20px' }}
                  prefix={<CheckCircleOutlined />}
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
            <Tag color="processing" style={{ margin: 0, fontSize: '14px' }}>45 giây</Tag>
          </div>
        </div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="middle"
          tabBarStyle={{ marginBottom: '8px' }}
          tabBarExtraContent={
            <Badge 
              count={orderCounts.pending} 
              offset={[-10, 0]}
              style={{ display: orderCounts.pending > 0 ? 'block' : 'none' }}
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
                    <ClockCircleOutlined /> Đang chờ ({orderCounts.pending})
                  </span>
                } 
                key="pending"
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
                    <CheckOutlined /> Hoàn thành ({orderCounts.completed})
                  </span>
                } 
                key="completed"
              >
                {renderOrders()}
              </TabPane>
            </>
          ) : (
            <>
              <TabPane 
                tab={
                  <span>
                    <CheckOutlined /> Chờ phục vụ ({orderCounts.completed})
                  </span>
                } 
                key="completed"
              >
                {renderOrders()}
              </TabPane>
              <TabPane 
                tab={
                  <span>
                    <CheckCircleOutlined /> Đã phục vụ ({orderCounts.served})
                  </span>
                } 
                key="served"
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
        </Tabs>
        
        {/* Modal xác nhận bắt đầu chế biến */}
        <Modal
          title="Bắt đầu chế biến"
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
                  <Text strong>Bàn #{selectedOrder.table_number}</Text>
                  <Text>{dayjs(selectedOrder.created_at).format('HH:mm:ss DD/MM/YYYY')}</Text>
                </div>
                
                <div className="text-sm mb-2">
                  <Text type="secondary">Thời gian chờ: {dayjs().diff(dayjs(selectedOrder.created_at), 'minute')} phút</Text>
                </div>
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
                dataSource={selectedOrder.items}
                renderItem={item => (
                  <List.Item>
                    <div className="flex justify-between w-full">
                      <Text>{item.dish_name} x{item.quantity}</Text>
                      <Text type="secondary">{item.preparation_time} phút</Text>
                    </div>
                  </List.Item>
                )}
              />
              
              {selectedOrder.notes && (
                <div className="mt-2">
                  <Text type="secondary">Ghi chú: {selectedOrder.notes}</Text>
                </div>
              )}
            </>
          )}
        </Modal>
        
        {/* Modal xác nhận hoàn thành chế biến */}
        <Modal
          title="Xác nhận hoàn thành chế biến"
          open={isCompleteCookingModalVisible}
          onOk={confirmCompleteCooking}
          onCancel={() => setIsCompleteCookingModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
          width={400}
        >
          {selectedOrder && (
            <>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <Text strong>Bàn #{selectedOrder.table_number}</Text>
                  <Text>{dayjs(selectedOrder.created_at).format('HH:mm:ss DD/MM/YYYY')}</Text>
                </div>
                
                <div className="text-sm mb-2">
                  <Text type="secondary">Thời gian chế biến: {dayjs().diff(dayjs(selectedOrder.updated_at), 'minute')} phút</Text>
                </div>
              </div>
              
              <List
                size="small"
                header={<div className="font-bold">Danh sách món đã hoàn thành:</div>}
                bordered
                dataSource={selectedOrder.items}
                renderItem={item => (
                  <List.Item>
                    <div className="flex justify-between w-full">
                      <Text>{item.dish_name} x{item.quantity}</Text>
                      {item.chef_name && (
                        <div className="flex items-center">
                          <Avatar size="small" icon={<UserOutlined />} className="mr-1" />
                          <Text type="secondary">{item.chef_name}</Text>
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </>
          )}
        </Modal>
        
        {/* Modal xác nhận phục vụ */}
        <Modal
          title="Xác nhận phục vụ"
          open={isServeOrderModalVisible}
          onOk={confirmServeOrder}
          onCancel={() => setIsServeOrderModalVisible(false)}
          okText="Xác nhận phục vụ"
          cancelText="Hủy"
          width={400}
        >
          {selectedOrder && (
            <>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <Text strong>Bàn #{selectedOrder.table_number}</Text>
                  <Text>{dayjs(selectedOrder.created_at).format('HH:mm:ss DD/MM/YYYY')}</Text>
                </div>
                
                <div className="mb-2">
                  <Text>Vui lòng kiểm tra tất cả các món trước khi phục vụ:</Text>
                </div>
              </div>
              
              <List
                size="small"
                bordered
                dataSource={selectedOrder.items}
                renderItem={item => (
                  <List.Item
                    className={errorItems.some(err => err.id === item.id) ? 'bg-red-50' : ''}
                  >
                    <div className="flex justify-between w-full">
                      <div className="flex items-center">
                        <Checkbox 
                          checked={item.is_checked}
                          onChange={e => handleCheckItem(item, e.target.checked)}
                          className="mr-2"
                        />
                        <Text>{item.dish_name} x{item.quantity}</Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
              
              {errorItems.length > 0 && (
                <div className="mt-2 text-red-500">
                  <Text type="danger">Vui lòng kiểm tra tất cả các món trước khi xác nhận!</Text>
                </div>
              )}
            </>
          )}
        </Modal>
      </Card>
    </Spin>
  );
};

export default KitchenDashboard; 