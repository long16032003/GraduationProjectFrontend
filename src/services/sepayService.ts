// SePay Service - Tạo QR code thanh toán

// SePay Configuration - Thông tin tài khoản
export const SEPAY_CONFIG = {
  ACCOUNT_NUMBER: 'SEPNGL28216',
  BANK_CODE: 'OCB',
  BANK_NAME: 'Ngân Hàng TMCP Phương Đông (OCB)',
  ACCOUNT_NAME: 'Nguyen Gia Long',
  QR_BASE_URL: 'https://qr.sepay.vn/img'
};

/**
 * Tạo QR code thanh toán SePay
 */
export const createSePayQRCode = (amount: number, content: string): string => {
  const params = {
    acc: SEPAY_CONFIG.ACCOUNT_NUMBER,
    bank: SEPAY_CONFIG.BANK_CODE,
    amount: amount.toString(),
    des: content
  };

  const queryString = new URLSearchParams(params).toString();
  return `${SEPAY_CONFIG.QR_BASE_URL}?${queryString}`;
};



/**
 * Tạo nội dung thanh toán (description)
 */
export const generatePaymentContent = (billId: number, txnRef?: string): string => {
  const baseContent = `Thanh toan hoa don #${billId}`;
  return txnRef ? `${baseContent} - ${txnRef}` : baseContent;
};

/**
 * Tạo QR code đơn giản cho UI (không cần tạo payment record)
 */
export const generateQuickQRCode = (billId: number, amount: number): string => {
  const content = generatePaymentContent(billId);
  return createSePayQRCode(amount, content);
};

/**
 * Format số tiền hiển thị
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
};

/**
 * Copy nội dung vào clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback cho trình duyệt cũ
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
};

/**
 * Debug helper để log SePay data
 */
export const debugSePayData = (data: unknown, label: string) => {
  if (import.meta.env.DEV) {
    console.group(`🔍 SePay Debug - ${label}`);
    console.log('Data:', data);
    console.log('Environment:', {
      NODE_ENV: import.meta.env.MODE,
      SEPAY_CONFIG
    });
    console.groupEnd();
  }
}; 