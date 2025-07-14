import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Button, DatePicker, TimePicker,
  InputNumber, Select, message, Typography, Alert, Row, Col, Space, Tag, Card
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, PhoneOutlined, UserOutlined, TableOutlined,
  CalendarOutlined, TeamOutlined, CommentOutlined, CheckCircleOutlined,
  UserAddOutlined, ClearOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCreate, useUpdate, useList } from '@refinedev/core';
import type { Reservation, TableModel, Customer } from '@/types';
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

interface ReservationModalProps {
  isVisible: boolean;
  editingReservation: Reservation | null;
  onCancel: () => void;
  onSuccess: () => void;
  listReservations?: {
    data?: Reservation[];
  };
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  isVisible,
  editingReservation,
  onCancel,
  onSuccess,
  listReservations
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Customer lookup states
  const [customerSearchValue, setCustomerSearchValue] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<CustomerSearchResult[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  
  // Function to get default time rounded to nearest 30 minutes (00 or 30)
  const getDefaultTime = () => {
    const now = dayjs();
    const minutes = now.minute();
    const roundedTime = now.clone();
    
    if (minutes < 30) {
      // Round to :30 of current hour
      return roundedTime.minute(30).second(0);
    } else {
      // Round to :00 of next hour
      return roundedTime.add(1, 'hour').minute(0).second(0);
    }
  };
  
  const [searchParams, setSearchParams] = useState({
    date: dayjs(),
    time: getDefaultTime(),
    guests: 1
  });

  // Available tables based on date/time/guests
  const [availableTables, setAvailableTables] = useState<TableModel[]>([]);
  const [hasSearchedTables, setHasSearchedTables] = useState(false);
  const [isSearchingTables, setIsSearchingTables] = useState(false);

  // Tạo useState để lưu các tham số filter
  const [tableFilters, setTableFilters] = useState({
    capacity: searchParams.guests,
    capacity_operator: 'gte',
    available: true,
    date: searchParams.date.format('YYYY-MM-DD'),
    time: searchParams.time.format('HH:mm:00')
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

  // Dùng useEffect để tự động gọi refetchListTables khi tableFilters thay đổi
  const [shouldRefetch, setShouldRefetch] = useState(false);
  
  useEffect(() => {
    if (shouldRefetch) {
      const fetchData = async () => {
        try {
          const result = await refetchAvailableTables();
          
          // Sử dụng kết quả trực tiếp từ refetch thay vì listTables
          if (result && result.data && result.data.data) {
            setAvailableTables(result.data.data);
            if (result.data.data.length === 0) {
              message.warning('Không tìm thấy bàn phù hợp. Vui lòng thay đổi thời gian hoặc số khách.');
            }
          } else {
            setAvailableTables([]);
            message.warning('Không tìm thấy bàn phù hợp. Vui lòng thay đổi thời gian hoặc số khách.');
          }
          setHasSearchedTables(true);
          setIsSearchingTables(false);
        } catch (error) {
          console.error("Error fetching tables:", error);
          message.error('Không thể tải danh sách bàn. Vui lòng thử lại.');
          setIsSearchingTables(false);
        }
      };
      
      fetchData();
      setShouldRefetch(false);
    }
  }, [refetchAvailableTables, shouldRefetch]);

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

  // Step 1: Nhập thông tin cơ bản
  const handleSearchTables = async () => {
    const formValues = form.getFieldsValue(['date', 'time', 'number_of_guests']);
    
    if (!formValues.date || !formValues.time || !formValues.number_of_guests) {
      message.warning('Vui lòng nhập đầy đủ thông tin ngày, giờ và số khách');
      return;
    }

    try {
      setIsSearchingTables(true);
      // Combine date and time for comparison
      const selectedDateTime = formValues.date.clone().hour(formValues.time.hour()).minute(formValues.time.minute());
      const currentDateTime = dayjs();
      
      if(selectedDateTime.isBefore(currentDateTime)) {
        message.error('Thời gian đặt bàn phải lớn hơn thời gian hiện tại');
        setIsSearchingTables(false);
        return;
      }
      
      // Cập nhật searchParams
      setSearchParams({
        date: formValues.date,
        time: formValues.time,
        guests: formValues.number_of_guests
      });
      
      // Cập nhật tableFilters và trigger refetch
      setTableFilters({
        capacity: formValues.number_of_guests,
        capacity_operator: 'gte',
        available: true,
        date: formValues.date.format('YYYY-MM-DD'),
        time: formValues.time.format('HH:mm:00')
      });
      setShouldRefetch(true);
    } catch (error) {
      message.error('Có lỗi xảy ra khi tìm bàn trống');
      setIsSearchingTables(false);
    }
  };

  // Add template to notes
  const addTemplate = (template: string) => {
    const currentNotes = form.getFieldValue('notes') || '';
    const newNotes = currentNotes ? `${currentNotes}, ${template}` : template;
    form.setFieldValue('notes', newNotes);
  };

  // Check for table availability conflicts
  const checkTableAvailability = (
    tableId: number, 
    reservationDateTime: dayjs.Dayjs, 
    excludeReservationId?: number
  ): { hasConflict: boolean; conflictReservation?: Reservation } => {
    const timeBuffer = 120; // 2 hours buffer in minutes
    
    const conflict = listReservations?.data?.find((r: Reservation) => 
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
      
      const combinedDateTime = searchParams.date
        .hour(searchParams.time.hour())
        .minute(searchParams.time.minute())
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

      // Kiểm tra khách đã có đặt bàn khác trong ngày chưa
      if (!editingReservation) {
        const existingReservation = listReservations?.data?.find((r: Reservation) => 
          r.phone === values.phone && 
          dayjs(r.reservation_date).format('YYYY-MM-DD') === searchParams.date.format('YYYY-MM-DD') &&
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
      name: values.name,
      phone: values.phone,
      table_id: values.table_id,
      number_of_guests: searchParams.guests,
      notes: values.notes,
      reservation_date: combinedDateTime.unix(),
      customer_id: selectedCustomer?.id,
      creator_type: 'staff',
      status: 'pending',
    };

    if (editingReservation) {
      updateReservation({
        resource: 'reservations',
        id: editingReservation.id,
        values: formattedData
      })
    } else {
      createReservation({
        resource: 'reservations',
        values: formattedData
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    clearCustomerSelection();
    setAvailableTables([]);
    setHasSearchedTables(false);
    onCancel();
  };

  // Set form values when editing
  useEffect(() => {
    if (editingReservation && isVisible) {
      const reservationDate = dayjs(editingReservation.reservation_date);
      
      form.setFieldsValue({
        name: editingReservation.name,
        phone: editingReservation.phone,
        table_id: editingReservation.table_id,
        date: reservationDate,
        time: reservationDate,
        number_of_guests: editingReservation.number_of_guests,
        notes: editingReservation.notes,
      });
      
      // Reset table search state for editing
      setAvailableTables([]);
      setHasSearchedTables(false);
    } else if (!editingReservation && isVisible) {
      // Set default values from searchParams for new reservation
      form.setFieldsValue({
        date: searchParams.date,
        time: searchParams.time,
        number_of_guests: searchParams.guests,
      });
      
      // Reset table search state for new reservation
      setAvailableTables([]);
      setHasSearchedTables(false);
    }
  }, [editingReservation, isVisible, form, searchParams]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <TableOutlined />
          {editingReservation ? "Sửa đặt bàn" : "Đặt bàn mới"}
        </div>
      }
      open={isVisible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={(changedValues) => {
          // Reset table search when form values change
          if (changedValues.date || changedValues.time || changedValues.number_of_guests) {
            setAvailableTables([]);
            setHasSearchedTables(false);
            form.setFieldValue('table_id', undefined);
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
              message={`Khách hàng: ${selectedCustomer.name}`}
              description={`Điểm tích lũy: ${selectedCustomer.point || 0}`}
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
                  minuteStep={30}
                  disabledTime={() => ({
                    disabledMinutes: () => [15, 45] // Chỉ cho phép chọn phút 00 và 30
                  })}
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
                  min={1} max={30}
                  className="w-full"
                  prefix={<TeamOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="text-center mt-4">
            <Button
              type="primary"
              onClick={handleSearchTables}
              loading={isSearchingTables}
              icon={<SearchOutlined />}
              size="large"
            >
              Tìm bàn trống
            </Button>
          </div>
        </Card>

        {/* Table Selection */}
        {hasSearchedTables && (
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
                description="Vui lòng thay đổi thời gian hoặc số khách và tìm lại."
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
        )}

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
            <Button onClick={handleCancel}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading || isCreating || isUpdating}
              disabled={!hasSearchedTables || availableTables.length === 0}
              icon={editingReservation ? <CheckCircleOutlined /> : <PlusOutlined />}
            >
              {editingReservation ? 'Cập nhật đặt bàn' : 'Xác nhận đặt bàn'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReservationModal; 