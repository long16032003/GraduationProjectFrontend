import dayjs from 'dayjs';
import { httpClient } from '@/utils/http';

// VNPay configuration - Sử dụng sandbox theo document
const VNPAY_CONFIG = {
  SANDBOX_URL: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  VERSION: '2.1.0',
  COMMAND: 'pay',
  CURRENCY_CODE: 'VND',
  LOCALE: 'vn',
  ORDER_TYPE: 'other' // Theo document VNPay
};

export interface VNPayPaymentData {
  amount: number;
  billId: number;
  orderInfo: string;
  customerInfo?: {
    name?: string;
    phone?: string;
  };
}

export interface VNPayReturnData {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

// Các mã phản hồi từ VNPay theo document chính thức
export const VNPAY_RESPONSE_CODES: Record<string, string> = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
  '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
  '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
  '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
  '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
  '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
  '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
  '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
  '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
  '75': 'Ngân hàng thanh toán đang bảo trì.',
  '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
  '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
};

// VNPay Service - Tích hợp với Laravel Backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface VNPayPaymentRequest {
  bill_id: number;
  coupon_code?: string | null;
  amount: number;
}

export interface VNPayPaymentResponse {
  success: boolean;
  data?: {
    payment_url: string;
    payment_id: string;
    order_id: string;
  };
  message: string;
}

export interface VNPayPaymentStatus {
  success: boolean;
  data?: {
    id: string;
    bill_id: number;
    amount: number;
    status: 'pending' | 'success' | 'failed' | 'cancelled';
    is_success: boolean;
    vnp_response_code?: string;
    vnp_transaction_no?: string;
    vnp_bank_code?: string;
    created_at: string;
    completed_at?: string;
  };
  message: string;
}

// Tạo thanh toán VNPay - Gửi request đến Laravel backend
export const createVNPayPayment = async (paymentRequest: VNPayPaymentRequest): Promise<VNPayPaymentResponse> => {
  try {
    console.log('Creating VNPay payment with data:', paymentRequest);
    
    const response = await httpClient(`${API_BASE_URL}/vnpay/create-payment`, {
      method: 'POST',
      body: paymentRequest
    });

    console.log('VNPay payment response:', response);
    
    return response;
  } catch (error) {
    console.error('VNPay create payment error:', error);
    throw error;
  }
};

// Kiểm tra trạng thái thanh toán
export const checkVNPayPaymentStatus = async (paymentId: string): Promise<VNPayPaymentStatus> => {
  try {
    const response = await httpClient(`${API_BASE_URL}/vnpay/payment/${paymentId}`);
    return response;
  } catch (error) {
    console.error('Check VNPay payment status error:', error);
    throw error;
  }
};

// Xử lý VNPay return URL - Gửi kết quả về backend để verify
export const processVNPayReturn = async (queryParams: URLSearchParams) => {
  try {
    console.log('Processing VNPay return with params:', Object.fromEntries(queryParams));
    
    const response = await httpClient(`${API_BASE_URL}/vnpay/return?${queryParams.toString()}`);
    
    console.log('VNPay return response:', response);
    
    return response;
  } catch (error) {
    console.error('Process VNPay return error:', error);
    throw error;
  }
};

// Lấy lịch sử thanh toán của hóa đơn
export const getVNPayHistory = async (billId: number) => {
  try {
    const response = await httpClient(`${API_BASE_URL}/vnpay/history/${billId}`);
    return response;
  } catch (error) {
    console.error('Get VNPay history error:', error);
    throw error;
  }
};

// Hủy thanh toán (chỉ với status pending)
export const cancelVNPayPayment = async (paymentId: string) => {
  try {
    const response = await httpClient(`${API_BASE_URL}/vnpay/cancel/${paymentId}`, {
      method: 'POST',
      body: {}
    });

    return response;
  } catch (error) {
    console.error('Cancel VNPay payment error:', error);
    throw error;
  }
};

// Helper function để lấy tên ngân hàng từ mã
export const getBankName = (bankCode: string): string => {
  const bankNames: Record<string, string> = {
    'NCB': 'Ngân hàng NCB',
    'AGRIBANK': 'Ngân hàng Agribank',
    'SCB': 'Ngân hàng SCB',
    'SACOMBANK': 'Ngân hàng SacomBank',
    'EXIMBANK': 'Ngân hàng EximBank',
    'MSBANK': 'Ngân hàng MSBANK',
    'NAMABANK': 'Ngân hàng NamABank',
    'VNMART': 'Ví VnMart',
    'VIETINBANK': 'Ngân hàng Vietinbank',
    'VIETCOMBANK': 'Ngân hàng VCB',
    'HDBANK': 'Ngân hàng HDBank',
    'DONGABANK': 'Ngân hàng Dong A',
    'TPBANK': 'Ngân hàng TPBank',
    'OJB': 'Ngân hàng OceanBank',
    'BIDV': 'Ngân hàng BIDV',
    'TECHCOMBANK': 'Ngân hàng Techcombank',
    'VPBANK': 'Ngân hàng VPBank',
    'MBBANK': 'Ngân hàng MBBank',
    'ACB': 'Ngân hàng ACB',
    'OCB': 'Ngân hàng OCB',
    'IVB': 'Ngân hàng IVB',
    'VISA': 'Thanh toán qua VISA/MASTER'
  };
  
  return bankNames[bankCode] || bankCode;
};

// Utility function để lấy text từ mã lỗi
export const getVNPayResponseText = (responseCode: string): string => {
  return VNPAY_RESPONSE_CODES[responseCode] || `Mã lỗi không xác định: ${responseCode}`;
};

// Utility function để validate VNPay return data
export const validateVNPayReturnData = (params: URLSearchParams): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const requiredParams = ['vnp_Amount', 'vnp_ResponseCode', 'vnp_TxnRef', 'vnp_SecureHash'];
  
  requiredParams.forEach(param => {
    if (!params.get(param)) {
      errors.push(`Thiếu tham số bắt buộc: ${param}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Debug helper để log VNPay data
export const debugVNPayData = (data: unknown, label: string) => {
  if (import.meta.env.DEV) {
    console.group(`🔍 VNPay Debug - ${label}`);
    console.log('Data:', data);
    console.log('Environment:', {
      API_URL: API_BASE_URL,
      NODE_ENV: import.meta.env.MODE
    });
    console.groupEnd();
  }
}; 