import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Card, Result, Button, Spin, Alert, Descriptions, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, HomeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  processVNPayReturn, 
  validateVNPayReturnData, 
  getVNPayResponseText, 
  getBankName,
  debugVNPayData 
} from '@/services/vnpayService';

const { Title, Text } = Typography;

interface VNPayTransactionData {
  vnp_transaction_no?: string;
  vnp_txn_ref?: string;
  vnp_amount?: string;
  vnp_bank_code?: string;
  vnp_card_type?: string;
  vnp_pay_date?: string;
  vnp_order_info?: string;
  bill_id?: number;
}

interface VNPayReturnState {
  loading: boolean;
  success: boolean | null;
  responseCode: string | null;
  transactionData: VNPayTransactionData | null;
  errorMessage: string | null;
  billId: number | null;
}

const VNPayReturn: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<VNPayReturnState>({
    loading: true,
    success: null,
    responseCode: null,
    transactionData: null,
    errorMessage: null,
    billId: null
  });

  useEffect(() => {
    const processReturn = async () => {
      try {
        // Lấy query parameters từ URL
        const queryParams = new URLSearchParams(location.search);
        
        // Debug log raw params
        debugVNPayData(Object.fromEntries(queryParams), 'VNPay Return Raw Params');
        
        // Validate required parameters
        const validation = validateVNPayReturnData(queryParams);
        if (!validation.isValid) {
          setState(prev => ({
            ...prev,
            loading: false,
            success: false,
            errorMessage: `Dữ liệu trả về từ VNPay không hợp lệ: ${validation.errors.join(', ')}`
          }));
          return;
        }

        // Process return với backend
        const result = await processVNPayReturn(queryParams);
        
        debugVNPayData(result, 'VNPay Return Process Result');

        if (result.success) {
          setState(prev => ({
            ...prev,
            loading: false,
            success: true,
            responseCode: queryParams.get('vnp_ResponseCode'),
            transactionData: result.data,
            billId: result.data?.bill_id || null
          }));
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            success: false,
            responseCode: queryParams.get('vnp_ResponseCode'),
            errorMessage: result.message || 'Có lỗi xảy ra khi xử lý kết quả thanh toán'
          }));
        }

      } catch (error) {
        console.error('VNPay return processing error:', error);
        debugVNPayData(error, 'VNPay Return Error');
        
        setState(prev => ({
          ...prev,
          loading: false,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý kết quả thanh toán'
        }));
      }
    };

    processReturn();
  }, [location.search]);

  const handleGoHome = () => {
    navigate('/admin/bills');
  };

  const handleViewBill = () => {
    if (state.billId) {
      navigate(`/admin/bills`);
    }
  };

  const handleRetryPayment = () => {
    if (state.billId) {
      navigate(`/admin/bills/${state.billId}/checkout`);
    }
  };

  // Loading state
  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96 text-center">
          <Spin size="large" />
          <div className="mt-4">
            <Title level={4}>Đang xử lý kết quả thanh toán...</Title>
            <Text type="secondary">Vui lòng đợi trong giây lát</Text>
          </div>
        </Card>
      </div>
    );
  }

  // Success state
  if (state.success === true) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Result
            status="success"
            title="Thanh toán thành công!"
            subTitle={`Giao dịch đã được xử lý thành công. Mã phản hồi: ${state.responseCode}`}
            extra={[
              <Button type="primary" key="view-bills" onClick={handleViewBill}>
                Xem danh sách hóa đơn
              </Button>,
              <Button key="home" onClick={handleGoHome}>
                Về trang chủ
              </Button>
            ]}
          />

          {/* Transaction Details */}
          {state.transactionData && (
            <Card title="Chi tiết giao dịch" className="mt-6">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Mã giao dịch">
                  {state.transactionData.vnp_transaction_no || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Mã tham chiếu">
                  {state.transactionData.vnp_txn_ref || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền">
                  {state.transactionData.vnp_amount 
                    ? `${(parseInt(state.transactionData.vnp_amount) / 100).toLocaleString('vi-VN')} VNĐ`
                    : 'N/A'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Ngân hàng">
                  {state.transactionData.vnp_bank_code 
                    ? getBankName(state.transactionData.vnp_bank_code)
                    : 'N/A'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Loại thẻ">
                  {state.transactionData.vnp_card_type || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian thanh toán">
                  {state.transactionData.vnp_pay_date 
                    ? dayjs(state.transactionData.vnp_pay_date, 'YYYYMMDDHHmmss').format('HH:mm:ss DD/MM/YYYY')
                    : 'N/A'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Thông tin đơn hàng" span={2}>
                  {state.transactionData.vnp_order_info || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Result
          status="error"
          title="Thanh toán không thành công"
          subTitle={state.responseCode ? getVNPayResponseText(state.responseCode) : 'Có lỗi xảy ra trong quá trình thanh toán'}
          extra={[
            <Button type="primary" key="retry" onClick={handleRetryPayment} disabled={!state.billId}>
              Thử lại thanh toán
            </Button>,
            <Button key="home" onClick={handleGoHome}>
              Về danh sách hóa đơn
            </Button>
          ]}
        />

        {/* Error Details */}
        {(state.errorMessage || state.responseCode) && (
          <Card title="Chi tiết lỗi" className="mt-6">
            <Alert
              message="Thông tin lỗi"
              description={
                <div>
                  {state.responseCode && (
                    <div className="mb-2">
                      <Text strong>Mã lỗi VNPay:</Text> {state.responseCode}
                    </div>
                  )}
                  {state.errorMessage && (
                    <div>
                      <Text strong>Chi tiết:</Text> {state.errorMessage}
                    </div>
                  )}
                </div>
              }
              type="error"
              showIcon
            />
          </Card>
        )}

        {/* Common Issues Help */}
        <Card title="Hướng dẫn xử lý" className="mt-6">
          <Alert
            message="Các vấn đề thường gặp:"
            description={
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Kiểm tra lại thông tin thẻ/tài khoản</li>
                <li>Đảm bảo tài khoản có đủ số dư</li>
                <li>Thử lại với phương thức thanh toán khác</li>
                <li>Liên hệ ngân hàng nếu vấn đề tiếp tục xảy ra</li>
                <li>Nếu tiền đã bị trừ, giao dịch sẽ được hoàn trong 1-3 ngày làm việc</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </Card>
      </div>
    </div>
  );
};

export default VNPayReturn; 