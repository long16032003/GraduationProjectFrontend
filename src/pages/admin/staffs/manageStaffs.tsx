import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Card, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm, 
  Tag, 
  Avatar,
  Tooltip,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useList, useCreate, useUpdate, useDelete } from '@refinedev/core';
import dayjs from 'dayjs';
import type { Staff } from '@/types';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';

const { Option } = Select;

// Cấu hình phân quyền
const ROLE_PERMISSIONS = {
  // Các role được bảo vệ - không thể chỉnh sửa/xóa
  PROTECTED_ROLES: ['admin'],
  // Các role có thể chỉnh sửa/xóa
  EDITABLE_ROLES: ['manager', 'staff', 'chef', 'cashier', 'service staff'],
  // Các role có thể xem email
  EMAIL_VISIBLE_ROLES: ['manager', 'staff', 'chef', 'cashier', 'service staff']
};

// Helper functions cho phân quyền
const canEditRole = (targetRole: string, currentUserRole?: string): boolean => {
  // Không thể chỉnh sửa các role được bảo vệ
  if (ROLE_PERMISSIONS.PROTECTED_ROLES.includes(targetRole)) {
    return false;
  }
  
  // Manager không thể chỉnh sửa/xóa manager khác
  if (currentUserRole === 'manager' && targetRole === 'manager') {
    return false;
  }
  
  return true;
};

const canShowEmail = (role: string): boolean => {
  return ROLE_PERMISSIONS.EMAIL_VISIBLE_ROLES.includes(role);
};

// Helper function để lấy danh sách role có thể tạo/chỉnh sửa dựa trên quyền hiện tại
const getAvailableRoles = (currentUserRole?: string, editingUserRole?: string) => {
  if (currentUserRole === 'admin') {
    // Admin có thể tạo/chỉnh sửa tất cả role
    return [
      { value: 'manager', label: 'Quản trị viên', color: 'red' },
      { value: 'staff', label: 'Nhân viên', color: 'blue' },
      { value: 'chef', label: 'Đầu bếp', color: 'green' },
      { value: 'cashier', label: 'Nhân viên thu ngân', color: 'yellow' },
      { value: 'service staff', label: 'Nhân viên phục vụ', color: 'purple' }
    ];
  } else if (currentUserRole === 'manager') {
    // Manager chỉ có thể tạo/chỉnh sửa role thấp hơn
    const availableRoles = [
      { value: 'staff', label: 'Nhân viên', color: 'blue' },
      { value: 'chef', label: 'Đầu bếp', color: 'green' },
      { value: 'cashier', label: 'Nhân viên thu ngân', color: 'yellow' },
      { value: 'service staff', label: 'Nhân viên phục vụ', color: 'purple' }
    ];
    
    // Nếu đang chỉnh sửa user có role manager, thêm manager vào để giữ nguyên
    if (editingUserRole === 'manager') {
      return [
        { value: 'manager', label: 'Quản trị viên', color: 'red' },
        ...availableRoles
      ];
    }
    
    return availableRoles;
  } else {
    // Các role khác không có quyền tạo user
    return [];
  }
};

const ManageStaffs: React.FC = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<Staff | null>(null);
  const [viewingUser, setViewingUser] = useState<Staff | null>(null);

  // Lấy thông tin user hiện tại
  const currentUser = use$(auth$.user);
  const currentUserRole = currentUser?.role;

  // Fetch staff list (users with role admin, staff, or chef)
  const { data: staffData, isLoading, refetch } = useList<Staff>({
    resource: 'staffs',
    filters: [
      {
        field: 'role',
        operator: 'in',
        value: ['manager', 'staff', 'chef']
      }
    ],
    sorters: [
      {
        field: 'created_at',
        order: 'desc'
      }
    ]
  });

  const { mutate: createUser, isLoading: isCreating } = useCreate();
  const { mutate: updateUser, isLoading: isUpdating } = useUpdate();
  const { mutate: deleteUser, isLoading: isDeleting } = useDelete();

  const staffs = staffData?.data || [];

  // Statistics
  const totalStaffs = staffs.length;
  const adminCount = staffs.filter(s => s.role === 'manager').length;
  const staffCount = staffs.filter(s => s.role === 'staff').length;
  const chefCount = staffs.filter(s => s.role === 'chef').length;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'blue';
      case 'manager': return 'red';
      case 'chef': return 'green';
      case 'cashier': return 'yellow';
      case 'service staff': return 'purple';
      default: return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Quản trị viên';
      case 'chef': return 'Đầu bếp';
      case 'cashier': return 'Nhân viên thu ngân';
      case 'service staff': return 'Nhân viên phục vụ';
      default: return role;
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: 'Nhân viên',
      key: 'user_info',
      width: 200,
      render: (user: Staff) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            className="bg-blue-500"
          >
            {user.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{user.name}</div>
            {canShowEmail(user.role) && (
              <div className="text-sm text-gray-500">{user.email}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (phone: string) => (
        <div className="text-sm">{phone || 'Chưa cập nhật'}</div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => (
        <Tag color={getRoleColor(role)} className="font-medium">
          {getRoleText(role)}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin'},
        { text: 'Quản trị viên', value: 'manager' },
        { text: 'Nhân viên thu ngân', value: 'cashier' },
        { text: 'Nhân viên phục vụ', value: 'service staff' },
        { text: 'Đầu bếp', value: 'chef' },
      ],
      onFilter: (value: unknown, record: Staff) => record.role === value,
    },
    {
      title: 'Ngày tham gia',
      key: 'created_at',
      width: 150,
      render: (user: Staff) => (
        <div className="text-sm">
          <div>{user.created_at ? dayjs(user.created_at).format('DD/MM/YYYY') : 'N/A'}</div>
          <div className="text-gray-500">{user.created_at ? dayjs(user.created_at).format('HH:mm') : ''}</div>
        </div>
      ),
      sorter: (a: Staff, b: Staff) => {
        if (!a.created_at || !b.created_at) return 0;
        return dayjs(a.created_at).unix() - dayjs(b.created_at).unix();
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (user: Staff) => {
        const canEdit = canEditRole(user.role, currentUserRole);
        
        if (!canEdit) {
          return (
            <Tooltip title={
              user.role === 'admin' 
                ? "Không thể chỉnh sửa tài khoản Admin" 
                : "Manager không thể chỉnh sửa Manager khác"
            }>
              <Tag color="default" className="cursor-not-allowed">Không có quyền</Tag>
            </Tooltip>
          );
        }
        
        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleView(user)}
                className="text-blue-500 hover:text-blue-600"
              />
            </Tooltip>
            <Tooltip title="Sửa thông tin">
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(user)}
                className="text-green-500 hover:text-green-600"
              />
            </Tooltip>
            <Tooltip title="Xóa nhân viên">
              <Popconfirm
                title="Xóa nhân viên"
                description="Bạn có chắc chắn muốn xóa nhân viên này?"
                onConfirm={() => handleDelete(user.id!)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  className="text-red-500 hover:text-red-600"
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user: Staff) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
    setIsEditModalVisible(true);
  };

  const handleView = (user: Staff) => {
    setViewingUser(user);
    setIsViewModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser({
        resource: 'staffs',
        id,
      });
      message.success('Xóa nhân viên thành công');
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa nhân viên');
    }
  };

  interface StaffFormValues {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: string;
  }

  const handleSubmit = async (values: StaffFormValues) => {
    try {
      await createUser({
        resource: 'staffs',
        values: {
          ...values,
          password: values.password || '123456', // Default password
        },
      });
      message.success('Thêm nhân viên thành công');
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm nhân viên');
    }
  };

  const handleUpdate = async (values: Omit<StaffFormValues, 'password'>) => {
    if (!editingUser) return;
    
    try {
      await updateUser({
        resource: 'staffs',
        id: editingUser.id!,
        values,
      });
      message.success('Cập nhật thông tin nhân viên thành công');
      setIsEditModalVisible(false);
      setEditingUser(null);
      editForm.resetFields();
      refetch();
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Statistics Cards */}
      {/* <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng nhân viên"
              value={totalStaffs}
              prefix={<TeamOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Quản trị viên"
              value={adminCount}
              prefix={<UserOutlined className="text-red-500" />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Nhân viên"
              value={staffCount}
              prefix={<UserOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đầu bếp"
              value={chefCount}
              prefix={<UserOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row> */}

      {/* Main Table */}
      <Card 
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TeamOutlined className="text-orange-500" />
              <span className="text-lg font-semibold">Quản lý nhân viên</span>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
            >
              Thêm nhân viên
            </Button>
          </div>
        }
        className="shadow-sm"
      >
        <Table
          columns={columns}
          dataSource={staffs}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: totalStaffs,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} nhân viên`,
          }}
          scroll={{ x: 800 }}
          className="ant-table-striped"
          rowClassName={(_, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
        />
      </Card>

      {/* Add User Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <PlusOutlined className="text-orange-500" />
            <span>Thêm nhân viên mới</span>
          </div>
        }
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
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên' },
                  { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
                ]}
              >
                <Input 
                  placeholder="Nhập họ và tên"
                  prefix={<UserOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input 
                  placeholder="Nhập email"
                  prefix={<MailOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { 
                pattern: /^[0-9]{10,11}$/, 
                message: 'Số điện thoại phải có 10-11 chữ số' 
              }
            ]}
          >
            <Input 
              placeholder="Nhập số điện thoại"
              prefix={<PhoneOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò">
              {getAvailableRoles(currentUserRole).map(role => (
                <Option key={role.value} value={role.value}>
                  <div className="flex items-center space-x-2">
                    <Tag color={role.color}>{role.label}</Tag>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            extra="Nếu để trống, mật khẩu mặc định sẽ là '123456'"
          >
            <Input.Password placeholder="Nhập mật khẩu (tùy chọn)" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={isCreating}
              >
                Thêm nhân viên
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <EditOutlined className="text-green-500" />
            <span>Sửa thông tin nhân viên</span>
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingUser(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên' },
                  { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
                ]}
              >
                <Input 
                  placeholder="Nhập họ và tên"
                  prefix={<UserOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input 
                  placeholder="Nhập email"
                  prefix={<MailOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { 
                pattern: /^[0-9]{10,11}$/, 
                message: 'Số điện thoại phải có 10-11 chữ số' 
              }
            ]}
          >
            <Input 
              placeholder="Nhập số điện thoại"
              prefix={<PhoneOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select 
              placeholder="Chọn vai trò"
              disabled={currentUserRole === 'manager' && editingUser?.role === 'manager'}
            >
              {getAvailableRoles(currentUserRole, editingUser?.role).map(role => (
                <Option key={role.value} value={role.value}>
                  <div className="flex items-center space-x-2">
                    <Tag color={role.color}>{role.label}</Tag>
                  </div>
                </Option>
              ))}
            </Select>
            {currentUserRole === 'manager' && editingUser?.role === 'manager' && (
              <div className="text-xs text-gray-500 mt-1">
                Manager không thể thay đổi vai trò của Manager khác
              </div>
            )}
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setIsEditModalVisible(false);
                setEditingUser(null);
                editForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={isUpdating}
                className="bg-green-500 hover:bg-green-600"
              >
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View User Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <EyeOutlined className="text-blue-500" />
            <span>Thông tin chi tiết nhân viên</span>
          </div>
        }
        open={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
          setViewingUser(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsViewModalVisible(false);
            setViewingUser(null);
          }}>
            Đóng
          </Button>
        ]}
        width={500}
      >
        {viewingUser && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-4">
              <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500">
                {viewingUser.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold m-0">{viewingUser.name}</h3>
                <Tag color={getRoleColor(viewingUser.role)} className="mt-1">
                  {getRoleText(viewingUser.role)}
                </Tag>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 pt-4 border-t">
              <div className="flex items-center space-x-3">
                <MailOutlined className="text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{viewingUser.email}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <PhoneOutlined className="text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Số điện thoại</div>
                  <div className="font-medium">{viewingUser.phone || 'Chưa cập nhật'}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <UserOutlined className="text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">ID</div>
                  <div className="font-medium">#{viewingUser.id}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-gray-500">📅</div>
                <div>
                  <div className="text-sm text-gray-500">Ngày tham gia</div>
                  <div className="font-medium">
                    {dayjs(viewingUser.created_at).format('DD/MM/YYYY HH:mm:ss')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageStaffs;