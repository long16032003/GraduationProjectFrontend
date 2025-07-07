import React from 'react';
import { Card, Typography, Divider, Space } from 'antd';
import { Link } from '@refinedev/core';
import LoginCustomerForm from './.form/LoginCustomerForm.tsx';

const { Title, Text } = Typography;

// https://github.com/shadcn-ui/ui/tree/main/apps/www/registry/default/blocks/login-03
export default function LoginCustomerPage() {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/bamboo_restaurant.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      {/* Overlay Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <Link to="/" className="block mb-8 text-center">
            <div className="flex items-center justify-center gap-4 group mb-4">
              <img
                src="/logo_restaurant.jpg"
                alt="Logo"
                className="h-16 w-16 rounded-full object-cover border-3 border-white shadow-lg group-hover:scale-105 transition-transform"
              />
              <span className="text-3xl font-bold text-white drop-shadow-lg group-hover:text-orange-200 transition-colors">
                BamBoo Sông Chanh
              </span>
            </div>
          </Link>
          
          {/* Login Card */}
          <Card 
            className="shadow-2xl backdrop-blur-md bg-white/95 border-0"
            variant="outlined"
          >
            <div className="text-center mb-6">
              <Title level={2} className="!text-orange-700 !mb-2">Đăng Nhập Khách Hàng</Title>
              <Text className="text-gray-600">Đăng nhập để đặt bàn và trải nghiệm dịch vụ của chúng tôi</Text>
            </div>
            
            <LoginCustomerForm />
            
            <Divider plain className="my-6">
              <span className="text-gray-400">Hoặc</span>
            </Divider>
            
            <div className="text-center space-y-3">
              <div>
                <Text className="text-gray-500">Chưa có tài khoản? </Text>
                <Link 
                  to="/register"
                  className="text-orange-600 hover:text-orange-700 font-medium hover:underline underline-offset-4"
                >
                  Đăng ký ngay
                </Link>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <Text className="text-gray-500">Bạn là nhân viên? </Text>
                <Link 
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline underline-offset-4"
                >
                  Đăng nhập nhân viên
                </Link>
              </div>
            </div>
          </Card>
          
          {/* Contact Info */}
          <div className="mt-8 text-center">
            <Text className="text-white/80 drop-shadow">Cần hỗ trợ? Liên hệ với chúng tôi</Text>
            <br />
            <Text className="text-orange-300 font-medium text-lg drop-shadow">033 328 3999</Text>
          </div>
        </div>
      </div>
    </div>
  );
}
  