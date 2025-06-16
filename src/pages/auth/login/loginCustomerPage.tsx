import React from 'react';
import { Card, Typography, Divider, Space } from 'antd';
import { Link } from '@refinedev/core';
import LoginCustomerForm from './.form/LoginCustomerForm.tsx';

const { Title, Text } = Typography;

// https://github.com/shadcn-ui/ui/tree/main/apps/www/registry/default/blocks/login-03
export default function LoginCustomerPage() {
  return (
    <div className="min-h-screen bg-orange-50/50 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          {/* Logo and Brand */}
          <Link to="/" className="mb-8">
            <div className="flex items-center gap-4 group">
              <img
                src="/logo_restaurant.jpg"
                alt="Logo"
                className="h-16 w-16 rounded-full object-cover border-2 border-orange-600 p-0.5 bg-white shadow-sm group-hover:border-orange-700 transition-colors"
              />
              <span className="text-3xl font-semibold text-orange-700 group-hover:text-orange-800 transition-colors">
                BamBoo Sông Chanh
              </span>
            </div>
          </Link>
          
          {/* Login Card */}
          <Card 
            className="w-full max-w-md shadow-lg hover:shadow-xl transition-all duration-300"
            variant="outlined"
          >
            <div className="text-center mb-6">
              <Title level={2} className="!text-orange-700 !mb-2">Đăng Nhập</Title>
              <Text className="text-gray-500">Đăng nhập để đặt bàn và trải nghiệm dịch vụ của chúng tôi</Text>
            </div>
            
            <LoginCustomerForm />
            
            <Divider plain className="my-6">Hoặc</Divider>
            
            <div className="text-center">
              <Text className="text-gray-500">Chưa có tài khoản? </Text>
              <Link 
                to="/register"
                className="text-orange-600 hover:text-orange-700 font-medium hover:underline underline-offset-4"
              >
                Đăng ký ngay
              </Link>
            </div>
          </Card>
          
          {/* Contact Info */}
          <Space direction="vertical" align="center" className="mt-8 text-center">
            <Text className="text-gray-500">Cần hỗ trợ? Liên hệ với chúng tôi</Text>
            <Text className="text-orange-600 font-medium">033 328 3999</Text>
          </Space>
        </div>
      </div>
    </div>
  );
}
  