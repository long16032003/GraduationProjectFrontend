import React from 'react';
import { Button, Typography } from 'antd';
import { Link, useRouteError } from 'react-router';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface ErrorResponse {
    status?: number;
    statusText?: string;
    message?: string;
    data?: unknown;
  }

export function ErrorPage404() {
  const error = useRouteError() as ErrorResponse;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-4 group">
            <img
              src="/logo_restaurant.jpg"
              alt="Logo"
              className="h-16 w-16 rounded-full object-cover border-2 border-orange-600 shadow-lg group-hover:scale-105 transition-transform"
            />
            <span className="text-2xl font-bold text-orange-700 group-hover:text-orange-800 transition-colors">
              BamBoo Sông Chanh
            </span>
          </Link>
        </div>

        {/* 404 Number */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-orange-600 mb-4 drop-shadow-lg">
            404
          </div>
          <div className="text-2xl text-orange-400 font-medium">
            Trang không tồn tại
          </div>
        </div>
        <div className="mb-8">
          <Text className="text-gray-600 text-lg block mb-4">
            Xin lỗi, trang bạn đang tìm kiếm không có trong hệ thống của chúng tôi.
          </Text>
          {error?.statusText && (
            <Text className="text-gray-500 text-sm block">
              Chi tiết lỗi: {error.statusText || error.message}
            </Text>
          )}
        </div>

        {/* Error Message */}
        {/* <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8">
          <Title level={2} className="!text-orange-700 !mb-4">
            Oops! Không tìm thấy trang
          </Title>
          <Text className="text-gray-600 text-lg block mb-4">
            Xin lỗi, trang bạn đang tìm kiếm không có trong hệ thống của chúng tôi.
          </Text>
          {error?.statusText && (
            <Text className="text-gray-500 text-sm block">
              Chi tiết lỗi: {error.statusText || error.message}
            </Text>
          )}
        </div> */}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link to="/">
            <Button 
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 border-none shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Về trang chủ
            </Button>
          </Link>
          <Button 
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            className="w-full sm:w-auto border-orange-600 text-orange-600 hover:bg-orange-50 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Quay lại
          </Button>
        </div>

        {/* Contact Info */}
        <div className="text-center">
          <Text className="text-gray-500 block mb-2">
            Cần hỗ trợ? Liên hệ với chúng tôi
          </Text>
          <Text className="text-orange-600 font-semibold text-lg">
            📞 033 328 3999
          </Text>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-orange-200 rounded-full opacity-20"></div>
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-orange-300 rounded-full opacity-20"></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-orange-400 rounded-full opacity-15"></div>
        <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-orange-500 rounded-full opacity-10"></div>
      </div>
    </div>
  );
} 