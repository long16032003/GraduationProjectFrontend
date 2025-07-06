import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { LockOutlined, MailOutlined, KeyOutlined } from '@ant-design/icons';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { useApiUrl, useCustomMutation } from '@refinedev/core';

const { Title, Text } = Typography;

interface ResetPasswordFormData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export function UpdatePassword() {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const apiUrl = useApiUrl();
  
  // Lấy token và email từ URL params
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const { mutate: resetPassword, isLoading } = useCustomMutation<ResetPasswordFormData>();

  useEffect(() => {
    // Set email từ URL params vào form
    if (email) {
      form.setFieldsValue({ email });
    }
  }, [email, form]);

  const handleSubmit = (values: { email: string; password: string; password_confirmation: string }) => {
    const resetData: ResetPasswordFormData = {
      token,
      email: values.email,
      password: values.password,
      password_confirmation: values.password_confirmation,
    };

    resetPassword(
      {
        url: `${apiUrl}/reset-password`,
        method: 'post',
        values: resetData,
        config: {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        },
      },
      {
        onSuccess: () => {
          message.success('Đặt lại mật khẩu thành công!');
          navigate('/login', { 
            replace: true,
            state: { message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.' }
          });
        },
        onError: (error: unknown) => {
          console.error('Reset password error:', error);
          
          const errorResponse = error as { response?: { data?: { errors?: Record<string, string[]> } } };
          if (errorResponse?.response?.data?.errors) {
            const errors = errorResponse.response.data.errors;
            if (errors.email) {
              message.error(errors.email[0]);
            } else if (errors.password) {
              message.error(errors.password[0]);
            } else {
              message.error('Có lỗi xảy ra khi đặt lại mật khẩu!');
            }
          } else {
            message.error('Có lỗi xảy ra khi đặt lại mật khẩu!');
          }
        },
      }
    );
  };

  // Kiểm tra token có hợp lệ không
  if (!token) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className='flex w-full max-w-sm flex-col gap-6'>
          <div className='flex justify-center'>
            <Link to='/'>
              <div className='flex items-center gap-4 group'>
                <img
                  src='/logo_restaurant.jpg'
                  alt='Logo'
                  className='h-12 w-12 rounded-full object-cover border-2 border-orange-600 p-0.5 bg-white shadow-sm group-hover:border-orange-700 transition-colors'
                />
                <span className='text-2xl font-semibold text-orange-700 group-hover:text-orange-800 transition-colors'>
                  BamBoo Sông Chanh
                </span>
              </div>
            </Link>
          </div>
          
          <Card>
            <div className="text-center p-6">
              <Alert
                message="Liên kết không hợp lệ"
                description="Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới."
                type="error"
                showIcon
                className="mb-4"
              />
              <Link to="/forgot-password">
                <Button type="primary">
                  Quay lại trang quên mật khẩu
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <div className='flex justify-center'>
          <Link to='/'>
            <div className='flex items-center gap-4 group'>
              <img
                src='/logo_restaurant.jpg'
                alt='Logo'
                className='h-12 w-12 rounded-full object-cover border-2 border-orange-600 p-0.5 bg-white shadow-sm group-hover:border-orange-700 transition-colors'
              />
              <span className='text-2xl font-semibold text-orange-700 group-hover:text-orange-800 transition-colors'>
                BamBoo Sông Chanh
              </span>
            </div>
          </Link>
        </div>
        
        <Card>
          <div className="text-center mb-6">
            <Title level={3} className="!mb-2">
              Đặt lại mật khẩu
            </Title>
            <Text type="secondary">
              Nhập mật khẩu mới cho tài khoản của bạn
            </Text>
          </div>

          <Form
            form={form}
            name="update-password"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            initialValues={{ email }}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email của bạn"
                disabled
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới"
              />
            </Form.Item>

            <Form.Item
              name="password_confirmation"
              label="Xác nhận mật khẩu"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<KeyOutlined />}
                placeholder="Nhập lại mật khẩu mới"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                loading={isLoading}
                size="large"
              >
                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center">
            <Text type="secondary">
              Nhớ mật khẩu?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Đăng nhập
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}