import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Tabs,
  Typography,
  List,
  Space,
  Badge,
  Modal,
  message,
  Spin,
  Divider,
  Statistic,
  Avatar,
  Tooltip,
  Checkbox,
  Radio,
  Progress,
  Empty,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router';
import {
  CheckOutlined,
  ClockCircleOutlined,
  FireOutlined,
  SearchOutlined,
  BellOutlined,
  HistoryOutlined,
  CloseOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { CanAccess, useList, useUpdate } from '@refinedev/core';
import { NoPermission } from '@/components/NoPermission';
import {
  KitchenStats,
  KitchenFilters,
  KitchenTabs,
  KitchenModals,
  type Order,
  type OrderDish,
  type DishGroup,
  type OrderCounts,
  type CancelType,
  type KitchenViewMode,
  getCancelTypeText,
} from '@/components/pages/kitchen';
import ServiceConfirmModal from '@/components/pages/kitchen/ServiceConfirmModal';

dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title, Text } = Typography;

const KitchenDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [dishGroups, setDishGroups] = useState<DishGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [kitchenViewMode, setKitchenViewMode] = useState<KitchenViewMode>('by-order');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDishGroup, setSelectedDishGroup] = useState<DishGroup | null>(null);
  const [selectedDish, setSelectedDish] = useState<OrderDish | null>(null);
  const [isStartModalVisible, setIsStartModalVisible] = useState(false);
  const [isFinishModalVisible, setIsFinishModalVisible] = useState(false);
  const [isFinishDishModalVisible, setIsFinishDishModalVisible] = useState(false);
  const [isCancelOrderModalVisible, setIsCancelOrderModalVisible] = useState(false);
  const [isCancelDishModalVisible, setIsCancelDishModalVisible] = useState(false);
  const [isCancelDishGroupModalVisible, setIsCancelDishGroupModalVisible] = useState(false);
  const [isServiceConfirmModalVisible, setIsServiceConfirmModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelType, setCancelType] = useState<CancelType>('out_of_stock');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Handler for date change
  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Fetch orders từ API
  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useList<Order>({
    resource: 'orders',
    pagination: { mode: 'off' },
    meta: {
      populate: {
        table: { fields: ['id', 'number'] },
        order_dishes: {
          populate: {
            dish: { fields: ['id', 'name', 'category_id'] },
          },
        },
      },
    },
    queryOptions: {
      refetchInterval: 30000, // Auto refresh every 30 seconds
    },
  });

  const { mutate: updateOrder } = useUpdate();

  // Process orders và group dishes khi có dữ liệu mới
  useEffect(() => {
    if (ordersData?.data) {
      setOrders(ordersData.data);
      setLoading(ordersLoading);
    }
  }, [ordersData, ordersLoading]);

  // Group dishes từ tất cả orders
  const getDishGroups = useMemo(() => {
    const dishMap = new Map<number, DishGroup>();
    
    // Chỉ lấy orders đang active (không bao gồm done và cancelled) và trong ngày được chọn
    const activeOrders = orders.filter(order => {
      const orderDate = dayjs(order.order_time || order.created_at);
      return ['init', 'processing', 'finished process', 'not completed'].includes(order.status) &&
             orderDate.isSame(selectedDate, 'day');
    });

    activeOrders.forEach(order => {
      order.order_dishes.forEach(orderDish => {
        if (!orderDish.dish) return;
        
        const dishId = orderDish.dish.id;
        const isCompleted = order.status === 'finished process';

        if (!dishMap.has(dishId)) {
          dishMap.set(dishId, {
            dishId,
            dishName: orderDish.dish.name,
            totalQuantity: 0,
            completedQuantity: 0,
            remainingQuantity: 0,
            orderDetails: []
          });
        }

        const dishGroup = dishMap.get(dishId)!;
        dishGroup.totalQuantity += orderDish.quantity;
        
        if (isCompleted) {
          dishGroup.completedQuantity += orderDish.quantity;
        } else {
          dishGroup.remainingQuantity += orderDish.quantity;
        }

        dishGroup.orderDetails.push({
          orderId: order.id,
          tableNumber: order.table?.number || 0,
          quantity: orderDish.quantity,
          note: orderDish.note,
          orderTime: order.order_time,
          status: order.status,
          isCompleted
        });
      });
    });

    return Array.from(dishMap.values()).sort((a, b) => {
      // Ưu tiên món chưa hoàn thành
      if (a.remainingQuantity > 0 && b.remainingQuantity === 0) return -1;
      if (a.remainingQuantity === 0 && b.remainingQuantity > 0) return 1;
      // Sắp xếp theo tổng số lượng
      return b.totalQuantity - a.totalQuantity;
    });
  }, [orders, selectedDate]);

  // Statistics cho các trạng thái
  const orderCounts: OrderCounts = useMemo(() => {
    const counts = {
      pending: 0,
      cooking: 0,
      ready: 0,
      done: 0,
      cancelled: 0,
      all: 0,
    };

    // Chỉ đếm orders trong ngày được chọn
    const todayOrders = orders.filter(order => {
      const orderDate = dayjs(order.order_time || order.created_at);
      return orderDate.isSame(selectedDate, 'day');
    });

    counts.all = todayOrders.length;

    todayOrders.forEach((order) => {
      switch (order.status) {
        case 'init':
        case 'not completed':
          counts.pending++;
          break;
        case 'processing':
          counts.cooking++;
          break;
        case 'finished process':
          counts.ready++;
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
  }, [orders, selectedDate]);

  // Lọc đơn hàng theo tab và tìm kiếm
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Lọc theo ngày được chọn
    result = result.filter((order) => {
      const orderDate = dayjs(order.order_time || order.created_at);
      return orderDate.isSame(selectedDate, 'day');
    });

    // Lọc theo tab
    if (activeTab !== 'all') {
      result = result.filter((order) => {
        switch (activeTab) {
          case 'pending':
            return ['init', 'not completed'].includes(order.status);
          case 'cooking':
            return order.status === 'processing';
          case 'ready':
            return order.status === 'finished process';
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
      result = result.filter(
        (order) =>
          order.table?.number?.toString().includes(lowerSearchText) ||
          order.order_dishes.some((dish) =>
            dish.dish?.name?.toLowerCase().includes(lowerSearchText),
          ),
      );
    }

    // Sắp xếp theo ưu tiên (cao đến thấp) và thời gian (cũ đến mới)
    result.sort((a, b) => {
      // Đơn bị thiếu (not completed) có ưu tiên cao nhất
      if (a.status === 'not completed' && b.status !== 'not completed') return -1;
      if (b.status === 'not completed' && a.status !== 'not completed') return 1;

      // Sau đó sắp xếp theo thời gian tạo đơn
      return dayjs(a.order_time).diff(dayjs(b.order_time));
    });

    return result;
  }, [orders, activeTab, searchText, selectedDate]);

  // Event handlers
  const handleStartCooking = (order: Order) => {
    setSelectedOrder(order);
    setIsStartModalVisible(true);
  };

  const confirmStartCooking = async () => {
    if (selectedOrder) {
      try {
        updateOrder({
          resource: 'orders',
          id: selectedOrder.id,
          values: { status: 'processing' },
        });

        const updatedOrders = orders.map((order) => {
          if (order.id === selectedOrder.id) {
            return {
              ...order,
              status: 'processing' as const,
            };
          }
          return order;
        });

        setOrders(updatedOrders);
        setIsStartModalVisible(false);
        message.success(`Đã bắt đầu chế biến đơn bàn #${selectedOrder.table?.number}`);
        refetchOrders();
      } catch (error) {
        message.error('Có lỗi xảy ra');
      }
    }
  };

  const handleFinishCooking = (order: Order) => {
    setSelectedOrder(order);
    setIsFinishModalVisible(true);
  };

  const confirmFinishCooking = async () => {
    if (selectedOrder) {
      try {
        updateOrder({
          resource: 'orders',
          id: selectedOrder.id,
          values: { status: 'finished process' },
        });

        const updatedOrders = orders.map((order) => {
          if (order.id === selectedOrder.id) {
            return {
              ...order,
              status: 'finished process' as const,
            };
          }
          return order;
        });

        setOrders(updatedOrders);
        setIsFinishModalVisible(false);
        message.success(`Đã hoàn thành chế biến đơn bàn #${selectedOrder.table?.number}`);
        refetchOrders();
      } catch (error) {
        message.error('Có lỗi xảy ra');
      }
    }
  };

  const handleFinishDish = (dishGroup: DishGroup) => {
    setSelectedDishGroup(dishGroup);
    setIsFinishDishModalVisible(true);
  };

  const confirmFinishDish = async () => {
    if (selectedDishGroup) {
      try {
        // Cập nhật tất cả đơn có món này
        const orderIdsToUpdate = selectedDishGroup.orderDetails
          .filter(order => !order.isCompleted)
          .map(order => order.orderId);

        // Cập nhật từng đơn
        for (const orderId of orderIdsToUpdate) {
          updateOrder({
            resource: 'orders',
            id: orderId,
            values: { status: 'finished process' },
          });
        }

        const updatedOrders = orders.map((order) => {
          if (orderIdsToUpdate.includes(order.id)) {
            return {
              ...order,
              status: 'finished process' as const,
            };
          }
          return order;
        });

        setOrders(updatedOrders);
        setIsFinishDishModalVisible(false);
        message.success(
          `Đã hoàn thành ${selectedDishGroup.dishName} cho ${orderIdsToUpdate.length} đơn`
        );
        refetchOrders();
      } catch (error) {
        message.error('Có lỗi xảy ra');
      }
    }
  };

  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsCancelOrderModalVisible(true);
  };

  const handleCancelDish = (order: Order, dish: OrderDish) => {
    setSelectedOrder(order);
    setSelectedDish(dish);
    setIsCancelDishModalVisible(true);
  };

  const handleCancelDishGroup = (dishGroup: DishGroup) => {
    setSelectedDishGroup(dishGroup);
    setIsCancelDishGroupModalVisible(true);
  };

  // Xác nhận phục vụ
  const handleServiceConfirm = (order: Order) => {
    setSelectedOrder(order);
    setIsServiceConfirmModalVisible(true);
  };

  const handleConfirmComplete = async (orderId: number) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Cập nhật tất cả order_dishes thành is_available: 1 khi hoàn thành
      const updatedOrderDishes = order.order_dishes.map(dish => {
        return {
          ...dish,
          is_available: 1
        };
      });

      updateOrder({
        resource: 'orders',
        id: orderId,
        values: { 
          status: 'done',
          order_dishes: updatedOrderDishes
        },
      });

      const updatedOrders = orders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: 'done' as const,
            order_dishes: updatedOrderDishes
          };
        }
        return order;
      });

      setOrders(updatedOrders);
      message.success('Đã xác nhận hoàn thành phục vụ!');
      refetchOrders();
    } catch (error) {
      message.error('Có lỗi xảy ra khi hoàn thành đơn hàng');
    }
  };

  const handleConfirmIncomplete = async (orderId: number, missingDishes: number[], note: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Tăng priority và chuyển về trạng thái not completed
      const newPriority = Math.min((order.priority || 1) + 1, 5);
      
      // Cập nhật trạng thái is_available cho tất cả các món
      const updatedOrderDishes = order.order_dishes.map(dish => {
        if (missingDishes.includes(dish.dish_id)) {
          return {
            ...dish,
            is_available: 0
          };
        }
        // Các món còn lại chuyển về is_available: 1
        return {
          ...dish,
          is_available: 1
        };
      });

      updateOrder({
        resource: 'orders',
        id: orderId,
        values: { 
          status: 'not completed',
          priority: newPriority,
          note: note ? `${order.note || ''}\n[Phục vụ] ${note}` : order.note,
          order_dishes: updatedOrderDishes
        },
      });

      const updatedOrders = orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'not completed' as const,
            priority: newPriority,
            order_dishes: updatedOrderDishes as OrderDish[],
            note: note ? `${o.note || ''}\n[Phục vụ] ${note}` : o.note
          };
        }
        return o;
      });

      setOrders(updatedOrders);
      message.warning(`Đơn bàn #${order.table?.number} đã được chuyển về bếp với độ ưu tiên cao hơn (${missingDishes.length} món cần làm lại)`);
      refetchOrders();
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật đơn hàng');
    }
  };

  const confirmCancelOrder = async () => {
    if (selectedOrder) {
      try {
        updateOrder({
          resource: 'orders',
          id: selectedOrder.id,
          values: { 
            status: 'cancelled',
            cancelled_reason: `${getCancelTypeText(cancelType)}: ${cancelReason}` 
          },
        });

        const updatedOrders = orders.map((order) => {
          if (order.id === selectedOrder.id) {
            return {
              ...order,
              status: 'cancelled' as const,
              cancelled_reason: `${getCancelTypeText(cancelType)}: ${cancelReason}`,
            };
          }
          return order;
        });

        setOrders(updatedOrders);
        setIsCancelOrderModalVisible(false);
        setCancelReason('');
        setCancelType('out_of_stock');
        message.success(`Đã hủy đơn bàn #${selectedOrder.table?.number}`);
        refetchOrders();
      } catch (error) {
        message.error('Có lỗi xảy ra khi hủy đơn');
      }
    }
  };

  const confirmCancelDish = async () => {
    if (selectedOrder && selectedDish) {
      try {
        // Cập nhật món trong đơn thành cancelled
        const updatedOrderDishes = selectedOrder.order_dishes.map(dish => {
          if (dish.id === selectedDish.id) {
            return {
              ...dish,
              cancelled_reason: `${getCancelTypeText(cancelType)}: ${cancelReason}`
            };
          }
          return dish;
        });

        updateOrder({
          resource: 'orders',
          id: selectedOrder.id,
          values: { 
            order_dishes: updatedOrderDishes
          },
        });

        const updatedOrders = orders.map((order) => {
          if (order.id === selectedOrder.id) {
            return {
              ...order,
              order_dishes: updatedOrderDishes,
            };
          }
          return order;
        });

        setOrders(updatedOrders);
        setIsCancelDishModalVisible(false);
        setCancelReason('');
        setCancelType('out_of_stock');
        message.success(`Đã hủy món ${selectedDish.dish?.name} trong đơn bàn #${selectedOrder.table?.number}`);
        refetchOrders();
      } catch (error) {
        message.error('Có lỗi xảy ra khi hủy món');
      }
    }
  };

  const confirmCancelDishGroup = async () => {
    if (selectedDishGroup) {
      try {
        // Hủy tất cả đơn có món này - Lưu ý
        const orderIdsToCancel = selectedDishGroup.orderDetails
          .filter(order => !order.isCompleted)
          .map(order => order.orderId);

        for (const orderId of orderIdsToCancel) {
          const order = orders.find(o => o.id === orderId);
          if (order) {
            // Cập nhật danh sách món trong đơn
            const updatedOrderDishes = order.order_dishes.map(dish => {
              if (dish.dish_id === selectedDishGroup.dishId) {
                return {
                  ...dish,
                  cancelled_reason: `${getCancelTypeText(cancelType)}: ${cancelReason}`
                };
              }
              return dish;
            });

            updateOrder({
              resource: 'orders',
              id: orderId,
              values: { order_dishes: updatedOrderDishes },
            });
          }
        }

        // Cập nhật danh sách món trong đơn
        const updatedOrders = orders.map((order) => {
          if (orderIdsToCancel.includes(order.id)) {
            return {
              ...order,
              order_dishes: order.order_dishes.map(dish => {
                if (dish.dish_id === selectedDishGroup.dishId) {
                  return {
                    ...dish,
                    cancelled_reason: `${getCancelTypeText(cancelType)}: ${cancelReason}`
                  };
                }
                return dish;
              }),
            };
          }
          return order;
        });

        setOrders(updatedOrders);
        setIsCancelDishGroupModalVisible(false);
        setCancelReason('');
        setCancelType('out_of_stock');
        message.success(
          `Đã hủy ${selectedDishGroup.dishName} trong ${orderIdsToCancel.length} đơn`
        );
        refetchOrders();
      } catch (error) {
        message.error('Có lỗi xảy ra khi hủy món');
      }
    }
  };

  return (
    <CanAccess
      resource='order'
      action='update'
      fallback={<NoPermission />}
    >
      <Spin spinning={loading}>
        <Card
          className='m-4'
          styles={{ body: { padding: isMobile ? '12px' : '16px' } }}
        >
          <div className='mb-2'>
            <div className='flex justify-between items-center mb-1'>
              <Title
                level={3}
                style={{ margin: 0 }}
                className='text-orange-600'
              >
                🍳 Bảng điều khiển bếp
              </Title>
              <Button
                icon={<SyncOutlined />}
                onClick={() => refetchOrders()}
                type='text'
              >
                Làm mới
              </Button>
            </div>
            <Text
              type='secondary'
              style={{ fontSize: '14px' }}
            >
              Quản lý đơn gọi món và trạng thái chế biến thực tế
            </Text>
          </div>

          <KitchenStats orderCounts={orderCounts} />

          <Divider style={{ margin: '8px 0' }} />

          <KitchenFilters
            searchText={searchText}
            onSearchChange={setSearchText}
            kitchenViewMode={kitchenViewMode}
            onViewModeChange={setKitchenViewMode}
            isMobile={isMobile}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />

          <KitchenTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            kitchenViewMode={kitchenViewMode}
            orderCounts={orderCounts}
            filteredOrders={filteredOrders}
            dishGroups={getDishGroups}
            onStartCooking={handleStartCooking}
            onFinishCooking={handleFinishCooking}
            onCancelOrder={handleCancelOrder}
            onCancelDish={handleCancelDish}
            onFinishDish={handleFinishDish}
            onCancelDishGroup={handleCancelDishGroup}
            onServiceConfirm={handleServiceConfirm}
          />

          <KitchenModals
            isStartModalVisible={isStartModalVisible}
            setIsStartModalVisible={setIsStartModalVisible}
            selectedOrder={selectedOrder}
            onConfirmStartCooking={confirmStartCooking}
            isFinishModalVisible={isFinishModalVisible}
            setIsFinishModalVisible={setIsFinishModalVisible}
            onConfirmFinishCooking={confirmFinishCooking}
            isFinishDishModalVisible={isFinishDishModalVisible}
            setIsFinishDishModalVisible={setIsFinishDishModalVisible}
            selectedDishGroup={selectedDishGroup}
            onConfirmFinishDish={confirmFinishDish}
            isCancelOrderModalVisible={isCancelOrderModalVisible}
            setIsCancelOrderModalVisible={setIsCancelOrderModalVisible}
            onConfirmCancelOrder={confirmCancelOrder}
            isCancelDishModalVisible={isCancelDishModalVisible}
            setIsCancelDishModalVisible={setIsCancelDishModalVisible}
            selectedDish={selectedDish}
            onConfirmCancelDish={confirmCancelDish}
            isCancelDishGroupModalVisible={isCancelDishGroupModalVisible}
            setIsCancelDishGroupModalVisible={setIsCancelDishGroupModalVisible}
            onConfirmCancelDishGroup={confirmCancelDishGroup}
            cancelReason={cancelReason}
            setCancelReason={setCancelReason}
            cancelType={cancelType}
            setCancelType={setCancelType}
          />

          <ServiceConfirmModal
            visible={isServiceConfirmModalVisible}
            order={selectedOrder}
            onClose={() => setIsServiceConfirmModalVisible(false)}
            onConfirmComplete={handleConfirmComplete}
            onConfirmIncomplete={handleConfirmIncomplete}
          />
        </Card>
      </Spin>
    </CanAccess>
  );
};

export default KitchenDashboard;
