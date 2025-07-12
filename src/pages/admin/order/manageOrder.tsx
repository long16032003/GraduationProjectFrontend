import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, Row, Col, Badge, Button, Space, Typography, Tag, Input, Modal, Table, message, Divider, Timeline, Tooltip } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, PlusOutlined, ClockCircleOutlined, CheckCircleOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useMediaQuery } from 'react-responsive';
import dayjs from 'dayjs';
import { type TableModel, type Bill, type Order, type OrderDish, type Dish, type DishCategory, type Reservation } from '@/types';
import { useList, useUpdate } from '@refinedev/core';
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
  const [lastRefreshTime, setLastRefreshTime] = useState<dayjs.Dayjs | null>(null);
  const [nextRefreshTime, setNextRefreshTime] = useState<dayjs.Dayjs | null>(null);
  const [tooltipKey, setTooltipKey] = useState(0);

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

  const { data: listTables, isLoading: isLoadingListTables, refetch: refetchTables } = useList<TableModel>({
    resource: 'tables',
  });

  const { data: listBills, isLoading: isLoadingListBills, refetch: refetchBills } = useList<Bill>({
    resource: 'bills',
  });

  const { data: listReservations, isLoading: isLoadingListReservations, refetch: refetchReservations } = useList<Reservation>({
    resource: 'reservations',
  });

  // Hook để update reservation
  const { mutate: updateReservation, isLoading: isUpdatingReservation } = useUpdate({
    resource: 'reservations',
    successNotification: {
      message: 'Hủy đặt bàn thành công!',
      type: 'success',
    },
    errorNotification: {
      message: 'Có lỗi xảy ra khi hủy đặt bàn!',
      type: 'error',
    },
  });

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  // Ref for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tự động làm mới sau mỗi 30-minute vào các khung giờ tròn (9:00, 9:30, 10:00, 10:30, etc.)
  // Và cũng refresh mỗi 5 phút để cập nhật trạng thái reservation
  useEffect(() => {
    const refreshData = () => {
      console.log('Refreshing data at:', dayjs().format('HH:mm:ss'));
      refetchTables();
      refetchBills();
      refetchReservations();
      setLastRefreshTime(dayjs());
    };

    // Calculate next 30-minute mark time
    const getNextHalfHourTime = () => {
      const now = dayjs();
      const currentMinute = now.minute();
      
      let nextTime = now.clone();
      if (currentMinute < 30) {
        nextTime = nextTime.minute(30).second(0).millisecond(0);
      } else {
        nextTime = nextTime.add(1, 'hour').minute(0).second(0).millisecond(0);
      }
      
      return nextTime;
    };

    // Calculate milliseconds until next 30-minute mark
    const getTimeUntilNextHalfHour = () => {
      const now = dayjs();
      const nextTime = getNextHalfHourTime();
      return nextTime.diff(now);
    };

    const scheduleNextRefresh = () => {
      const timeUntilNext = getTimeUntilNextHalfHour();
      const nextTime = getNextHalfHourTime();
      
      console.log(`Làm mới tiếp theo trong ${Math.round(timeUntilNext / 1000)} giây vào ${nextTime.format('HH:mm')}`);
      setNextRefreshTime(nextTime);
      
      intervalRef.current = setTimeout(() => {
        refreshData();
        scheduleNextRefresh(); // Schedule the next refresh
      }, timeUntilNext);
    };

    // Initial refresh
    refreshData();
    
    // Set initial next refresh time
    const initialNextTime = getNextHalfHourTime();
    setNextRefreshTime(initialNextTime);
    console.log('Thời gian hiện tại:', dayjs().format('HH:mm:ss'));
    console.log('Thời gian làm mới tiếp theo:', initialNextTime.format('HH:mm'));
    
    // Schedule first refresh at next half-hour mark
    scheduleNextRefresh();

    // Additional: Refresh every 5 minutes to update reservation status
    const intervalRefresh = setInterval(() => {
      console.log('Refreshing reservations every 5 minutes:', dayjs().format('HH:mm:ss'));
      refetchReservations();
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup timeout on unmount
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      if (intervalRefresh) {
        clearInterval(intervalRefresh);
      }
    };
  }, [refetchTables, refetchBills, refetchReservations]);

  // Update tooltip every second
  useEffect(() => {
    const updateTooltip = setInterval(() => {
      setTooltipKey(prev => prev + 1);
    }, 1000);

    return () => clearInterval(updateTooltip);
  }, []);

  const tables = listTables?.data;
  const billsWithOrders = listBills?.data;
  const reservations = listReservations?.data;

  // Get active reservation for a table
  const getActiveReservation = (tableId: number) => {
    if (!reservations) return null;
   
    
    const now = dayjs();
    
    return reservations.find(reservation => {
      if (reservation.table_id !== tableId || reservation.status !== 'confirmed') {
        return false;
      }
      
      // Parse MySQL datetime string to dayjs object
      const reservationTime = dayjs(reservation.reservation_date);
      
      // Chỉ hiển thị nếu trong cùng ngày
      if (now.format('YYYY-MM-DD') !== reservationTime.format('YYYY-MM-DD')) {
        return false;
      }
      
      // Bàn sẽ hiển thị "Đã đặt" từ đúng giờ đặt đến 2 giờ sau
      const reservationStart = reservationTime;
      const reservationEnd = reservationTime.add(2, 'hour');
      
      // Kiểm tra nếu thời gian hiện tại nằm trong khoảng [reservation_time, reservation_time + 2h]
      const isWithinReservationPeriod = (now.isAfter(reservationStart) || now.isSame(reservationStart)) && now.isBefore(reservationEnd);
      
      return isWithinReservationPeriod;
    });
  };

  // Check if table has active reservation
  const hasActiveReservation = (tableId: number) => {
    return getActiveReservation(tableId) !== null;
  };

  // Get overdue reservation (quá 30 phút)
  const getOverdueReservation = (tableId: number) => {
    if (!reservations) return null;
   
    const now = dayjs();
    
    return reservations.find(reservation => {
      if (reservation.table_id !== tableId || reservation.status !== 'confirmed') {
        return false;
      }
      
      const reservationTime = dayjs(reservation.reservation_date);
      
      // Chỉ hiển thị nếu trong cùng ngày
      if (now.format('YYYY-MM-DD') !== reservationTime.format('YYYY-MM-DD')) {
        return false;
      }
      
      // Kiểm tra nếu đã quá 30 phút từ thời gian đặt bàn
      const reservationOverdueTime = reservationTime.add(30, 'minute');
      const isOverdue = (now.isAfter(reservationOverdueTime) || now.isSame(reservationOverdueTime));
      
      return isOverdue;
    });
  };

  // Check if table has overdue reservation
  const hasOverdueReservation = (tableId: number) => {
    return getOverdueReservation(tableId) !== null;
  };

  // Filter tables
  const filteredTables = useMemo(() => {
    let filtered = tables?.filter(table => table.status !== 'maintenance');
    
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
    const reservationInfo = getActiveReservation(table.id);
    
    if (bill) {
      // Bàn đã có hóa đơn - hiển thị chi tiết
      setSelectedBill(bill);
      setIsDetailModalVisible(true);
    } else {
      // Bàn chưa có hóa đơn - tạo hóa đơn mới và gọi món
      // Nếu có reservation, truyền thông tin reservation qua state
      if (reservationInfo) {
        navigate(`/admin/order/table/${table.id}/new-bill`, {
          state: {
            reservation: {
              customer_name: reservationInfo.name,
              customer_phone: reservationInfo.phone,
              number_of_guests: reservationInfo.number_of_guests
            }
          }
        });
      } else {
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

  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    refetchTables();
    refetchBills();
    refetchReservations();
    setLastRefreshTime(dayjs());
    message.success('Đã làm mới dữ liệu');
  };

  // Function để hủy đặt bàn
  const handleCancelReservation = (reservationId: number, tableName: string) => {
    Modal.confirm({
      title: 'Xác nhận hủy đặt bàn',
      content: `Bạn có chắc chắn muốn hủy đặt bàn ${tableName}? Hành động này không thể hoàn tác.`,
      okText: 'Hủy đặt bàn',
      cancelText: 'Đóng',
      okButtonProps: { danger: true },
      onOk: () => {
        updateReservation({
          id: reservationId,
          values: {
            status: 'cancelled',
          },
        });
        // Refresh data sau khi hủy
        setTimeout(() => {
          refetchReservations();
          refetchTables();
        }, 500);
      },
    });
  };

  const getRefreshTooltip = () => {
    if (!nextRefreshTime) return 'Làm mới ngay';
    const now = dayjs();
    const diffMinutes = nextRefreshTime.diff(now, 'minutes');
    const diffSeconds = nextRefreshTime.diff(now, 'seconds') % 60;
    return `Làm mới ngay (Tự động trong ${diffMinutes}:${diffSeconds.toString().padStart(2, '0')})`;
  };

  const getTableStatusColor = (status: TableModel['status'], tableId?: number) => {
    // Check if table has active reservation
    if (tableId && getActiveReservation(tableId)) {
      return 'warning';
    }
    
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

  const getTableStatusText = (status: TableModel['status'], bill: Bill, tableId: number) => {
    // Kiểm tra trạng thái đặt bàn trước tiên
    // if(hasOverdueReservation(tableId)) {
    //   return 'Quá hạn (30\')';
    // }
    // else
     if(getActiveReservation(tableId)) {
      return 'Đã đặt';
    }
    
    // Có khách và hóa đơn chưa thanh toán
    if(status === 'occupied' && bill && bill.status === 'unpaid') {
      return 'Có khách';
    }
    // Không có hóa đơn chưa thanh toán
    else if(status === 'occupied' && !bill) {
      return 'Trống';
    }
    return status;
  };

  const getStatusColor = (status: TableModel['status'], tableId?: number) => {
    // Check if table has active reservation
    if (tableId && getActiveReservation(tableId)) {
      return '#1890ff';
    }
    
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
        return 'green';
      case 'cancelled':
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
      case 'cancelled':
        return 'Đã hủy';
      case 'done':
        return 'Đã hoàn thành';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <Title level={3} style={{ fontSize: isMobile ? '18px' : '24px', margin: 0 }} className='text-orange-600'>
              Quản lý đơn hàng
            </Title>
            <div className="flex items-center gap-3">
              <div className="text-right">
                {lastRefreshTime && (
                  <Text type="secondary" style={{ fontSize: isMobile ? '10px' : '11px' }} className="block">
                    Làm mới: {lastRefreshTime.format('HH:mm:ss')}
                  </Text>
                )}
                {nextRefreshTime && (
                  <Text type="secondary" style={{ fontSize: isMobile ? '10px' : '11px' }} className="block">
                    Tiếp theo: {nextRefreshTime.format('HH:mm')}
                  </Text>
                )}
                <Text type="secondary" style={{ fontSize: isMobile ? '9px' : '10px' }} className="block">
                  (Tự động mỗi 30 phút)
                </Text>
              </div>
              <Tooltip title={getRefreshTooltip()} key={tooltipKey}>
                <Button
                  type="default"
                  icon={<ReloadOutlined />}
                  onClick={handleManualRefresh}
                  size={isMobile ? 'small' : 'middle'}
                >
                  {!isMobile && 'Làm mới'}
                </Button>
              </Tooltip>
            </div>
          </div>
          
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
              {Object.keys(areas).map((area) => (
                <Button 
                  key={area}
                  type={selectedArea === area ? 'primary' : 'default'}
                  onClick={() => setSelectedArea(area)}
                  size={isMobile ? 'small' : 'middle'}
                >
                  {areas[area as keyof typeof areas]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          {filteredTables?.map((table: TableModel) => {
            const bill = billsWithOrders?.find(bill => bill.table_id === table.id && bill.status === 'unpaid');
            const hasOrders = bill && bill.orders && bill.orders.length > 0;
            const pendingOrders = bill?.orders?.filter(order => order.status === 'init').length || 0;
            const reservationInfo = getActiveReservation(table.id);
            if(table.id == 5){
              console.log("reservationInfo: ", reservationInfo);
            }
            const hasReservation = reservationInfo;
            const reservationTime = reservationInfo ? dayjs(reservationInfo.reservation_date) : null;

            return (
              <Col xs={12} sm={8} md={6} lg={4} xl={4} key={table.id}>
                <Badge.Ribbon 
                  text={getTableStatusText(table.status, bill!, table.id)} 
                  color={getTableStatusColor(table.status, table.id)}
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
                        background: getStatusColor(table.status, table.id),
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

                    {/* Reservation info */}
                    {hasReservation && !hasOrders && (
                      <div className="mb-3 p-2 rounded-lg" style={{ background: 'rgba(24, 144, 255, 0.1)' }}>
                        <div className="flex justify-center gap-2 mb-2">
                          <Tag 
                            color="blue" 
                            style={{ 
                              fontSize: isMobile ? '10px' : '11px',
                              borderRadius: '8px',
                              margin: 0
                            }}
                          >
                            <ClockCircleOutlined /> Đã đặt
                          </Tag>
                        </div>
                        {reservationTime && (
                          <div 
                            style={{ 
                              fontSize: isMobile ? '11px' : '12px',
                              fontWeight: '500',
                              color: '#1890ff',
                              textAlign: 'center'
                            }}
                          >
                            {reservationTime.format('HH:mm DD/MM')}
                          </div>
                        )}
                        {reservationInfo && (
                          <div 
                            style={{ 
                              fontSize: isMobile ? '10px' : '11px',
                              color: '#666',
                              textAlign: 'center'
                            }}
                          >
                            <div><strong>{reservationInfo.name}</strong></div>
                            <div>{reservationInfo.phone}</div>
                            <div>{reservationInfo.number_of_guests} khách</div>
                          </div>
                        )}
                        
                        {/* Nút hủy đặt bàn khi quá 30 phút */}
                        {hasOverdueReservation(table.id) && reservationInfo && (
                          <div className="mt-2">
                            <Button
                              danger
                              size="small"
                              style={{ 
                                fontSize: isMobile ? '10px' : '11px',
                                width: '100%',
                                borderRadius: '6px'
                              }}
                              loading={isUpdatingReservation}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                handleCancelReservation(reservationInfo.id, table.name);
                              }}
                            >
                              Hủy đặt bàn (Quá 30')
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Action button */}
                    <Button
                      type={hasOrders ? "default" : (hasReservation ? "primary" : "primary")}
                      icon={<ShoppingCartOutlined />}
                      size={isMobile ? 'small' : 'middle'}
                      disabled={table.status === 'maintenance'}
                      style={{ 
                        fontSize: isMobile ? '11px' : '12px',
                        borderRadius: '8px',
                        fontWeight: '500',
                        width: '100%',
                        background: hasOrders ? '#fff' : (hasReservation ? '#1890ff' : undefined),
                        borderColor: hasOrders ? '#faad14' : (hasReservation ? '#1890ff' : undefined),
                        color: hasOrders ? '#faad14' : (hasReservation ? '#fff' : undefined)
                      }}
                    >
                      {hasOrders ? 'Gọi món thêm' : (hasReservation ? 'Tạo hóa đơn' : 'Bắt đầu gọi món')}
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