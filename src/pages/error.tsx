import React from 'react';
import { Button, Result, Typography } from 'antd';
import { Link, useRouteError } from 'react-router';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ErrorResponse {
    status?: number;
    statusText?: string;
    message?: string;
    data?: unknown;
  }

export function ErrorPage404() {
  const error = useRouteError() as ErrorResponse;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Result
        status="404"
        title={
          <span className="text-4xl font-bold text-orange-700">
            Không tìm thấy trang
          </span>
        }
        subTitle={
          <div className="space-y-2 mt-4">
            <Text className="block text-gray-600 text-lg">
              Xin lỗi, trang bạn đang tìm kiếm không tồn tại.
            </Text>
            {error?.statusText && (
              <Text className="block text-gray-500">
                Chi tiết lỗi: {error.statusText || error.message}
              </Text>
            )}
          </div>
        }
        extra={
          <div className="space-x-4 mt-8">
            <Link to="/">
              <Button 
                type="primary"
                size="large"
                icon={<HomeOutlined />}
                className="bg-orange-600 hover:bg-orange-700 border-none shadow-md hover:shadow-lg transition-all duration-300"
              >
                Về trang chủ
              </Button>
            </Link>
            <Button 
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => window.history.back()}
              className="border-orange-600 text-orange-600 hover:bg-orange-50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              Quay lại
            </Button>
          </div>
        }
        className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl"
      />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-orange-200 rounded-full opacity-20"></div>
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-orange-300 rounded-full opacity-20"></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-orange-400 rounded-full opacity-10"></div>
      </div>
    </div>
  );
} 