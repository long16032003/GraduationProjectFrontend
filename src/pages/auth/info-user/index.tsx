import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Avatar, 
  Tag, 
  Button, 
  Form, 
  Input, 
  message,
  Divider,
  Statistic,
  Alert,
  Modal
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CalendarOutlined,
  TrophyOutlined,
  ShoppingOutlined,
  HistoryOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';
import { useUpdate, useList } from '@refinedev/core';
import type { Customer, Staff, Bill, Reservation } from '@/types';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';

const { Title, Text } = Typography;

const getInitials = (name?: string): string => {
  if (!name) return 'U';
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  } else {
    const firstInitial = words[0].charAt(0);
    const lastInitial = words[words.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Không xác định';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const InfoUserPage: React.FC = () => {
  const user = use$(auth$.user);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // API hooks
  const { mutate: updateProfile, isLoading: isUpdatingProfile } = useUpdate();
  const { mutate: changePassword, isLoading: isChangingPasswordLoading } = useUpdate();

  // Lấy thống kê cho khách hàng
  const { data: billsData } = useList<Bill>({
    resource: 'bills',
    filters: user && 'point' in user ? [
      {
        field: 'customer_id',
        operator: 'eq',
        value: user.id,
      },
    ] : [],
    queryOptions: {
      enabled: !!(user && 'point' in user),
    },
  });

  const { data: reservationsData } = useList<Reservation>({
    resource: 'reservations',
    filters: user && 'point' in user ? [
      {
        field: 'customer_id',
        operator: 'eq',
        value: user.id,
      },
    ] : [],
    queryOptions: {
      enabled: !!(user && 'point' in user),
    },
  });

  const handleUpdateProfile = (values: { name: string; email: string; phone: string }) => {
    const resource = 'point' in user! ? 'customers' : 'staffs';
    updateProfile(
      {
        resource,
        id: user!.id,
        values: {
          name: values.name,
          email: values.email,
          phone: values.phone,
        },
      },
      {
        onSuccess: (data) => {
          message.success('Cập nhật thông tin thành công!');
          // Cập nhật state local
          if (user) {
            auth$.user.set({
              ...user,
              name: values.name,
              email: values.email,
              phone: values.phone,
            });
          }
          setIsEditingProfile(false);
        },
        onError: (error) => {
          message.error('Có lỗi xảy ra khi cập nhật thông tin!');
          console.error('Update profile error:', error);
        },
      }
    );
  };

  const handleChangePassword = (values: { current_password: string; new_password: string; confirm_password: string }) => {
    if (values.new_password !== values.confirm_password) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    const resource = 'point' in user! ? 'customers' : 'staffs';
    changePassword(
      {
        resource: `${resource}/change-password`,
        id: user!.id,
        values: {
          current_password: values.current_password,
          new_password: values.new_password,
        },
      },
      {
        onSuccess: () => {
          message.success('Đổi mật khẩu thành công!');
          passwordForm.resetFields();
          setIsChangingPassword(false);
        },
        onError: (error) => {
          message.error('Có lỗi xảy ra khi đổi mật khẩu!');
          console.error('Change password error:', error);
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    profileForm.setFieldsValue({
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
    });
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6">
          <Alert
            message="Chưa đăng nhập"
            description="Vui lòng đăng nhập để xem thông tin cá nhân."
            type="warning"
            showIcon
          />
        </div>
      </MainLayout>
    );
  }

  const isCustomer = 'point' in user;
  const totalOrders = billsData?.data?.length || 0;
  const totalReservations = reservationsData?.data?.length || 0;

  return (
    <MainLayout>
      <div className="min-h-screen  py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Profile */}
          <Card className="mb-6">
            <Row gutter={[24, 24]} align="middle" justify="center">
              <Col xs={24} sm={6} md={4} className="text-center">
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />}
                  style={{ 
                    backgroundColor: '#ea580c',
                    fontSize: '48px'
                  }}
                >
                  {getInitials(user.name)}
                </Avatar>
              </Col>
              <Col xs={24} sm={18} md={20}>
                <div className="space-y-2">
                  <Title level={2} className="!mb-2">{user.name}</Title>
                  <Text className="text-gray-600 text-lg block">{user.email}</Text>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {/* <Tag 
                      color={isCustomer ? "blue" : "green"}
                      className="px-3 py-1 text-sm"
                    >
                      {isCustomer ? "Khách hàng" : "Nhân viên"}
                    </Tag> */}
                    {isCustomer && (
                      <Tag 
                        icon={<TrophyOutlined />}
                        color="gold"
                        className="px-3 py-1 text-sm"
                      >
                        {(user as Customer).point} điểm
                      </Tag>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          <Row gutter={[24, 24]}>
            {/* Thông tin cá nhân */}
            <Col xs={24} lg={24}>
              <Card 
                title={
                  <div className="flex items-center">
                    <UserOutlined className="mr-2" />
                    Thông tin cá nhân
                  </div>
                }
                extra={
                  <Button
                    type={isEditingProfile ? "default" : "primary"}
                    icon={isEditingProfile ? <CloseOutlined /> : <EditOutlined />}
                    onClick={() => {
                      if (isEditingProfile) {
                        handleCancelEdit();
                      } else {
                        setIsEditingProfile(true);
                        profileForm.setFieldsValue({
                          name: user.name,
                          email: user.email,
                          phone: user.phone,
                        });
                      }
                    }}
                  >
                    {isEditingProfile ? "Hủy" : "Chỉnh sửa"}
                  </Button>
                }
              >
                {isEditingProfile ? (
                  <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                    initialValues={{
                      name: user.name,
                      email: user.email,
                      phone: user.phone,
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Họ và tên"
                          name="name"
                          rules={[
                            { required: true, message: 'Vui lòng nhập họ tên!' },
                            { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' }
                          ]}
                        >
                          <Input prefix={<UserOutlined />} placeholder="Nhập họ tên" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Số điện thoại"
                          name="phone"
                          rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                          ]}
                        >
                          <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          label="Email"
                          name="email"
                          rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                          ]}
                        >
                          <Input prefix={<MailOutlined />} placeholder="Nhập email" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <div className="flex justify-end space-x-2">
                      <Button onClick={handleCancelEdit}>
                        Hủy
                      </Button>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={isUpdatingProfile}
                        icon={<CheckOutlined />}
                      >
                        Lưu thay đổi
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <div className="flex items-center space-x-3">
                          <UserOutlined className="text-gray-500" />
                          <div>
                            <Text type="secondary" className="block text-sm">Họ và tên</Text>
                            <Text strong className="text-base">{user.name}</Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} md={12}>
                        <div className="flex items-center space-x-3">
                          <PhoneOutlined className="text-gray-500" />
                          <div>
                            <Text type="secondary" className="block text-sm">Số điện thoại</Text>
                            <Text strong className="text-base">{user.phone}</Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} md={12}>
                        <div className="flex items-center space-x-3">
                          <MailOutlined className="text-gray-500" />
                          <div>
                            <Text type="secondary" className="block text-sm">Email</Text>
                            <Text strong className="text-base">{user.email}</Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} md={12}>
                        <div className="flex items-center space-x-3">
                          <CalendarOutlined className="text-gray-500" />
                          <div>
                            <Text type="secondary" className="block text-sm">Ngày tham gia</Text>
                            <Text strong className="text-base">{formatDate(user.created_at)}</Text>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card>

              {/* Đổi mật khẩu */}
              <Card 
                title={
                  <div className="flex items-center">
                    <LockOutlined className="mr-2" />
                    Bảo mật
                  </div>
                }
                className="mt-6"
                extra={
                  <Button
                    type={isChangingPassword ? "default" : "primary"}
                    icon={isChangingPassword ? <CloseOutlined /> : <LockOutlined />}
                    onClick={() => {
                      if (isChangingPassword) {
                        setIsChangingPassword(false);
                        passwordForm.resetFields();
                      } else {
                        setIsChangingPassword(true);
                      }
                    }}
                  >
                    {isChangingPassword ? "Hủy" : "Đổi mật khẩu"}
                  </Button>
                }
              >
                {isChangingPassword ? (
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                  >
                    <Form.Item
                      label="Mật khẩu hiện tại"
                      name="current_password"
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
                    </Form.Item>
                    <Form.Item
                      label="Mật khẩu mới"
                      name="new_password"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
                    </Form.Item>
                    <Form.Item
                      label="Xác nhận mật khẩu mới"
                      name="confirm_password"
                      rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>
                    <div className="flex justify-end space-x-2">
                      <Button onClick={() => {
                        setIsChangingPassword(false);
                        passwordForm.resetFields();
                      }}>
                        Hủy
                      </Button>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={isChangingPasswordLoading}
                        icon={<CheckOutlined />}
                      >
                        Cập nhật mật khẩu
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <LockOutlined className="text-gray-500" />
                        <div>
                          <Text strong>Mật khẩu</Text>
                          <Text type="secondary" className="block text-sm">
                            Lần cập nhật cuối: {formatDate(user.updated_at)}
                          </Text>
                        </div>
                      </div>
                      <Text className="text-gray-400">••••••••</Text>
                    </div>
                  </div>
                )}
              </Card>
            </Col>

            {/* Thống kê cho khách hàng */}
            {isCustomer && (
              <Col xs={24} lg={8}>
                <Card 
                  title={
                    <div className="flex items-center">
                      <TrophyOutlined className="mr-2" />
                      Thống kê tài khoản
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <Statistic
                        title="Điểm tích lũy"
                        value={(user as Customer).point}
                        valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                        prefix={<TrophyOutlined />}
                      />
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                      <Statistic
                        title="Tổng đơn hàng"
                        value={totalOrders}
                        valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                        prefix={<ShoppingOutlined />}
                      />
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                      <Statistic
                        title="Lần đặt bàn"
                        value={totalReservations}
                        valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                        prefix={<HistoryOutlined />}
                      />
                    </div>
                  </div>
                </Card>
              </Col>
            )}
          </Row>

          <Divider />
        </div>
      </div>
    </MainLayout>
  );
};

export default InfoUserPage;