# Hướng dẫn tích hợp VNPay - Cổng thanh toán

## 📋 Tổng quan

Tài liệu này hướng dẫn tích hợp VNPay vào hệ thống quản lý nhà hàng với Laravel backend và React frontend.

## 🏗️ Kiến trúc hệ thống

```
[Frontend React] 
    ↓ (Tạo thanh toán)
[Laravel Backend API] 
    ↓ (Build URL + Signature)
[VNPay Sandbox] 
    ↓ (Return URL)
[Frontend React] 
    ↓ (Verify kết quả)
[Laravel Backend API]
```

## 🔧 Cấu hình Backend (Laravel)

### 1. Environment Variables (.env)

```env
# VNPay Configuration (Sandbox)
VNPAY_TMN_CODE=your_tmn_code_from_vnpay
VNPAY_HASH_SECRET=your_hash_secret_from_vnpay
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://admin.r0.test/vnpay-return
VNPAY_IPN_URL=https://r0.test/vnpay/ipn
VNPAY_API_URL=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
```

### 2. VNPay Config File (config/vnpay.php)

```php
<?php

return [
    'vnp_TmnCode' => env('VNPAY_TMN_CODE', 'DEMO'),
    'vnp_HashSecret' => env('VNPAY_HASH_SECRET', 'QWERTYUIOPASDFGHJKLZXCVBNM123456'),
    'vnp_Url' => env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    'vnp_ReturnUrl' => env('VNPAY_RETURN_URL', 'https://admin.r0.test/vnpay-return'),
    'vnp_IpnUrl' => env('VNPAY_IPN_URL', 'https://r0.test/vnpay/ipn'),
    'vnp_Version' => '2.1.0',
    'vnp_Command' => 'pay',
    'vnp_CurrCode' => 'VND',
    'vnp_Locale' => 'vn',
    'vnp_OrderType' => 'other',
];
```

### 3. Routes (routes/api.php)

```php
Route::prefix('vnpay')->group(function () {
    Route::post('/create-payment', [VNPayController::class, 'createPayment'])->name('vnpay.create');
    Route::get('/return', [VNPayController::class, 'returnUrl'])->name('vnpay.return');
    Route::get('/ipn', [VNPayController::class, 'ipn'])->name('vnpay.ipn');
    Route::get('/payment/{payment}', [VNPayController::class, 'getPaymentStatus'])->name('vnpay.status');
    Route::get('/history/{bill}', [VNPayController::class, 'getPaymentHistory'])->name('vnpay.history');
    Route::post('/cancel/{payment}', [VNPayController::class, 'cancelPayment'])->name('vnpay.cancel');
});
```

## ⚛️ Cấu hình Frontend (React)

### 1. Environment Variables (.env)

```env
# Production setup
VITE_APP_URL=https://admin.r0.test
VITE_API_URL=https://r0.test
VITE_PROXY_URL="${VITE_API_URL}"

# VNPay Return URL (Frontend)  
VITE_VNPAY_RETURN_URL=https://admin.r0.test/vnpay-return

# App Configuration
VITE_APP_NAME="Restaurant Management System"
VITE_APP_VERSION="1.0.0"

# PWA Configuration
VITE_PWA_APP_NAME=r0
VITE_PWA_APP_DESC=r0

# Debug (tắt trong production)
VITE_SOURCE_MAP=false
```

### 2. VNPay Service (src/services/vnpayService.ts)

Service này đã được tích hợp sẵn với:
- HttpClient integration (sử dụng httpClient có sẵn)
- Error handling 
- Debug logging
- TypeScript interfaces

### 3. Checkout Component

File `src/pages/admin/bill/checkout.tsx` đã được cập nhật với:
- VNPay payment option
- Service integration
- Debug logging

### 4. VNPay Return Handler

File `src/pages/admin/bill/vnpay-return.tsx` xử lý:
- Validate return parameters
- Process với backend
- Display success/error results
- Transaction details

## 🔍 Debug Lỗi Code 99

Lỗi **code 99 "Các lỗi khác"** thường do:

### 1. **Vấn đề Signature/Hash**
```javascript
// Kiểm tra debug logs
debugVNPayData(paymentRequest, 'Payment Request');
```

**Checklist:**
- ✅ `VNPAY_HASH_SECRET` đúng với sandbox (không dùng DEMO secret)
- ✅ `VNPAY_TMN_CODE` đúng với sandbox (không dùng DEMO)
- ✅ Thứ tự parameters khi tạo signature
- ✅ Encoding UTF-8 đúng cách

### 2. **URL Configuration**
```php
// Backend - đảm bảo return URL đúng
'vnp_ReturnUrl' => config('vnpay.vnp_ReturnUrl')
```

**Checklist:**
- ✅ Return URL: `https://admin.r0.test/vnpay-return` (frontend URL, không phải backend)
- ✅ IPN URL: `https://r0.test/vnpay/ipn` (backend URL để VNPay callback)
- ✅ HTTPS cho cả 2 URLs
- ✅ Không có redirect loop

### 3. **Data Format Issues**
```javascript
// Amount phải x100 cho VNPay
vnp_Amount: amount * 100
```

**Checklist:**
- ✅ Amount là integer (x100)
- ✅ TxnRef unique
- ✅ OrderInfo không có ký tự đặc biệt
- ✅ CreateDate format: YYYYMMDDHHmmss

### 4. **HTTP Client & Authentication**
```javascript
// Frontend - sử dụng httpClient có sẵn
const response = await httpClient(`${API_URL}/vnpay/create-payment`, {
  method: 'POST',
  body: paymentRequest
});
```

**Checklist:**
- ✅ HttpClient configured đúng
- ✅ User authenticated
- ✅ Headers được set tự động

## 🛠️ Troubleshooting Steps

### Bước 1: Kiểm tra Network

```bash
# Kiểm tra kết nối đến VNPay sandbox
curl -I https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

### Bước 2: Validate Request Data

```javascript
// Trong browser console - xem debug logs
console.log('VNPay Debug logs');
```

### Bước 3: Test với Postman

```json
POST /vnpay/create-payment
{
  "bill_id": 1,
  "amount": 100000,
  "coupon_code": null
}
```

### Bước 4: Kiểm tra Backend Logs

```bash
tail -f storage/logs/laravel.log
```

## 📊 Testing Scenarios

### Test Cases thành công:

1. **Thanh toán thành công**
   - Amount: 100,000 VNĐ
   - Bank: NCB
   - Response: `vnp_ResponseCode=00`

2. **Thanh toán với coupon**
   - Amount: 150,000 VNĐ 
   - Coupon: DISCOUNT10
   - Final: 135,000 VNĐ

### Test Cases lỗi:

1. **Insufficient funds (Code 51)**
   - Amount: 10,000,000 VNĐ
   - Expected: `vnp_ResponseCode=51`

2. **User cancel (Code 24)**
   - Click "Hủy" trên VNPay
   - Expected: `vnp_ResponseCode=24`

## 🔐 Security Best Practices

### 1. Environment Security
```bash
# Không commit file .env
echo ".env" >> .gitignore
```

### 2. Input Validation
```php
// Backend validation
$request->validate([
    'bill_id' => 'required|integer|exists:bills,id',
    'amount' => 'required|integer|min:1000'
]);
```

### 3. HTTPS Required
```php
// Force HTTPS in production
if (app()->environment('production')) {
    URL::forceScheme('https');
}
```

## 📱 Mobile Support

### Responsive Design
- VNPay return page responsive
- QR code scanning support
- Mobile banking app integration

### Deep Linking
```javascript
// Detect mobile app return
if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
}
```

## 🚀 Deployment Checklist

### Staging Environment
- [ ] Sandbox credentials configured
- [ ] Return URL với ngrok/public domain
- [ ] Test all payment flows
- [ ] Error handling tested

### Production Environment  
- [ ] Production credentials từ VNPay
- [ ] HTTPS domain verified
- [ ] IPN URL registered với VNPay
- [ ] Monitoring & alerting setup
- [ ] Database backup strategy

## 📞 Support

### VNPay Sandbox Registration
- URL: http://sandbox.vnpayment.vn/devreg/
- Email support: support@vnpay.vn

### Common Error Codes
- `00`: Success
- `24`: User cancelled
- `51`: Insufficient funds  
- `99`: Other errors (check implementation)

### Debug URLs
- Frontend: `https://admin.r0.test/vnpay-return`
- Backend: `https://r0.test/vnpay/return`
- VNPay Sandbox: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`

---

**Lưu ý:** Document này được cập nhật theo VNPay API version 2.1.0. Kiểm tra VNPay docs để có thông tin mới nhất. 

## 📝 **Cấu hình thực tế của bạn**

Dựa vào setup hiện tại, đây là cấu hình đã được tối ưu:

### Frontend (.env)
```env
# App URLs
VITE_APP_URL=https://admin.r0.test
VITE_API_URL=https://r0.test
VITE_PROXY_URL="${VITE_API_URL}"

# VNPay Return URL  
VITE_VNPAY_RETURN_URL=https://admin.r0.test/vnpay-return

# App Info
VITE_APP_NAME="Restaurant Management System"
VITE_APP_VERSION="1.0.0"

# PWA
VITE_PWA_APP_NAME=r0
VITE_PWA_APP_DESC=r0

# Debug
VITE_SOURCE_MAP=false
```

### Backend (.env Laravel)
```env
# VNPay Configuration
VNPAY_TMN_CODE=your_tmn_code_from_vnpay
VNPAY_HASH_SECRET=your_hash_secret_from_vnpay
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://admin.r0.test/vnpay-return
VNPAY_IPN_URL=https://r0.test/vnpay/ipn

# CORS Configuration
FRONTEND_URL=https://admin.r0.test
SANCTUM_STATEFUL_DOMAINS=admin.r0.test
SESSION_DOMAIN=.r0.test
```

### Backend Config (config/vnpay.php)
```php
return [
    'vnp_TmnCode' => env('VNPAY_TMN_CODE', 'DEMO'),
    'vnp_HashSecret' => env('VNPAY_HASH_SECRET', 'QWERTYUIOPASDFGHJKLZXCVBNM123456'),
    'vnp_Url' => env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    'vnp_ReturnUrl' => env('VNPAY_RETURN_URL', 'https://admin.r0.test/vnpay-return'),
    'vnp_IpnUrl' => env('VNPAY_IPN_URL', 'https://r0.test/vnpay/ipn'),
    'vnp_Version' => '2.1.0',
    'vnp_Command' => 'pay',
    'vnp_CurrCode' => 'VND',
    'vnp_Locale' => 'vn',
    'vnp_OrderType' => 'other',
];
```

### ✅ **Những điểm cần lưu ý:**

1. **✅ Return URL**: `https://admin.r0.test/vnpay-return` (frontend URL - đúng)
2. **✅ IPN URL**: `https://r0.test/vnpay/ipn` (backend URL - đúng)  
3. **⚠️ Credentials**: Đổi DEMO credentials thành real sandbox credentials
4. **✅ HTTPS**: Cả 2 URLs đều dùng HTTPS
5. **✅ Version**: VNPay API 2.1.0 - latest

### 🚨 **Action Items:**

1. **Đăng ký VNPay Sandbox**: http://sandbox.vnpayment.vn/devreg/
2. **Cập nhật credentials**: Thay DEMO values bằng real sandbox values
3. **Test URLs**: Verify cả return URL và IPN URL accessible
4. **Register IPN**: Đăng ký IPN URL với VNPay (nếu cần)