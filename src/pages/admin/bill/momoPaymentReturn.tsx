import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Card, Result, Button, Spin, Typography, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { httpClient } from '@/utils/http';

const { Title, Text } = Typography;

interface MoMoReturnParams {
  partnerCode?: string;
  orderId?: string;
  requestId?: string;
  amount?: string;
  orderInfo?: string;
  orderType?: string;
  transId?: string;
  resultCode?: string;
  message?: string;
  payType?: string;
  responseTime?: string;
  extraData?: string;
  signature?: string;
}

const MoMoPaymentReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    message: string;
    orderId?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const processReturn = async () => {
      try {
        // Lấy tất cả parameters từ URL
        const params: MoMoReturnParams = {};

        // Danh sách các parameters mà MoMo sẽ gửi về
        const momoParams = [
          'partnerCode', 'orderId', 'requestId', 'amount', 'orderInfo',
          'orderType', 'transId', 'resultCode', 'message', 'payType',
          'responseTime', 'extraData', 'signature'
        ];

        momoParams.forEach(param => {
          const value = searchParams.get(param);
          if (value) {
            params[param as keyof MoMoReturnParams] = value;
          }
        });

        console.log('MoMo return parameters:', params);

        // Gọi API handleReturn để xử lý kết quả
        // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        // const response = await httpClient(`${API_URL}/momo/return`, {
        //   method: 'GET',
        //   params: params
        // });

        // console.log('MoMo return response:', response);

        // setPaymentResult({
        //   success: response.success || false,
        //   message: response.message || 'Không có thông tin phản hồi',
        //   orderId: response.orderId || params.orderId,
        //   error: response.error
        // });

      } catch (error) {
        console.error('Error processing MoMo return:', error);
        setPaymentResult({
          success: false,
          message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processReturn();
  }, [searchParams]);

  const handleGoBack = () => {
    if (paymentResult?.orderId) {
      // Chuyển về trang chi tiết hóa đơn
      navigate(`/admin/bills/${paymentResult.orderId}`);
    } else {
      // Chuyển về danh sách hóa đơn
      navigate('/admin/bills');
    }
  };

  const handleTryAgain = () => {
    if (paymentResult?.orderId) {
      // Quay lại trang thanh toán
      navigate(`/admin/bills/${paymentResult.orderId}/checkout`);
    } else {
      navigate('/admin/bills');
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            <Title level={3} className="mt-4">Đang xử lý kết quả thanh toán</Title>
            <Text type="secondary">
              Vui lòng chờ trong giây lát...
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        {paymentResult?.success ? (
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Thanh toán thành công!"
            subTitle={
              <div className="space-y-2">
                <p>{paymentResult.message}</p>
                {paymentResult.orderId && (
                  <p>
                    <Text strong>Mã hóa đơn: </Text>
                    <Text code>#{paymentResult.orderId}</Text>
                  </p>
                )}
                <p>
                  <Text type="secondary">
                    Cảm ơn bạn đã sử dụng dịch vụ. Hóa đơn của bạn đã được thanh toán thành công qua MoMo.
                  </Text>
                </p>
              </div>
            }
            extra={[
              <Button type="primary" key="view-bill" onClick={handleGoBack}>
                Xem hóa đơn
              </Button>,
              <Button key="back-to-list" onClick={() => navigate('/admin/bills')}>
                Về danh sách hóa đơn
              </Button>
            ]}
          />
        ) : (
          <Result
            status="error"
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            title="Thanh toán thất bại"
            subTitle={
              <div className="space-y-2">
                <p>{paymentResult?.message || 'Không thể xử lý thanh toán'}</p>
                {paymentResult?.orderId && (
                  <p>
                    <Text strong>Mã hóa đơn: </Text>
                    <Text code>#{paymentResult.orderId}</Text>
                  </p>
                )}
                {paymentResult?.error && (
                  <Alert
                    message="Chi tiết lỗi"
                    description={paymentResult.error}
                    type="error"
                    showIcon
                    className="mt-2"
                  />
                )}
              </div>
            }
            extra={[
              <Button type="primary" key="try-again" onClick={handleTryAgain}>
                Thử lại
              </Button>,
              <Button key="back-to-list" onClick={() => navigate('/admin/bills')}>
                Về danh sách hóa đơn
              </Button>
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default MoMoPaymentReturn;
