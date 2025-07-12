import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Card, Table, Divider, Row, Col, Typography, Spin, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useOne } from '@refinedev/core';
import dayjs from 'dayjs';
import { type Bill, type OrderDish } from '@/types';
import { tax_percentage } from '@/utils/constant';
import { useSiteSettingsContext } from '@/providers/SiteSettingsProvider';

const { Title, Text } = Typography;

const PrintBill: React.FC = () => {
  const { billId } = useParams<{ billId: string }>();
  const [isPrinting, setIsPrinting] = useState(false);

  const { settings, getSetting, getJsonSetting, isLoading: settingsLoading } = useSiteSettingsContext();

  const { data: billData, isLoading, error } = useOne<Bill>({
    resource: 'bills',
    id: billId,
  });

  const bill = billData?.data;

  // Auto print when page loads (after a small delay)
  useEffect(() => {
    if (bill && !isLoading) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [bill, isLoading]);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const getTotalAmountDish = (bill: Bill) => {
    if (!bill.orders) return 0;
    
    return bill.orders.reduce((total, order) => {
      if (!order.order_dishes) return total;
      
      return total + order.order_dishes.reduce((orderTotal, dish) => {
        return orderTotal + (dish.quantity * dish.price_at_order_time);
      }, 0);
    }, 0);
  };

  const getAllOrderDishes = (bill: Bill): OrderDish[] => {
    if (!bill.orders) return [];
    
    return bill.orders.flatMap(order => order.order_dishes || []);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Title level={3}>Không tìm thấy hóa đơn</Title>
          <Text>Hóa đơn với ID {billId} không tồn tại hoặc đã bị xóa.</Text>
        </div>
      </div>
    );
  }

  const allDishes = getAllOrderDishes(bill);
  const totalDishAmount = getTotalAmountDish(bill);
  const discountAmount = Number(bill.discount_amount) || 0;
  const taxAmount = Math.round((totalDishAmount - discountAmount) * tax_percentage);
  const finalTotal = Number(bill.total_amount) || 0;

  return (
    <div className="print-container">
      {/* Print Button - Only visible on screen */}
      <div className="no-print" style={{ padding: '20px', textAlign: 'center' }}>
        <Button 
          type="primary" 
          icon={<PrinterOutlined />} 
          onClick={handlePrint}
          loading={isPrinting}
          size="large"
        >
          In hóa đơn
        </Button>
      </div>

      {/* Bill Content - Optimized for printing */}
      <div className="bill-content" style={{ 
        maxWidth: '210mm', 
        margin: '0 auto', 
        padding: '20mm',
        backgroundColor: 'white',
        minHeight: '297mm'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Nhà hàng Bamboo Sông Chanh
          </Title>
          <Text type="secondary">
            Địa chỉ: Bắc Cầu sông Chanh, phường Quảng Yên, Quảng Ninh
          </Text>
          <br />
          <Text type="secondary">
            Điện thoại: 0906.890.890 | Email: longnguyengia890@gmail.com
          </Text>
        </div>

        <Divider />

        {/* Bill Info */}
        <div style={{ marginBottom: '30px' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>
            HÓA ĐƠN THANH TOÁN
          </Title>
          
          <Row gutter={16}>
            <Col span={12}>
              <div>
                <Text strong>Mã hóa đơn: </Text>
                <Text>#{bill.id}</Text>
              </div>
              <div>
                <Text strong>Bàn: </Text>
                <Text>{bill.table?.name || 'N/A'}</Text>
              </div>
              <div>
                <Text strong>Khu vực: </Text>
                <Text>{bill.table?.area || 'N/A'}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text strong>Khách hàng: </Text>
                <Text>{bill.customer_name || 'Khách vãng lai'}</Text>
              </div>
              <div>
                <Text strong>Số điện thoại: </Text>
                <Text>{bill.customer_phone || 'N/A'}</Text>
              </div>
              <div>
                <Text strong>Ngày giờ: </Text>
                <Text>{dayjs(bill.created_at).format('HH:mm DD/MM/YYYY')}</Text>
              </div>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Order Details */}
        <div style={{ marginBottom: '30px' }}>
          <Title level={4}>Chi tiết đơn hàng</Title>
          
          <Table
            dataSource={allDishes}
            pagination={false}
            rowKey={(record) => `${record.order_id}_${record.dish_id}`}
            size="small"
            bordered
            columns={[
              {
                title: 'STT',
                key: 'index',
                width: '8%',
                render: (_, __, index) => index + 1,
              },
              {
                title: 'Tên món ăn',
                dataIndex: ['dish', 'name'],
                key: 'dish_name',
                width: '40%',
              },
              {
                title: 'Số lượng',
                dataIndex: 'quantity',
                key: 'quantity',
                width: '15%',
                align: 'center',
              },
              {
                title: 'Đơn giá',
                dataIndex: 'price_at_order_time',
                key: 'price',
                width: '20%',
                align: 'right',
                render: (price: number) => `${Number(price).toLocaleString('vi-VN')} VNĐ`,
              },
              {
                title: 'Thành tiền',
                key: 'total',
                width: '20%',
                align: 'right',
                render: (_, record: OrderDish) => {
                  const total = record.quantity * record.price_at_order_time;
                  return `${total.toLocaleString('vi-VN')} VNĐ`;
                },
              },
            ]}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <Text strong>Tổng tiền món ăn</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text strong>{totalDishAmount.toLocaleString('vi-VN')} VNĐ</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>

        <Divider />

        {/* Bill Summary */}
        <div style={{ marginBottom: '30px' }}>
          <Row justify="end">
            <Col span={8}>
              <div style={{ border: '1px solid #d9d9d9', padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text>Tổng tiền món ăn:</Text>
                  <Text>{totalDishAmount.toLocaleString('vi-VN')} VNĐ</Text>
                </div>
                
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text>Giảm giá:</Text>
                    <Text style={{ color: '#ff4d4f' }}>-{discountAmount.toLocaleString('vi-VN')} VNĐ</Text>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text>Thuế VAT ({(tax_percentage * 100).toFixed(0)}%):</Text>
                  <Text>{taxAmount.toLocaleString('vi-VN')} VNĐ</Text>
                </div>
                
                <Divider style={{ margin: '8px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                  <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
                    {finalTotal.toLocaleString('vi-VN')} VNĐ
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Payment Info */}
        {bill.status === 'paid' && (
          <div style={{ marginBottom: '30px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong>Phương thức thanh toán: </Text>
                  <Text>
                    {bill.payment_method === 'cash' ? 'Tiền mặt' : 
                     bill.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 'N/A'}
                  </Text>
                </div>
                <div>
                  <Text strong>Trạng thái: </Text>
                  <Text style={{ color: '#52c41a' }}>Đã thanh toán</Text>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Thời gian thanh toán: </Text>
                  <Text>{dayjs(bill.created_at).format('HH:mm DD/MM/YYYY')}</Text>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Notes */}
        {bill.notes && (
          <div style={{ marginBottom: '30px' }}>
            <Text strong>Ghi chú: </Text>
            <Text>{bill.notes}</Text>
          </div>
        )}

        <Divider />

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Text type="secondary">
            Cảm ơn quý khách đã sử dụng dịch vụ!
          </Text>
          <br />
          <Text type="secondary">
            Hẹn gặp lại quý khách trong thời gian sớm nhất!
          </Text>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .bill-content {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            box-shadow: none !important;
          }
          
          .ant-table {
            page-break-inside: avoid;
          }
          
          .ant-divider {
            border-color: #000 !important;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          @page {
            margin: 15mm;
            size: A4;
          }
        }
        
        @media screen {
          .print-container {
            background: #f0f2f5;
            min-height: 100vh;
            padding: 20px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintBill; 