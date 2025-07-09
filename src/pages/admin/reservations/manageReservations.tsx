import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Card, Input, Modal, Form, DatePicker, TimePicker, 
  InputNumber, Select, message, Tag, Tooltip, Row, Col, Radio,
  Typography, Alert, Badge, Divider
} from 'antd';
import { 
  PlusOutlined, ExclamationCircleOutlined, FilterOutlined, SearchOutlined,
  PhoneOutlined, UserOutlined, TableOutlined, ClockCircleOutlined,
  CalendarOutlined, TeamOutlined, CommentOutlined, CheckCircleOutlined,
  CloseCircleOutlined, WarningOutlined, UserAddOutlined, ClearOutlined,
  BulbOutlined
} from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import type { Key } from 'react';
import dayjs from 'dayjs';
import { useCreate, useDelete, useUpdate } from '@refinedev/core';
import type { Reservation, TableModel, Customer } from '@/types';
import { useList } from '@refinedev/core';
import { areas } from '@/utils/constant';

const { Text, Title } = Typography;
const { Option } = Select;

interface ReservationFormData {
  name: string;
  phone: string;
  table_id: number;
  date: dayjs.Dayjs;
  time: dayjs.Dayjs;
  number_of_guests: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | null;
  notes?: string;
}

interface CustomerSearchResult {
  id: number;
  name: string;
  phone: string;
  email?: string;
  point?: number;
  last_visit?: string;
}

const ManageReservations: React.FC = () => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [dateFilter, setDateFilter] = useState<dayjs.Dayjs | null>(null);
  
  // Customer lookup states
  const [customerSearchValue, setCustomerSearchValue] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<CustomerSearchResult[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  
  // Available tables based on date/time/guests
  const [availableTables, setAvailableTables] = useState<TableModel[]>([]);
  const [tableFilters, setTableFilters] = useState({
    capacity: 2,
    capacity_operator: 'gte',
    available: true,
    date: dayjs().format('YYYY-MM-DD'),
    time: dayjs().format('HH:mm:00')
  });
  
  // Quick notes templates
  const notesTemplates = [
    'Sinh nhật 🎂',
    'Kỷ niệm ❤️', 
    'Khách VIP ⭐',
    'Cần ghế trẻ em 👶',
    'Khách chay 🥗',
    'Không cay 🌶️',
    'Cần bàn yên tĩnh 🤫',
    'Nhóm lớn 👥'
  ];

  // API hooks
  const { data: listReservations, isLoading: isLoadingList, refetch: refetchReservations } = useList<Reservation>({
    resource: 'reservations',
  });
  const { data: listTables, isLoading: isLoadingTables } = useList<TableModel>({
    resource: 'tables',
  });
  
  // Available tables API with filters
  const { data: listAvailableTables, isLoading: isLoadingAvailableTables, refetch: refetchAvailableTables } = useList<TableModel>({
    resource: 'tables',
    meta: tableFilters,
    queryOptions: {
      enabled: false,
    }
  });
  const { data: listCustomers } = useList<Customer>({
    resource: 'customers',
  });

  const { mutate: createReservation, isLoading: isCreating } = useCreate<Reservation>();
  const { mutate: updateReservation, isLoading: isUpdating } = useUpdate<Reservation>();

  const statusColors = {
    pending: 'orange',
    confirmed: 'green', 
    cancelled: 'red',
  };

  const statusTexts = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã hủy',
  };

  // Business rules for editing/canceling reservations
  const getReservationBusinessRules = (reservation: Reservation) => {
    const now = dayjs();
    const reservationTime = dayjs(reservation.reservation_date);
    const hoursUntil = reservationTime.diff(now, 'hours');
    
    return {
      canChangeTime: hoursUntil > 2,
      canChangeGuests: hoursUntil > 1,
      canCancel: hoursUntil > 0.5,
      canAddNotes: true,
      timeMessage: hoursUntil <= 2 ? 'Không thể đổi giờ (còn ít hơn 2 tiếng)' : '',
      guestMessage: hoursUntil <= 1 ? 'Không thể đổi số khách (còn ít hơn 1 tiếng)' : '',
      cancelMessage: hoursUntil <= 0.5 ? 'Không thể hủy (còn ít hơn 30 phút)' : '',
    };
  };

  // Customer search function
  const handleCustomerSearch = async (value: string) => {
    if (!value || value.length < 3) {
      setCustomerSearchResults([]);
      return;
    }

    setIsSearchingCustomer(true);
    try {
      const mockResults: CustomerSearchResult[] = listCustomers?.data?.filter((customer: Customer) => 
        customer.phone.includes(value) || 
        customer.name.toLowerCase().includes(value.toLowerCase())
      ).map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        point: customer.point,
        last_visit: customer.updated_at
      })) || [];

      setCustomerSearchResults(mockResults);
    } catch (error) {
      message.error('Lỗi tìm kiếm khách hàng');
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: CustomerSearchResult) => {
    setSelectedCustomer(customer);
    form.setFieldsValue({
      name: customer.name,
      phone: customer.phone,
    });
    setCustomerSearchValue(`${customer.name} - ${customer.phone}`);
    setCustomerSearchResults([]);
  };

  // Clear customer selection
  const clearCustomerSelection = () => {
    setSelectedCustomer(null);
    setCustomerSearchValue('');
    form.setFieldsValue({
      name: '',
      phone: '',
    });
  };

  // Get available tables based on date/time/guests
  const updateAvailableTables = async (date: dayjs.Dayjs, time: dayjs.Dayjs, guests: number) => {
    try {
      const newFilters = {
        capacity: guests,
        capacity_operator: 'gte',
        available: true,
        date: date.format('YYYY-MM-DD'),
        time: time.format('HH:mm:00')
      };
      
      setTableFilters(newFilters);
      
      const result = await refetchAvailableTables();
      
      if (result && result.data && result.data.data) {
        setAvailableTables(result.data.data);
      } else {
        setAvailableTables([]);
      }
    } catch (error) {
      console.error("Error fetching available tables:", error);
      setAvailableTables([]);
    }
  };



  // Add template to notes
  const addTemplate = (template: string) => {
    const currentNotes = form.getFieldValue('notes') || '';
    const newNotes = currentNotes ? `${currentNotes}, ${template}` : template;
    form.setFieldValue('notes', newNotes);
  };

  // Get default time (next hour)
  const getDefaultTime = () => {
    return dayjs().add(1, 'hour').minute(0).second(0);
  };

  // Filter reservations
  const filterByDate = (data: Reservation[] | undefined): Reservation[] => {
    if (!data) return [];
    if (!dateFilter) return data;

    return data.filter(record => {
      const recordDate = dayjs(record.reservation_date);
      return recordDate.format('YYYY-MM-DD') === dateFilter.format('YYYY-MM-DD');
    });
  };

  const columns: ColumnType<Reservation>[] = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Reservation, b: Reservation) => a.name.localeCompare(b.name),
      render: (name: string, record: Reservation) => (
        <div>
          <div className="font-medium">{name}</div>
          <Text type="secondary" className="text-xs">
            <PhoneOutlined className="mr-1" />
            {record.phone}
          </Text>
        </div>
      ),
    },
    {
      title: 'Bàn',
      dataIndex: 'table_id',
      key: 'table_id',
      width: 150,
      render: (tableId: number, record: Reservation) => (
        <div>
          <Tag color="blue">{record.table?.name}</Tag>
          <div className="text-xs text-gray-500">{areas[record.table?.area as keyof typeof areas]}</div>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'reservation_date',
      key: 'reservation_date',
      width: 150,
      sorter: (a: Reservation, b: Reservation) => 
        dayjs(a.reservation_date).unix() - dayjs(b.reservation_date).unix(),
      render: (date: string) => (
        <div>
          <div className="font-medium">{dayjs(date).format('DD/MM/YYYY')}</div>
          <div className="text-sm text-gray-600">{dayjs(date).format('HH:mm')}</div>
        </div>
      ),
    },
    {
      title: 'Số khách',
      dataIndex: 'number_of_guests',
      key: 'number_of_guests',
      width: 100,
      render: (guests: number) => <Badge count={guests} color="green" />,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: keyof typeof statusColors) => (
        <Tag color={statusColors[status]}>{statusTexts[status]}</Tag>
      ),
      filters: Object.entries(statusTexts).map(([value, text]) => ({ text, value })),
      onFilter: (value: boolean | Key, record: Reservation) => record.status === value,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      width: 200,
      render: (notes: string) => {
        if (!notes) return <Text type="secondary">-</Text>;
        
        const truncatedNotes = notes.length > 50 ? `${notes.substring(0, 50)}...` : notes;
        
        return (
          <Tooltip title={notes} placement="top">
            <div className="text-sm">
              <CommentOutlined className="mr-1 text-gray-400" />
              {truncatedNotes}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Reservation) => {
        const rules = getReservationBusinessRules(record);
        
        return (
          <Space size="small" wrap>
            {record.status === 'pending' && (
              <Button 
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleConfirm(record)}
              >
                Xác nhận
              </Button>
            )}
            <Button 
              type="default" 
              size="small"
              onClick={() => handleEdit(record)}
              disabled={record.status === 'cancelled'}
            >
              Sửa
            </Button>
            <Button 
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => showCancelConfirm(record)}
              disabled={record.status === 'cancelled' || !rules.canCancel}
            >
              Hủy
            </Button>
          </Space>
        );
      },
    },
  ];

  const handleAdd = async () => {
    setEditingReservation(null);
    form.resetFields();
    clearCustomerSelection();
    const defaultDate = dayjs();
    const defaultTime = getDefaultTime();
    const defaultGuests = 2;
    
    form.setFieldsValue({
      date: defaultDate,
      time: defaultTime,
      number_of_guests: defaultGuests,
    });
    
    // Load available tables for default values
    await updateAvailableTables(defaultDate, defaultTime, defaultGuests);
    
    setIsModalVisible(true);
  };



  const handleEdit = async (record: Reservation) => {
    setEditingReservation(record);
    const reservationDate = dayjs(record.reservation_date);
    
    form.setFieldsValue({
      name: record.name,
      phone: record.phone,
      table_id: record.table_id,
      date: reservationDate,
      time: reservationDate,
      number_of_guests: record.number_of_guests,
      notes: record.notes,
    });
    
    // Load available tables for the reservation time
    await updateAvailableTables(reservationDate, reservationDate, record.number_of_guests);
    
    setIsModalVisible(true);
  };

  const handleConfirm = (record: Reservation) => {
    Modal.confirm({
      title: 'Xác nhận đặt bàn',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xác nhận đặt bàn cho khách hàng ${record.name}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        updateReservation({
          resource: 'reservations',
          id: record.id,
          values: { status: 'confirmed' }
        }, {
          onSuccess: () => {
            message.success('Xác nhận đặt bàn thành công');
            refetchReservations();
          },
          onError: () => {
            message.error('Có lỗi xảy ra khi xác nhận đặt bàn');
          }
        });
      },
    });
  };

  const showCancelConfirm = (record: Reservation) => {
    const rules = getReservationBusinessRules(record);
    
    if (!rules.canCancel) {
      message.warning(rules.cancelMessage);
      return;
    }

    Modal.confirm({
      title: 'Xác nhận hủy đặt bàn',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc muốn hủy đặt bàn cho khách hàng <strong>{record.name}</strong>?</p>
          <p className="text-red-500 text-sm">Hành động này không thể hoàn tác.</p>
        </div>
      ),
      okText: 'Xác nhận hủy',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        updateReservation({
          resource: 'reservations',
          id: record.id,
          values: { status: 'cancelled' }
        }, {
          onSuccess: () => {
            message.success('Hủy đặt bàn thành công');
            refetchReservations();
          },
          onError: () => {
            message.error('Có lỗi xảy ra khi hủy đặt bàn');
          }
        });
      },
    });
  };

  // Check for table availability conflicts
  const checkTableAvailability = (
    tableId: number, 
    reservationDateTime: dayjs.Dayjs, 
    excludeReservationId?: number
  ): { hasConflict: boolean; conflictReservation?: Reservation } => {
    const timeBuffer = 120; // 2 hours buffer in minutes
    
    const conflict = listReservations?.data?.find(r => 
      r.table_id === tableId &&
      r.status !== 'cancelled' &&
      r.id !== excludeReservationId &&
      Math.abs(dayjs(r.reservation_date).diff(reservationDateTime, 'minutes')) < timeBuffer
    );

    return {
      hasConflict: !!conflict,
      conflictReservation: conflict
    };
  };

  const handleSubmit = async (values: ReservationFormData) => {
    try {
      setLoading(true);
      
      const combinedDateTime = values.date
        .hour(values.time.hour())
        .minute(values.time.minute())
        .second(0);

      // Check for table availability conflicts
      const { hasConflict, conflictReservation } = checkTableAvailability(
        values.table_id, 
        combinedDateTime, 
        editingReservation?.id
      );

      if (hasConflict && conflictReservation) {
        const isTableRecommended = availableTables.some(t => t.id === values.table_id);
        
        Modal.confirm({
          title: '⚠️ Xung đột thời gian đặt bàn',
          content: (
            <div>
              <p>Bàn số {values.table_id} đã được đặt trong khoảng thời gian gần đó:</p>
              <div className="bg-yellow-50 p-3 rounded mt-2">
                <strong>Đặt bàn hiện tại:</strong>
                <br />• Khách: {conflictReservation.name}
                <br />• SĐT: {conflictReservation.phone}
                <br />• Thời gian: {dayjs(conflictReservation.reservation_date).format('DD/MM/YYYY HH:mm')}
                <br />• Số khách: {conflictReservation.number_of_guests}
              </div>
              <p className="mt-2 text-red-600">
                <strong>Lưu ý:</strong> Các đặt bàn cần cách nhau ít nhất 2 tiếng để dọn dẹp và chuẩn bị bàn.
              </p>
              {availableTables.length > 0 && (
                <div className="mt-2 p-2 bg-green-50 rounded">
                  <strong>💡 Gợi ý:</strong> Có {availableTables.length} bàn khác phù hợp và trống vào thời gian này. 
                  Vui lòng quay lại chọn bàn khác.
                </div>
              )}
              <p>Bạn có muốn tiếp tục đặt bàn này không?</p>
            </div>
          ),
          okText: 'Vẫn đặt bàn',
          okType: 'danger',
          cancelText: 'Hủy và chọn bàn khác',
          onOk: () => submitReservation(values, combinedDateTime),
        });
        return;
      }

      // Check for duplicate customer booking on same day  
      if (!editingReservation) {
        const existingReservation = listReservations?.data?.find(r => 
          r.phone === values.phone && 
          dayjs(r.reservation_date).format('YYYY-MM-DD') === values.date.format('YYYY-MM-DD') &&
          r.status !== 'cancelled'
        );
        
        if (existingReservation) {
          Modal.confirm({
            title: 'Phát hiện đặt bàn trùng lặp',
            content: `Khách hàng ${values.phone} đã có đặt bàn trong ngày này lúc ${dayjs(existingReservation.reservation_date).format('HH:mm')} tại bàn ${existingReservation.table_id}. Bạn có muốn tiếp tục?`,
            okText: 'Tiếp tục',
            cancelText: 'Hủy',
            onOk: () => submitReservation(values, combinedDateTime),
          });
          return;
        }
      }

      await submitReservation(values, combinedDateTime);
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const submitReservation = async (values: ReservationFormData, combinedDateTime: dayjs.Dayjs) => {
    const formattedData = {
      ...values,
      reservation_date: combinedDateTime.unix(),
      customer_id: selectedCustomer?.id,
      creator_type: 'staff',
      status: 'pending',
      date: undefined,
      time: undefined,
    };

    if (editingReservation) {
      updateReservation({
        resource: 'reservations',
        id: editingReservation.id,
        values: formattedData
      }, {
        onSuccess: () => {
          message.success('Cập nhật đặt bàn thành công');
          setIsModalVisible(false);
          form.resetFields();
          clearCustomerSelection();
          refetchReservations();
        },
        onError: () => {
          message.error('Có lỗi xảy ra khi cập nhật đặt bàn');
        }
      });
    } else {
      createReservation({
        resource: 'reservations',
        values: formattedData
      }, {
        onSuccess: () => {
          message.success('Đặt bàn thành công');
          setIsModalVisible(false);
          form.resetFields();
          clearCustomerSelection();
          refetchReservations();
        },
        onError: () => {
          message.error('Có lỗi xảy ra khi tạo đặt bàn');
        }
      });
    }
  };

  // Enhanced reservation form
  const renderReservationForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      onValuesChange={async (changedValues, allValues) => {
        if ((changedValues.date || changedValues.time || changedValues.number_of_guests) 
            && allValues.date && allValues.time && allValues.number_of_guests) {
          await updateAvailableTables(allValues.date, allValues.time, allValues.number_of_guests);
        }
      }}
    >
      {/* Customer Search Section */}
      <Card size="small" className="mb-4">
        <Title level={5} className="mb-3">
          <UserAddOutlined className="mr-2" />
          Thông tin khách hàng
        </Title>
        
        <Form.Item label="Tìm kiếm khách hàng">
          <Input.Search
            placeholder="Nhập số điện thoại hoặc tên khách hàng..."
            value={customerSearchValue}
            onChange={(e) => {
              setCustomerSearchValue(e.target.value);
              handleCustomerSearch(e.target.value);
            }}
            loading={isSearchingCustomer}
            suffix={
              selectedCustomer ? (
                <Button 
                  type="link" 
                  size="small" 
                  icon={<ClearOutlined />}
                  onClick={clearCustomerSelection}
                />
              ) : null
            }
          />
          {customerSearchResults.length > 0 && (
            <div className="mt-2 border rounded p-2 bg-gray-50 max-h-40 overflow-y-auto">
              {customerSearchResults.map(customer => (
                <div 
                  key={customer.id}
                  className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-600">
                    📞 {customer.phone} | 
                    {customer.point ? ` ⭐ ${customer.point} điểm` : ''} |
                    {customer.last_visit ? ` 🕒 ${dayjs(customer.last_visit).format('DD/MM/YYYY')}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Form.Item>

        {selectedCustomer && (
          <Alert
            message={`Khách hàng VIP: ${selectedCustomer.name}`}
            description={`Điểm tích lũy: ${selectedCustomer.point || 0} | Lần cuối: ${selectedCustomer.last_visit ? dayjs(selectedCustomer.last_visit).format('DD/MM/YYYY') : 'Chưa có'}`}
            type="success"
            showIcon
            className="mb-3"
          />
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên khách hàng"
              rules={[
                { required: true, message: 'Vui lòng nhập tên khách hàng' },
                { max: 100, message: 'Tên không được quá 100 ký tự' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập tên khách hàng" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Booking Details */}
      <Card size="small" className="mb-4">
        <Title level={5} className="mb-3">
          <CalendarOutlined className="mr-2" />
          Thông tin đặt bàn
        </Title>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="date"
              label="Ngày"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <DatePicker 
                className="w-full"
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="time"
              label="Giờ"
              rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
            >
              <TimePicker 
                className="w-full"
                format="HH:mm"
                minuteStep={15}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="number_of_guests"
              label="Số khách"
              rules={[
                { required: true, message: 'Vui lòng nhập số khách' },
                { type: 'number', min: 1, message: 'Số khách phải lớn hơn 0' }
              ]}
            >
              <InputNumber 
                min={1} max={20}
                className="w-full"
                prefix={<TeamOutlined />}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Table Selection */}
      <Card size="small" className="mb-4">
        <Title level={5} className="mb-3">
          <TableOutlined className="mr-2" />
          Chọn bàn
        </Title>
        
        {availableTables.length > 0 ? (
          <Alert
            message={`✅ Tìm thấy ${availableTables.length} bàn phù hợp`}
            description="Những bàn này trống vào thời gian bạn chọn và đủ sức chứa cho số khách."
            type="success"
            showIcon
            className="mb-3"
          />
        ) : (
          <Alert
            message="⚠️ Không tìm thấy bàn phù hợp"
            description="Vui lòng thay đổi thời gian hoặc số khách để tìm bàn trống."
            type="warning"
            showIcon
            className="mb-3"
          />
        )}

        <Form.Item
          name="table_id"
          rules={[{ required: true, message: 'Vui lòng chọn bàn' }]}
        >
          <Select
            placeholder="Chọn bàn phù hợp..."
            loading={isLoadingAvailableTables}
            optionLabelProp="label"
            notFoundContent={
              availableTables.length === 0 && !isLoadingAvailableTables ? 
              "Không có bàn phù hợp. Vui lòng thay đổi thời gian hoặc số khách." : 
              "Đang tải..."
            }
          >
            {availableTables.map((table: TableModel) => (
              <Option 
                key={table.id}
                value={table.id}
                label={`${table.name} (${table.capacity} chỗ)`}
              >
                <div className="flex justify-between items-center">
                  <span>{table.name} - {table.area} ({table.capacity} chỗ)</span>
                  <Tag color="green">✓ Trống</Tag>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Card>

      {/* Notes */}
      <Card size="small" className="mb-4">
        <Title level={5} className="mb-3">
          <CommentOutlined className="mr-2" />
          Ghi chú
        </Title>

        <Form.Item
          name="notes"
          label="Ghi chú"
          rules={[{ max: 500, message: 'Ghi chú không được quá 500 ký tự' }]}
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Yêu cầu đặc biệt, sở thích khách hàng..."
          />
        </Form.Item>

        <div className="mb-3">
          <Text type="secondary" className="mb-2 block">Mẫu ghi chú nhanh:</Text>
          <Space wrap>
            {notesTemplates.map(template => (
              <Tag 
                key={template}
                className="cursor-pointer hover:bg-blue-50"
                onClick={() => addTemplate(template)}
              >
                {template}
              </Tag>
            ))}
          </Space>
        </div>

      </Card>

      <Form.Item className="mb-0">
        <div className="flex justify-end gap-2">
          <Button onClick={() => {
            setIsModalVisible(false);
            form.resetFields();
            clearCustomerSelection();
          }}>
            Hủy
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading || isCreating || isUpdating}
            icon={editingReservation ? <CheckCircleOutlined /> : <PlusOutlined />}
          >
            {editingReservation ? 'Cập nhật đặt bàn' : 'Xác nhận đặt bàn'}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <TableOutlined />
          <span className="text-lg font-semibold">Quản lý đặt bàn</span>
        </div>
      } 
      className="m-4"
    >
      {/* Header Controls */}
      <div className="mb-4 flex justify-between items-center flex-wrap gap-4">
        <Space wrap>
          <Input.Search
            placeholder="Tìm kiếm theo tên, SĐT hoặc ghi chú..."
            allowClear
            onSearch={value => setSearchText(value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          {dateFilter && (
            <Tag 
              color="blue" 
              closable 
              onClose={() => setDateFilter(null)}
            >
              Ngày: {dateFilter.format('DD/MM/YYYY')}
            </Tag>
          )}
        </Space>
        
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Đặt bàn mới
          </Button>
        </Space>
      </div>

      {/* Summary Stats */}
      <div className="mb-4">
        <Row gutter={16}>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {listReservations?.data?.filter(r => r.status === 'pending').length || 0}
              </div>
              <div className="text-sm text-gray-500">Chờ xác nhận</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {listReservations?.data?.filter(r => r.status === 'confirmed').length || 0}
              </div>
              <div className="text-sm text-gray-500">Đã xác nhận</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {listReservations?.data?.filter(r => 
                  dayjs(r.reservation_date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
                ).length || 0}
              </div>
              <div className="text-sm text-gray-500">Hôm nay</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {listReservations?.data?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Tổng cộng</div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Table */}
      <Table<Reservation>
        columns={columns}
        dataSource={filterByDate(listReservations?.data)?.filter(r => 
          !searchText || 
          r.name.toLowerCase().includes(searchText.toLowerCase()) ||
          r.phone.includes(searchText) ||
          (r.notes && r.notes.toLowerCase().includes(searchText.toLowerCase()))
        )}
        loading={loading || isLoadingList}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đặt bàn`,
          pageSize: 10,
        }}
        scroll={{ x: 1000 }}
        size="small"
      />

      {/* Enhanced Modal for Regular Booking */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <TableOutlined />
            {editingReservation ? "Sửa đặt bàn" : "Đặt bàn mới"}
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          clearCustomerSelection();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {renderReservationForm()}
      </Modal>


    </Card>
  );
};

export default ManageReservations;