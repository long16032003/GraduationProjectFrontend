import React, { useState } from 'react';
import { Table, Button, Space, Card, Input, Modal, Form, DatePicker, TimePicker, InputNumber, Select, message, Tag } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';

interface Reservation {
  id: string;
  customerName: string;
  phoneNumber: string;
  tableId: string;
  tableName: string;
  date: string;
  time: string;
  numberOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

interface ReservationFormData {
  customerName: string;
  phoneNumber: string;
  tableId: string;
  date: dayjs.Dayjs;
  time: dayjs.Dayjs;
  numberOfGuests: number;
  notes?: string;
}

const ManageReservations: React.FC = () => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  // Mock data - sẽ được thay thế bằng API call
  const tables = [
    { id: '1', name: 'Bàn 1' },
    { id: '2', name: 'Bàn 2' },
    { id: '3', name: 'Bàn VIP 1' },
  ];

  const data: Reservation[] = [
    {
      id: '1',
      customerName: 'Nguyễn Văn A',
      phoneNumber: '0901234567',
      tableId: '1',
      tableName: 'Bàn 1',
      date: '2024-03-20',
      time: '18:30',
      numberOfGuests: 4,
      status: 'confirmed',
      notes: 'Khách VIP',
    },
    {
      id: '2',
      customerName: 'Trần Thị B',
      phoneNumber: '0909876543',
      tableId: '2',
      tableName: 'Bàn 2',
      date: '2024-03-21',
      time: '19:00',
      numberOfGuests: 6,
      status: 'pending',
    },
  ];

  const statusColors = {
    pending: 'orange',
    confirmed: 'green',
    cancelled: 'red',
    completed: 'blue',
  };

  const statusTexts = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã hủy',
    completed: 'Hoàn thành',
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      sorter: (a: Reservation, b: Reservation) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Bàn',
      dataIndex: 'tableName',
      key: 'tableName',
      filters: tables.map(table => ({ text: table.name, value: table.id })),
      onFilter: (value: string, record: Reservation) => record.tableId === value,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: Reservation, b: Reservation) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Giờ',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Số khách',
      dataIndex: 'numberOfGuests',
      key: 'numberOfGuests',
      sorter: (a: Reservation, b: Reservation) => a.numberOfGuests - b.numberOfGuests,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusColors) => (
        <Tag color={statusColors[status]}>{statusTexts[status]}</Tag>
      ),
      filters: Object.entries(statusTexts).map(([value, text]) => ({ text, value })),
      onFilter: (value: string, record: Reservation) => record.status === value,
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
      render: (_: any, record: Reservation) => (
        <Space size="middle">
          <Button 
            type="primary" 
            onClick={() => handleEdit(record)}
            disabled={record.status === 'completed' || record.status === 'cancelled'}
          >
            Sửa
          </Button>
          <Button 
            danger 
            onClick={() => showCancelConfirm(record)}
            disabled={record.status === 'completed' || record.status === 'cancelled'}
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
    form.setFieldsValue({
      customerName: record.customerName,
      phoneNumber: record.phoneNumber,
      tableId: record.tableId,
      date: dayjs(record.date),
      time: dayjs(record.time, 'HH:mm'),
      numberOfGuests: record.numberOfGuests,
      notes: record.notes,
    });
    setIsModalVisible(true);
  };

  const showCancelConfirm = (record: Reservation) => {
    Modal.confirm({
      title: 'Xác nhận hủy đặt bàn',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn hủy đặt bàn của ${record.customerName}?`,
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

  const checkTableAvailability = async (values: any) => {
    // API call để kiểm tra bàn trống
    // const isAvailable = await checkAvailability(values.tableId, values.date, values.time);
    // return isAvailable;
    return true; // Mock response
  };

  const handleSubmit = async (values: ReservationFormData) => {
    try {
      setLoading(true);
      
      // Kiểm tra bàn trống
      const isAvailable = await checkTableAvailability(values);
      if (!isAvailable) {
        message.error('Bàn đã được đặt trong thời gian này. Vui lòng chọn bàn khác hoặc thời gian khác.');
        return;
      }

      const formattedData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
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
    <Card title="Quản lý đặt bàn" className="m-4">
      <div className="mb-4 flex justify-between items-center">
        <Input.Search
          placeholder="Tìm kiếm theo tên khách hàng hoặc số điện thoại..."
          allowClear
          onSearch={value => setSearchText(value)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Thêm đặt bàn
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
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
            name="customerName"
            label="Tên khách hàng"
            rules={[
              { required: true, message: 'Vui lòng nhập tên khách hàng' },
              { max: 100, message: 'Tên không được quá 100 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="tableId"
            label="Chọn bàn"
            rules={[{ required: true, message: 'Vui lòng chọn bàn' }]}
          >
            <Select>
              {tables.map(table => (
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
            name="numberOfGuests"
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
        </Form>
      </Modal>
    </Card>
  );
};

export default ManageReservations;