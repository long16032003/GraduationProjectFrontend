import React, { useState } from 'react';
import {
  Table,
  Button,
  Card,
  Space,
  Tag,
  Input,
  Row,
  Col,
  Typography,
  Breadcrumb,
  Tooltip,
  Modal,
  Form,
  message,
  Popconfirm,
  Badge,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  KeyOutlined,
  TrophyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PageLoader } from '@/components/ui/loader';
import type { Customer } from '@/types';
import { useList } from '@refinedev/core';

const { Title, Text } = Typography;

// Mock data for demonstration
// const generateMockCustomers = (): Customer[] => {
//   return [
//     {
//       id: 1,
//       uuid: '550e8400-e29b-41d4-a716-446655440000',
//       name: 'Nguyễn Văn A',
//       phone: '0901234567',
//       email: 'nguyenvana@example.com',
//       point: 150,
//       created_at: '2023-01-15T08:30:00',
//       updated_at: '2023-05-20T14:20:00'
//     },
//     {
//       id: 2,
//       uuid: '550e8400-e29b-41d4-a716-446655440001',
//       name: 'Trần Thị B',
//       phone: '0912345678',
//       email: 'tranthib@example.com',
//       point: 320,
//       created_at: '2023-02-10T10:15:00',
//       updated_at: '2023-06-05T09:45:00'
//     },
//     {
//       id: 3,
//       uuid: '550e8400-e29b-41d4-a716-446655440002',
//       name: 'Lê Văn C',
//       phone: '0923456789',
//       email: 'levanc@example.com',
//       point: 80,
//       created_at: '2023-03-05T14:20:00',
//       updated_at: '2023-03-05T14:20:00'
//     },
//     {
//       id: 4,
//       uuid: '550e8400-e29b-41d4-a716-446655440003',
//       name: 'Phạm Thị D',
//       phone: '0934567890',
//       email: 'phamthid@example.com',
//       point: 450,
//       created_at: '2023-01-20T11:30:00',
//       updated_at: '2023-06-10T16:40:00'
//     },
//     {
//       id: 5,
//       uuid: '550e8400-e29b-41d4-a716-446655440004',
//       name: 'Hoàng Văn E',
//       phone: '0945678901',
//       email: 'hoangvane@example.com',
//       point: 200,
//       created_at: '2023-04-12T09:10:00',
//       updated_at: '2023-05-22T13:15:00'
//     },
//     {
//       id: 6,
//       uuid: '550e8400-e29b-41d4-a716-446655440005',
//       name: 'Võ Thị F',
//       phone: '0956789012',
//       email: 'vothif@example.com',
//       point: 120,
//       created_at: '2023-02-28T15:45:00',
//       updated_at: '2023-04-18T10:30:00'
//     },
//     {
//       id: 7,
//       uuid: '550e8400-e29b-41d4-a716-446655440006',
//       name: 'Đặng Văn G',
//       phone: '0967890123',
//       email: 'dangvang@example.com',
//       point: 280,
//       created_at: '2023-03-15T13:20:00',
//       updated_at: '2023-06-01T09:50:00'
//     },
//     {
//       id: 8,
//       uuid: '550e8400-e29b-41d4-a716-446655440007',
//       name: 'Bùi Thị H',
//       phone: '0978901234',
//       email: 'buithih@example.com',
//       point: 180,
//       created_at: '2023-05-05T10:10:00',
//       updated_at: '2023-06-12T14:25:00'
//     },
//     {
//       id: 9,
//       uuid: '550e8400-e29b-41d4-a716-446655440008',
//       name: 'Lý Văn I',
//       phone: '0989012345',
//       email: 'lyvani@example.com',
//       point: 90,
//       created_at: '2023-04-20T16:30:00',
//       updated_at: '2023-04-20T16:30:00'
//     },
//     {
//       id: 10,
//       uuid: '550e8400-e29b-41d4-a716-446655440009',
//       name: 'Ngô Thị K',
//       phone: '0990123456',
//       email: 'ngothik@example.com',
//       point: 350,
//       created_at: '2023-01-30T12:40:00',
//       updated_at: '2023-05-28T11:15:00'
//     }
//   ];
// };

const ManageCustomer: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [form] = Form.useForm();

  const { data: customers, isLoading: isLoadingCustomers } = useList<Customer>({
    resource: 'customers',
    sorters: [
      {
        field: 'point',
        order: 'desc'
      }
    ]
  });

  // Filter customers based on search text
  const filteredCustomers = customers?.data.filter(customer => {
    const searchLower = searchText.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchText) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.point.toString().includes(searchText)
    );
  });

  // Get point level color
  const getPointLevelColor = (point: number) => {
    if (point >= 400) return 'gold';
    if (point >= 300) return 'purple';
    if (point >= 200) return 'blue';
    if (point >= 100) return 'cyan';
    return 'default';
  };

  // Get point level text
  const getPointLevelText = (point: number) => {
    if (point >= 400) return 'Kim cương';
    if (point >= 300) return 'Bạch kim';
    if (point >= 200) return 'Vàng';
    if (point >= 100) return 'Bạc';
    return 'Đồng';
  };

  // Handle view customer
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('view');
    setIsModalVisible(true);
  };

  // Handle edit customer
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('edit');
    form.setFieldsValue({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      point: customer.point
    });
    setIsModalVisible(true);
  };

  // Handle add new customer
  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setModalMode('add');
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle delete customer
  const handleDeleteCustomer = (id: number) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      message.success('Xóa khách hàng thành công!');
      setIsLoading(false);
    }, 1000);
  };

  // Form values interface
  interface CustomerFormValues {
    name: string;
    phone: string;
    email: string;
    password?: string;
    point: number;
  }

  // Handle form submit
  const handleFormSubmit = (values: CustomerFormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form values:', values);
      
      if (modalMode === 'add') {
        message.success('Thêm khách hàng mới thành công!');
      } else {
        message.success('Cập nhật thông tin khách hàng thành công!');
      }
      
      setIsModalVisible(false);
      setIsLoading(false);
    }, 1000);
  };

  // Customer table columns
  const columns: ColumnsType<Customer> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <span className="font-medium">{name}</span>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Điểm tích lũy',
      dataIndex: 'point',
      key: 'point',
      width: 150,
      sorter: (a, b) => a.point - b.point,
      render: (point) => (
        <Space>
          <Badge count={point} showZero overflowCount={1000} style={{ backgroundColor: '#52c41a' }} />
          <Tag color={getPointLevelColor(point)}>
            {getPointLevelText(point)}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => dayjs(date).format('HH:mm DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết" placement="top">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewCustomer(record)}
              className="text-blue-500 hover:text-blue-600"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa" placement="top">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditCustomer(record)}
              className="text-green-500 hover:text-green-600"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa khách hàng"
              description="Bạn có chắc chắn muốn xóa khách hàng này?"
              onConfirm={() => handleDeleteCustomer(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Render modal title based on mode
  const renderModalTitle = () => {
    switch (modalMode) {
      case 'view':
        return 'Chi tiết khách hàng';
      case 'edit':
        return 'Chỉnh sửa thông tin khách hàng';
      case 'add':
        return 'Thêm khách hàng mới';
      default:
        return '';
    }
  };

  if (isLoading || isLoadingCustomers) {
    return <PageLoader text="Đang tải dữ liệu..." />;
  }

  return (
    <div className="p-4">
      <Card className="shadow-sm mb-4">
        
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="m-0">
            <UserOutlined className="mr-2" />
            Danh sách khách hàng
          </Title>
          
          {/* <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddCustomer}
          >
            Thêm khách hàng mới
          </Button> */}
        </div>
        
        <Row gutter={16} className="mb-4">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên, SĐT, email, điểm..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
          scroll={{ x: 1100 }}
        />
      </Card>
      
      {/* Customer Modal */}
      <Modal
        title={renderModalTitle()}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={modalMode === 'view' ? [
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ] : null}
        width={700}
      >
        {modalMode === 'view' && selectedCustomer && (
          <Tabs 
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: 'Thông tin cá nhân',
                children: (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>ID:</strong> {selectedCustomer.id}</p>
                      <p><strong>UUID:</strong> {selectedCustomer.uuid}</p>
                      <p><strong>Họ tên:</strong> {selectedCustomer.name}</p>
                      <p><strong>Số điện thoại:</strong> {selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <p><strong>Email:</strong> {selectedCustomer.email}</p>
                      <p>
                        <strong>Điểm tích lũy:</strong> {selectedCustomer.point} điểm
                        <Tag color={getPointLevelColor(selectedCustomer.point)} className="ml-2">
                          {getPointLevelText(selectedCustomer.point)}
                        </Tag>
                      </p>
                      <p><strong>Ngày đăng ký:</strong> {dayjs(selectedCustomer.created_at).format('DD/MM/YYYY HH:mm')}</p>
                      <p><strong>Cập nhật lần cuối:</strong> {dayjs(selectedCustomer.updated_at).format('DD/MM/YYYY HH:mm')}</p>
                    </div>
                  </div>
                )
              },
              {
                key: 'orders',
                label: 'Lịch sử đơn hàng',
                children: (
                  <div className="text-center py-8">
                    <Text type="secondary">Chức năng đang phát triển</Text>
                  </div>
                )
              },
              {
                key: 'points',
                label: 'Lịch sử điểm thưởng',
                children: (
                  <div className="text-center py-8">
                    <Text type="secondary">Chức năng đang phát triển</Text>
                  </div>
                )
              }
            ]}
          />
        )}
        
        {(modalMode === 'edit' || modalMode === 'add') && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
          >
            <Form.Item
              name="name"
              label="Họ tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên khách hàng' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ tên khách hàng" />
            </Form.Item>
            
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập email" />
            </Form.Item>
            
            {modalMode === 'add' && (
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                ]}
              >
                <Input.Password
                  prefix={<KeyOutlined />}
                  placeholder="Nhập mật khẩu"
                  iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>
            )}
            
            <Form.Item
              name="point"
              label="Điểm tích lũy"
              rules={[{ required: true, message: 'Vui lòng nhập điểm tích lũy' }]}
            >
              <Input 
                prefix={<TrophyOutlined />} 
                type="number" 
                min={0}
                placeholder="Nhập điểm tích lũy" 
              />
            </Form.Item>
            
            <Form.Item className="mb-0 text-right">
              <Space>
                <Button onClick={() => setIsModalVisible(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {modalMode === 'add' ? 'Thêm khách hàng' : 'Cập nhật'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ManageCustomer;
