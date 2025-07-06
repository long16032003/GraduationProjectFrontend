import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Form, Input, InputNumber, Select, Button, Table, Space, message, Divider, Typography, Modal, Alert, Image, Tooltip } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, ExclamationCircleOutlined, GiftOutlined, QrcodeOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { type Bill, type BillItem, type Order, type OrderDish, type PromotionCode } from '@/types';
import { useOne, useShow, useList, useUpdate } from '@refinedev/core';
import { createVNPayPayment, debugVNPayData } from '@/services/vnpayService';
import { generateQuickQRCode, formatAmount, copyToClipboard, SEPAY_CONFIG, generatePaymentContent } from '@/services/sepayService';
import { httpClient } from '@/utils/http';
import { tax_percentage } from '@/utils/constant';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Checkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    description?: string;
    promotion_code_id?: number;
  } | null>(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [sePayQRCode, setSePayQRCode] = useState<string>('');
  const [showSePayQR, setShowSePayQR] = useState(false);

  const { data: billData, isLoading: isLoadingBill } = useOne<Bill>({
    resource: 'bills',
    id: id,
  });

  const isLoading = isLoadingBill;
  const bill = billData?.data;

  // Component mounted - no need for CSRF initialization with httpClient

  // Tính toán tổng tiền từ orders
  const calculateTotals = () => {
    if (!bill?.orders || bill.orders.length === 0) return { subtotal: 0, tax: 0, total: 0, couponDiscount: 0 };

    const subtotal = bill.orders.reduce((sum: number, order: Order) => {
      // Chỉ tính các order có status là "done"
      if (order.status !== 'done') return sum;
      
      return sum + (order.order_dishes?.reduce((orderSum: number, dish: OrderDish) => {
        // Chỉ tính các dish không bị hủy và không available
        if (dish.cancelled_at || dish.is_available == 0) return orderSum;
        return orderSum + ((dish.quantity || 0) * (dish.price_at_order_time || 0));
      }, 0) || 0);
    }, 0);
    
    // Tính giảm giá từ mã ưu đãi
    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        couponDiscount = Math.floor(subtotal * (appliedCoupon.discount / 100));
      } else {
        couponDiscount = appliedCoupon.discount;
      }
    }
    
    const tax = Math.floor((subtotal - couponDiscount) * tax_percentage);
    const billDiscount = bill.discount_amount || 0;
    const total = subtotal + tax - couponDiscount - billDiscount;

    return { subtotal, tax, total, couponDiscount };
  };

  const { subtotal, tax, total, couponDiscount } = calculateTotals();

  const handleBack = () => {
    navigate('/admin/bills');
  };

  console.log(bill?.customer_id);

  // Lấy danh sách promotion codes từ API
  const { data: promotionCodesData } = useList<PromotionCode>({
    resource: 'promotion_codes',
    filters: [
      {
        field: 'customer_id',
        operator: 'eq',
        value: bill?.customer_id,
      },
      {
        field: 'used_at',
        operator: 'eq',
        value: null,
      }
    ],
    meta: {
      populate: ['promotion']
    }
  });

  const { mutate: usePromotionCode } = useUpdate();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      message.warning('Vui lòng nhập mã ưu đãi');
      return;
    }

    setIsCouponLoading(true);
    
    try {
      // Tìm mã ưu đãi trong database
      const foundCode = promotionCodesData?.data?.find((code: PromotionCode) => 
        code.code.toLowerCase() === couponCode.toLowerCase() && !code.used_at
      );
      
      if (foundCode && foundCode.promotion) {
        const promotion = foundCode.promotion;
        const currentDate = new Date();
        const startDate = new Date(promotion.start_date);
        const endDate = new Date(promotion.end_date);
        
        // Kiểm tra thời gian hiệu lực
        if (currentDate < startDate || currentDate > endDate) {
          message.error('Mã ưu đãi đã hết hạn hoặc chưa có hiệu lực');
          setIsCouponLoading(false);
          return;
        }
        
        // Áp dụng mã ưu đãi
        const couponData = {
          code: foundCode.code,
          discount: promotion.discount_type === 'percentage' 
            ? (promotion.discount_percentage || 0) 
            : (promotion.discount_amount || 0),
          type: promotion.discount_type,
          description: promotion.description || promotion.name,
          promotion_code_id: foundCode.id
        };
        
        setAppliedCoupon(couponData);
        message.success(`Áp dụng mã ưu đãi thành công! ${couponData.description}`);
      } else {
        message.error('Mã ưu đãi không hợp lệ hoặc đã được sử dụng');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi kiểm tra mã ưu đãi');
    }
    
    setIsCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    message.info('Đã hủy mã ưu đãi');
  };

  // Tạo QR code SePay
  const generateSePayQR = () => {
    if (id && total > 0) {
      const qrUrl = generateQuickQRCode(parseInt(id), total);
      console.log(qrUrl)
      setSePayQRCode(qrUrl);
      setShowSePayQR(true);
    }
  };

  // Cập nhật QR code khi total thay đổi (do mã giảm giá)
  useEffect(() => {
    if (form.getFieldValue('payment_method') === 'bank_transfer' && id && total > 0) {
      generateSePayQR();
    }
  }, [total, id, form]);

  // Copy text vào clipboard
  const handleCopyText = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      message.success(`Đã copy ${label}!`);
    } else {
      message.error(`Không thể copy ${label}`);
    }
  };

  interface PaymentFormValues {
    payment_method: string;
    amount_paid: number;
    notes?: string;
  }

  // Tạo thanh toán VNPay - Sử dụng service mới
  const createVNPayPaymentHandler = async () => {
    try {
      setIsProcessingPayment(true);
      
      const paymentRequest = {
        bill_id: parseInt(id as string),
        coupon_code: appliedCoupon?.code || null,
        amount: total
      };

      // Debug log payment request
      debugVNPayData(paymentRequest, 'Payment Request');
      
      const result = await createVNPayPayment(paymentRequest);

      if (result.success && result.data?.payment_url) {
        message.success('Đang chuyển hướng đến VNPay...');
        
        // Debug log before redirect
        debugVNPayData(result.data, 'VNPay Response Data');
        
        // Redirect to VNPay
        window.location.href = result.data.payment_url;
      } else {
        message.error(result.message || 'Có lỗi xảy ra khi tạo thanh toán VNPay');
        debugVNPayData(result, 'VNPay Error Response');
      }
    } catch (error) {
      console.error('VNPay payment creation failed:', error);
      message.error('Không thể kết nối đến VNPay. Vui lòng thử lại.');
      debugVNPayData(error, 'VNPay Exception');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSubmit = async (values: PaymentFormValues) => {
    console.log('Payment values:', values);
    if (values.payment_method === 'vnpay') {
      // Xử lý thanh toán VNPay
      await createVNPayPaymentHandler();
    } else if (values.payment_method === 'momo') {

      const paymentData = {
        bill_id: parseInt(id as string),
        amount: total,
        discount_amount: couponDiscount > 0 ? couponDiscount : 0,
        // redirectUrl: `${import.meta.env.VITE_API_URL}/momo/return`,
      };

      const requestBody = await httpClient(`${API_URL}/momo/create-payment`, {
        method: 'POST',
        body: paymentData
      });

      window.location.href = requestBody.payUrl;

    } else if(values.payment_method === 'bank_transfer') {
      try {
        setIsProcessingPayment(true);
        
        /** Demo thử API SePay xem có chạy được không */
        const paymentData = {
          "id": 92704,                              // ID giao dịch trên SePay
          "gateway":"Vietcombank",                  // Brand name của ngân hàng
          "transactionDate":"2023-03-25 14:02:37",  // Thời gian xảy ra giao dịch phía ngân hàng
          "accountNumber":"0123499999",              // Số tài khoản ngân hàng
          "code":null,                               // Mã code thanh toán (sepay tự nhận diện dựa vào cấu hình tại Công ty -> Cấu hình chung)
          "content":"chuyen tien mua iphone",        // Nội dung chuyển khoản
          "transferType":"in",                       // Loại giao dịch. in là tiền vào, out là tiền ra
          "transferAmount":2277000,                  // Số tiền giao dịch
          "accumulated":19077000,                    // Số dư tài khoản (lũy kế)
          "subAccount":null,                         // Tài khoản ngân hàng phụ (tài khoản định danh),
          "referenceCode":"MBVCB.3278907687",         // Mã tham chiếu của tin nhắn sms
          "description":""                           // Toàn bộ nội dung tin nhắn sms
      }

        const result = await httpClient(`${API_URL}/hooks/sepay-payment`, {
          method: 'POST',
          body: paymentData
        });

        console.log(result)

      } catch (error) {
        console.error('Payment failed:', error);
        message.error('Có lỗi xảy ra khi xử lý thanh toán');
      } finally {
        setIsProcessingPayment(false);
      }
    } else{
      // Xử lý các phương thức thanh toán khác (cash, etc.)
      try {
        setIsProcessingPayment(true);
        
        const paymentData = {
          bill_id: parseInt(id as string),
          payment_method: values.payment_method,
          amount_paid: values.amount_paid,
          notes: values.notes,
          discount_amount: couponDiscount,
          coupon_code: appliedCoupon?.code || null,
          total_amount: total
        };

        const result = await httpClient(`${API_URL}/bills/${id}/pay`, {
          method: 'POST',
          body: paymentData
        });

        if (result.success) {
          message.success('Thanh toán thành công!');
          navigate('/admin/bills');
        } else {
          message.error(result.message || 'Có lỗi xảy ra khi thanh toán');
        }
      } catch (error) {
        console.error('Payment failed:', error);
        message.error('Có lỗi xảy ra khi xử lý thanh toán');
      } finally {
        setIsProcessingPayment(false);
      }
    }
  };

  const showConfirmModal = () => {
    setIsConfirmModalVisible(true);
  };

  const handleConfirmPayment = () => {
    form.submit();
    setIsConfirmModalVisible(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!bill) {
    return <div>Không tìm thấy hóa đơn</div>;
  }

  return (
    <div className="p-6">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        className="mb-4"
      >
        Quay lại
      </Button>

      <div className="grid grid-cols-3 gap-6">
        {/* Thông tin hóa đơn */}
        <div className="col-span-2">
          <Card title="Thông tin hóa đơn" className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>Mã hóa đơn:</Text> #{bill.id}
              </div>
              <div>
                <Text strong>Ngày tạo:</Text> {dayjs(bill.created_at).format('HH:mm:ss DD/MM/YYYY')}
              </div>
              <div>
                <Text strong>Khách hàng:</Text> {bill.customer_name || "(Khách vãng lai)"}
              </div>
              <div>
                <Text strong>Số điện thoại:</Text> {bill.customer_phone || 'N/A'}
              </div>
              <div>
                <Text strong>Bàn số:</Text> {bill.table?.name || 'N/A'}
              </div>
            </div>
          </Card>

          <Card title="Chi tiết đơn gọi món">
            {/** Đã có gọi món */}
            {bill.orders && bill.orders.length > 0 ? (
              <div>
                {bill.orders.filter((order: Order) => order.status === 'done').length === 0 ? (
                  <div className="text-center p-8 bg-yellow-50 rounded-md border border-yellow-200">
                    <p className="text-yellow-700 font-medium">Chưa có đơn gọi món nào hoàn thành để thanh toán.</p>
                    <p className="text-yellow-600 text-sm mt-2">Vui lòng chờ bếp hoàn thành món ăn trước khi thanh toán.</p>
                  </div>
                ) : (
                  bill.orders
                    .filter((order: Order) => order.status === 'done')
                    .map((order: Order, orderIndex: number) => {
                      // Lọc order_dishes thỏa mãn điều kiện
                      const validOrderDishes = order.order_dishes?.filter((dish: OrderDish) => 
                        !dish.cancelled_at && dish.is_available == 1
                      ) || [];

                      //Chỉ hiển thị order nếu có ít nhất 1 dish hợp lệ
                      if (validOrderDishes.length === 0) return null;

                      return (
                        <div key={order.id || orderIndex} className="mb-6">
                          <div className="mb-3 p-3 bg-gray-50 rounded">
                            <h4 className="text-base font-semibold mb-1">
                              Đơn gọi món #{order.id} - {dayjs(order.created_at).format('HH:mm DD/MM/YYYY')} 
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                Hoàn thành
                              </span>
                            </h4>
                            {order.note && (
                              <p className="text-gray-600 text-sm">Ghi chú: {order.note}</p>
                            )}
                          </div>
                          
                          {validOrderDishes.length > 0 ? (
                            <Table
                              columns={[
                                {
                                  title: 'Món ăn',
                                  dataIndex: ['dish', 'name'],
                                  key: 'dish_name',
                                  render: (dishName: string, record: OrderDish) => 
                                    dishName || record.dish?.name || 'Món ăn không xác định',
                                },
                                {
                                  title: 'Số lượng',
                                  dataIndex: 'quantity',
                                  key: 'quantity',
                                  width: '15%',
                                },
                                {
                                  title: 'Đơn giá',
                                  dataIndex: 'price_at_order_time',
                                  key: 'price_at_order_time',
                                  width: '20%',
                                  render: (price: number) => `${Number(price)?.toLocaleString('vi-VN')} VNĐ`,
                                },
                                {
                                  title: 'Thành tiền',
                                  key: 'total_price',
                                  width: '20%',
                                  render: (_: unknown, record: OrderDish) => 
                                    `${((record.quantity || 0) * (record.price_at_order_time || 0)).toLocaleString('vi-VN')} VNĐ`,
                                },
                              ]}
                              dataSource={validOrderDishes}
                              pagination={false}
                              rowKey={(record: OrderDish) => `${order.id}-${record.dish_id}`}
                              size="small"
                              summary={(pageData) => {
                                const orderTotal = pageData.reduce(
                                  (sum: number, item: OrderDish) => sum + ((item.quantity || 0) * (item.price_at_order_time || 0)),
                                  0,
                                );
                                
                                return (
                                  <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={3}>
                                      <Text strong>Tổng tiền đơn này</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1}>
                                      <Text strong>{orderTotal.toLocaleString('vi-VN')} VNĐ</Text>
                                    </Table.Summary.Cell>
                                  </Table.Summary.Row>
                                );
                              }}
                            />
                          ) : (
                            <p className="text-gray-500 italic">Đơn này không có món ăn hợp lệ.</p>
                          )}
                        </div>
                      );
                    })
                    .filter(Boolean)
                )}
                
                {/* Tổng kết cuối */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Text strong>Tổng tiền tất cả món ăn:</Text>
                      <Text strong>{subtotal.toLocaleString('vi-VN')} VNĐ</Text>
                    </div>
                    
                    {couponDiscount > 0 && (
                      <div className="flex justify-between items-center">
                        <Text>Giảm giá mã ưu đãi ({appliedCoupon?.code}):</Text>
                        <Text className="text-green-600">-{couponDiscount.toLocaleString('vi-VN')} VNĐ</Text>
                      </div>
                    )}
                     
                    {(bill.discount_amount || 0) > 0 && (
                      <div className="flex justify-between items-center">
                        <Text>Giảm giá khác:</Text>
                        <Text className="text-red-600">-{Number(bill.discount_amount).toLocaleString('vi-VN')} VNĐ</Text>
                      </div>
                    )}
                     
                    <div className="flex justify-between items-center">
                      <Text>Thuế VAT ({(tax_percentage * 100).toFixed(0)}%):</Text>
                      <Text>{tax.toLocaleString('vi-VN')} VNĐ</Text>
                    </div>
                    
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                      <Text strong>Tổng cộng:</Text>
                      <Text strong style={{ fontSize: '18px', color: '#f5222d' }}>
                        {total.toLocaleString('vi-VN')} VNĐ
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-md">
                <p className="text-gray-500">Chưa có món ăn nào được gọi.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Form thanh toán */}
        <div className="col-span-1">
          <Card title="Thanh toán">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                payment_method: 'cash',
                amount_paid: total,
              }}
            >
              <Form.Item
                name="payment_method"
                label="Phương thức thanh toán"
                rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
              >
                <Select>
                  <Option value="cash">Tiền mặt</Option>
                  <Option value="bank_transfer">Chuyển khoản</Option>
                  <Option value="momo">MoMo</Option>
                  <Option value="vnpay">VNPay</Option>
                </Select>
              </Form.Item>

              {/* Mã ưu đãi */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Mã ưu đãi</label>
                {appliedCoupon ? (
                  <Alert
                    message={`Mã ưu đãi: ${appliedCoupon.code}`}
                    description={`${appliedCoupon.type === 'percentage' 
                      ? `Giảm ${appliedCoupon.discount}%` 
                      : `Giảm ${appliedCoupon.discount.toLocaleString('vi-VN')} VNĐ`
                    } - Tiết kiệm ${couponDiscount.toLocaleString('vi-VN')} VNĐ`}
                    type="success"
                    showIcon
                    action={
                      <Button size="small" onClick={handleRemoveCoupon}>
                        Hủy
                      </Button>
                    }
                  />
                ) : (
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      placeholder="Nhập mã ưu đãi"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onPressEnter={handleApplyCoupon}
                    />
                    <Button 
                      type="primary" 
                      icon={<GiftOutlined />}
                      onClick={handleApplyCoupon}
                      loading={isCouponLoading}
                    >
                      Áp dụng
                    </Button>
                  </Space.Compact>
                )}
                
                {/* Gợi ý mã ưu đãi */}
                {!appliedCoupon && promotionCodesData?.data && promotionCodesData.data.length > 0 && bill?.customer_id && (
                  <div className="mt-2">
                    <Text type="secondary" className="text-xs">
                      Mã ưu đãi có sẵn: 
                    </Text>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {promotionCodesData.data.slice(0, 3).map((codeData: PromotionCode) => (
                        <Button
                          key={codeData.code}
                          size="small"
                          type="link"
                          onClick={() => {
                            setCouponCode(codeData.code);
                          }}
                          className="text-xs p-1 h-auto"
                        >
                          {codeData.code}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => {
                  // Tạo QR code khi chuyển sang bank_transfer
                  if (currentValues.payment_method === 'bank_transfer' && 
                      prevValues.payment_method !== 'bank_transfer') {
                    generateSePayQR();
                  }
                  return prevValues.payment_method !== currentValues.payment_method;
                }}
              >
                {({ getFieldValue }) => {
                  const paymentMethod = getFieldValue('payment_method');
                  
                  if (paymentMethod === 'vnpay') {
                    return (
                      <div className="mb-4">
                        <Alert
                          message="Thanh toán VNPay"
                          description="Bạn sẽ được chuyển hướng đến trang thanh toán VNPay để hoàn tất giao dịch."
                          type="info"
                          showIcon
                        />
                      </div>
                    );
                  }

                  if (paymentMethod === 'momo') {
                    return (
                      <div className="mb-4">
                        <Alert
                          message="Thanh toán MoMo"
                          description="Bạn sẽ được chuyển hướng đến ứng dụng MoMo để hoàn tất giao dịch."
                          type="info"
                          showIcon
                        />
                      </div>
                    );
                  }

                  if (paymentMethod === 'bank_transfer') {
                    return (
                      <div className="mb-4">
                        {sePayQRCode && (
                          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="text-center mb-4">
                              <QrcodeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                              <h4 className="mt-2 mb-4 font-semibold">Quét mã QR để chuyển khoản</h4>
                              <Image
                                src={sePayQRCode}
                                alt="SePay QR Code"
                                width={200}
                                height={200}
                                style={{ border: '1px solid #d9d9d9', borderRadius: '8px' }}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Ngân hàng:</span>
                                <div className="flex items-center gap-2">
                                  <span>{SEPAY_CONFIG.BANK_NAME}</span>
                                  <Tooltip title="Copy tên ngân hàng">
                                    <Button 
                                      size="small" 
                                      type="text" 
                                      icon={<CopyOutlined />}
                                      onClick={() => handleCopyText(SEPAY_CONFIG.BANK_NAME, 'tên ngân hàng')}
                                    />
                                  </Tooltip>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Số tài khoản:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">{SEPAY_CONFIG.ACCOUNT_NUMBER}</span>
                                  <Tooltip title="Copy số tài khoản">
                                    <Button 
                                      size="small" 
                                      type="text" 
                                      icon={<CopyOutlined />}
                                      onClick={() => handleCopyText(SEPAY_CONFIG.ACCOUNT_NUMBER, 'số tài khoản')}
                                    />
                                  </Tooltip>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Chủ tài khoản:</span>
                                <div className="flex items-center gap-2">
                                  <span>{SEPAY_CONFIG.ACCOUNT_NAME}</span>
                                  <Tooltip title="Copy tên chủ tài khoản">
                                    <Button 
                                      size="small" 
                                      type="text" 
                                      icon={<CopyOutlined />}
                                      onClick={() => handleCopyText(SEPAY_CONFIG.ACCOUNT_NAME, 'tên chủ tài khoản')}
                                    />
                                  </Tooltip>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Số tiền:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-red-600">{formatAmount(total)}</span>
                                  <Tooltip title="Copy số tiền">
                                    <Button 
                                      size="small" 
                                      type="text" 
                                      icon={<CopyOutlined />}
                                      onClick={() => handleCopyText(total.toString(), 'số tiền')}
                                    />
                                  </Tooltip>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-start">
                                <span className="font-medium">Nội dung:</span>
                                <div className="flex items-start gap-2 max-w-[200px]">
                                  <span className="text-right break-words">{generatePaymentContent(parseInt(id!))}</span>
                                  <Tooltip title="Copy nội dung chuyển khoản">
                                    <Button 
                                      size="small" 
                                      type="text" 
                                      icon={<CopyOutlined />}
                                      onClick={() => handleCopyText(generatePaymentContent(parseInt(id!)), 'nội dung chuyển khoản')}
                                    />
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                            
                            <Alert
                              message="SePay sẽ tự động xác nhận thanh toán khi nhận được tiền"
                              type="info"
                              showIcon
                              className="mt-4"
                            />
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <Form.Item
                      name="amount_paid"
                      label="Số tiền thanh toán"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số tiền thanh toán' },
                        {
                          validator: (_, value) => {
                            if (value < total) {
                              return Promise.reject('Số tiền thanh toán phải lớn hơn hoặc bằng tổng tiền');
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                        min={total}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>

              <Form.Item
                name="notes"
                label="Ghi chú"
              >
                <TextArea rows={3} placeholder="Nhập ghi chú nếu cần" />
              </Form.Item>

              <Divider />

              <div className="text-right mb-4">
                <Text strong>Tổng tiền cần thanh toán:</Text>
                <Text strong style={{ fontSize: '20px', color: '#f5222d', marginLeft: '8px' }}>
                  {total.toLocaleString('vi-VN')} VNĐ
                </Text>
              </div>

              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={showConfirmModal}
                block
                size="large"
                loading={isProcessingPayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </Button>
            </Form>
          </Card>
        </div>
      </div>

      {/* Modal xác nhận thanh toán */}
      <Modal
        title="Xác nhận thanh toán"
        open={isConfirmModalVisible}
        onOk={handleConfirmPayment}
        onCancel={() => setIsConfirmModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={isProcessingPayment}
      >
        <p>Bạn có chắc chắn muốn thanh toán hóa đơn #{bill.id}?</p>
        <p>Tổng tiền: <Text strong>{total.toLocaleString('vi-VN')} VNĐ</Text></p>
        {form.getFieldValue('payment_method') === 'vnpay' && (
          <Alert
            message="Lưu ý"
            description="Bạn sẽ được chuyển hướng đến trang thanh toán VNPay. Vui lòng hoàn tất thanh toán trên VNPay."
            type="warning"
            showIcon
            className="mt-3"
          />
        )}
        {form.getFieldValue('payment_method') === 'momo' && (
          <Alert
            message="Lưu ý"
            description="Bạn sẽ được chuyển hướng đến ứng dụng MoMo. Vui lòng hoàn tất thanh toán trên MoMo."
            type="warning"
            showIcon
            className="mt-3"
          />
        )}
        {form.getFieldValue('payment_method') === 'bank_transfer' && (
          <Alert
            message="Thanh toán chuyển khoản"
            description="Vui lòng chuyển khoản theo thông tin QR code phía trên. Hệ thống sẽ tự động xác nhận thanh toán sau khi nhận được tiền."
            type="info"
            showIcon
            className="mt-3"
          />
        )}
      </Modal>
    </div>
  );
};

export default Checkout; 