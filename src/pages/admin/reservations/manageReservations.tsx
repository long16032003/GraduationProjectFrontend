import React, { useState, useRef } from 'react';
import { Table, Button, Space, Card, Input, Modal, Form, DatePicker, TimePicker, InputNumber, Select, message, Tag, Tooltip, Popover } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { Key } from 'react';
import dayjs from 'dayjs';
import { Link, useCreate, useDelete, useUpdate } from '@refinedev/core';
import type { Reservation, TableModel } from '@/types';
import { useList } from '@refinedev/core';

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

interface TableAvailabilityParams {
  tableId: number;
  date: dayjs.Dayjs;
}

const ManageReservations: React.FC = () => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [dateFilter, setDateFilter] = useState<dayjs.Dayjs | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Mock data - sẽ được thay thế bằng API call
  const { data: listReservations, isLoading: isLoadingList } = useList<Reservation>({
    resource: 'reservations',
  });
  const { data: listTables, isLoading: isLoadingTables } = useList<TableModel>({
    resource: 'tables',
  });

  const { mutate: createReservation, isLoading: isCreating } = useCreate<Reservation>();
  const { mutate: deleteReservation, isLoading: isDeleting } = useDelete<Reservation>();
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

  // Thêm hàm lọc theo ngày
  const filterByDate = (data: Reservation[] | undefined): Reservation[] => {
    if (!data) return [];
    if (!dateFilter) return data;

    return data.filter(record => {
      const recordDate = dayjs(record.reservation_date);
      return recordDate.format('YYYY-MM-DD') === dateFilter.format('YYYY-MM-DD');
    });
  };

  // Tạo DatePicker cho bộ lọc ngày
  const renderDateFilterDropdown = () => (
    <div style={{ padding: 8 }}>
      <Space direction="vertical" size={12}>
        <DatePicker 
          value={dateFilter}
          onChange={value => {
            setDateFilter(value);
            // Tự động áp dụng bộ lọc khi chọn ngày
            if (value) {
              message.info(`Đã lọc theo ngày: ${value.format('DD/MM/YYYY')}`);
            }
            // Đóng popup sau khi chọn
            setDatePickerOpen(false);
          }}
          allowClear
          placeholder="Chọn ngày"
          format="DD/MM/YYYY"
          style={{ width: '100%' }}
          open={datePickerOpen}
          onOpenChange={(open) => setDatePickerOpen(open)}
          autoFocus={datePickerOpen}
        />
      </Space>
    </div>
  );

  const columns: ColumnType<Reservation>[] = [
    {
      title: 'Mã KH',
      dataIndex: 'customer_id',
      key: 'customer_id',
      render: (text: string) => {
        // return <Link to={`/customers/${text}`}>{text}</Link>;
        return text ? text : '------';
      },
    },
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Reservation, b: Reservation) => {
        if (a.customer?.name && b.customer?.name) {
          return a.customer.name.localeCompare(b.customer.name);
        }
        return 0;
      },
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Bàn',
      dataIndex: 'table_id',
      key: 'table_id',
      filters: listTables?.data?.map((table: TableModel) => ({ text: table.name, value: table.id })),
      onFilter: (value: boolean | Key, record: Reservation) => 
        record.table?.id === value,
    },
    {
      title: 'Ngày',
      dataIndex: 'reservation_date',
      key: 'reservation_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      filterDropdown: renderDateFilterDropdown,
      filterIcon: (filtered: boolean) => (
        <FilterOutlined 
          style={{ color: filtered ? '#1890ff' : undefined }} 
          onClick={() => {
            setDatePickerOpen(true);
          }}
        />
      ),
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setDatePickerOpen(true);
        }
      },
    },
    {
      title: 'Giờ',
      dataIndex: 'reservation_date',
      key: 'reservation_date',
      sorter: (a: Reservation, b: Reservation) => 
        dayjs(a.reservation_date).unix() - dayjs(b.reservation_date).unix(),
      render: (date: string) => dayjs(date).format('HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusColors) => (
        <Tag color={statusColors[status]}>{statusTexts[status]}</Tag>
      ),
      filters: Object.entries(statusTexts).map(([value, text]) => ({ text, value })),
      onFilter: (value: boolean | Key, record: Reservation) => 
        record.status === value,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: Reservation) => (
        <Space size="middle">
          <Button 
            type="primary" 
            onClick={() => handleEdit(record)}
            disabled={record.status === 'cancelled'}
          >
            Sửa
          </Button>
          <Button 
            danger 
            onClick={() => showCancelConfirm(record)}
            disabled={record.status === 'cancelled'}
          >
            Hủy
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingReservation(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Reservation) => {
    setEditingReservation(record);
    const reservationDate = dayjs(record.reservation_date);
    
    form.setFieldsValue({
      name: record.name,
      phone: record.phone,
      table_id: record.table_id,
      date: reservationDate,
      time: reservationDate,
      notes: record.notes,
    });
    setIsModalVisible(true);
  };

  const showCancelConfirm = (record: Reservation) => {
    Modal.confirm({
      title: 'Xác nhận hủy đặt bàn',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn hủy đặt bàn này?`,
      okText: 'Xác nhận',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          setLoading(true);
          // API call để hủy đặt bàn
          // await cancelReservation(record.id);
          message.success('Hủy đặt bàn thành công');
        } catch (error) {
          message.error('Có lỗi xảy ra khi hủy đặt bàn');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const checkTableAvailability = async (values: TableAvailabilityParams) => {
    // API call để kiểm tra bàn trống
    // const isAvailable = await checkAvailability(values.tableId, values.date, values.time);
    // return isAvailable;
    return true; // Mock response
  };

  const handleSubmit = async (values: ReservationFormData) => {
    try {
      setLoading(true);
      
      // Kết hợp ngày và giờ thành một timestamp
      const combinedDateTime = values.date
        .hour(values.time.hour())
        .minute(values.time.minute())
        .second(0);
      
      // Kiểm tra bàn trống
      const availabilityParams: TableAvailabilityParams = {
        tableId: values.table_id,
        date: combinedDateTime,
      };
      
      const isAvailable = await checkTableAvailability(availabilityParams);
      if (!isAvailable) {
        message.error('Bàn đã được đặt trong thời gian này. Vui lòng chọn bàn khác hoặc thời gian khác.');
        return;
      }

      const formattedData = {
        ...values,
        reservation_date: combinedDateTime.format('YYYY-MM-DD HH:mm:ss'),
        // Loại bỏ các trường không cần thiết
        date: undefined,
        time: undefined,
      };

      if (editingReservation) {
        // API call để cập nhật đặt bàn
        // await updateReservation(editingReservation.id, formattedData);
        message.success('Cập nhật đặt bàn thành công');
      } else {
        // API call để thêm đặt bàn mới
        // await createReservation(formattedData);
        message.success('Đặt bàn thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">Quản lý đặt bàn</span>
      </div>
    } className="m-4">
      <div className="mb-4 flex justify-between items-center">
        <Space>
          <Input.Search
            placeholder="Tìm kiếm theo tên khách hàng hoặc số điện thoại..."
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Thêm đặt bàn
        </Button>
      </div>

      <Table<Reservation>
        columns={columns}
        dataSource={filterByDate(listReservations?.data)}
        loading={loading || isLoadingList}
        rowKey="name"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng số ${total} đặt bàn`,
        }}
      />

      <Modal
        title={editingReservation ? "Sửa đặt bàn" : "Thêm đặt bàn mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[
              { required: true, message: 'Vui lòng nhập tên khách hàng' },
              { max: 100, message: 'Tên không được quá 100 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="table_id"
            label="Chọn bàn"
            rules={[{ required: true, message: 'Vui lòng chọn bàn' }]}
          >
            <Select>
              {listTables?.data?.map((table: TableModel) => (
                <Select.Option key={table.id} value={table.id}>
                  {table.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Space size="large" className="w-full">
            <Form.Item
              name="date"
              label="Ngày"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              className="w-full"
            >
              <DatePicker 
                className="w-full"
                format="DD/MM/YYYY"
                disabledDate={(current) => {
                  return current && current < dayjs().startOf('day');
                }}
              />
            </Form.Item>

            <Form.Item
              name="time"
              label="Giờ"
              rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
              className="w-full"
            >
              <TimePicker 
                className="w-full"
                format="HH:mm"
                minuteStep={30}
              />
            </Form.Item>
          </Space>

          <Form.Item
            name="number_of_guests"
            label="Số khách"
            rules={[
              { required: true, message: 'Vui lòng nhập số khách' },
              { type: 'number', min: 1, message: 'Số khách phải lớn hơn 0' }
            ]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
            rules={[
              { max: 500, message: 'Ghi chú không được quá 500 ký tự' }
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>

          <Form.Item className="flex justify-end">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingReservation ? 'Cập nhật' : 'Đặt bàn'}
              </Button>
            </Space>
          </Form.Item>
      </Modal>
    </Card>
  );
};

export default ManageReservations;