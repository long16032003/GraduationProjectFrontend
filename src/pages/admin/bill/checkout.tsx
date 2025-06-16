import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Form, Input, InputNumber, Select, Button, Table, Space, message, Divider, Typography, Modal } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { type Bill, type BillItem, tax_percentage } from '@/types';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Fake data generator for bills
const generateFakeBill = (billId: number): Bill | null => {
  const paymentMethods: Bill['payment_method'][] = ['cash', 'bank_transfer', 'momo', 'vnpay'];
  const statuses: Bill['status'][] = ['paid', 'unpaid', 'cancelled'];
  
  // Generate fake bill items
  const items: BillItem[] = [];
  const itemCount = Math.floor(Math.random() * 5) + 2; // 2-6 items
  
  const dishNames = [
    'Phở bò tái', 'Bún chả', 'Cơm tấm sườn', 'Bánh mì thịt nướng', 
    'Gỏi cuốn tôm thịt', 'Chả cá Lã Vọng', 'Bún bò Huế', 'Cao lầu',
    'Mì Quảng', 'Bánh xèo', 'Nem nướng', 'Chè ba màu'
  ];
  
  for (let i = 0; i < itemCount; i++) {
    items.push({
      dish_id: i + 1,
      dish_name: dishNames[Math.floor(Math.random() * dishNames.length)],
      quantity: Math.floor(Math.random() * 3) + 1,
      unit_price: Math.floor(Math.random() * 100000) + 50000
    });
  }
  
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const discount = Math.random() > 0.7 ? Math.floor(subtotal * 0.1) : 0;
  const tax = Math.floor(subtotal * tax_percentage);
  const total = subtotal + tax - discount;
  
  return {
    id: billId,
    creator_id: Math.floor(Math.random() * 10) + 1,
    customer_id: Math.floor(Math.random() * 100) + 1,
    customer_name: `Khách hàng ${billId}`,
    customer_phone: Math.random() > 0.3 ? `090${Math.floor(1000000 + Math.random() * 9000000)}` : undefined,
    table_id: Math.floor(Math.random() * 20) + 1,
    table_number: Math.floor(Math.random() * 20) + 1,
    total_amount: total,
    discount_amount: discount > 0 ? discount : undefined,
    created_at: dayjs().subtract(Math.floor(Math.random() * 7), 'day').format(),
    payment_method: null, // Will be set after payment
    status: 'unpaid' as const,
    items: items,
    notes: Math.random() > 0.7 ? 'Ghi chú cho hóa đơn này' : undefined
  };
};

const Checkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  // Generate fake bill data
  const bill = useMemo(() => {
    if (!id) return null;
    return generateFakeBill(parseInt(id));
  }, [id]);

  const isLoading = false;

  // Tính toán tổng tiền
  const calculateTotals = () => {
    if (!bill?.items) return { subtotal: 0, tax: 0, total: 0 };

    const subtotal = bill.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const tax = Math.floor(subtotal * tax_percentage);
    const discount = bill.discount_amount || 0;
    const total = subtotal + tax - discount;

    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  const handleBack = () => {
    navigate('/admin/bills');
  };

  interface PaymentFormValues {
    payment_method: string;
    amount_paid: number;
    notes?: string;
  }

  const handleSubmit = async (values: PaymentFormValues) => {
    console.log('Payment values:', values);
    // Trong thực tế, sẽ gửi data này lên API để xử lý thanh toán
    message.success('Thanh toán thành công!');
    navigate('/admin/bill/manageBills');
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
                <Text strong>Khách hàng:</Text> {bill.customer_name}
              </div>
              <div>
                <Text strong>Số điện thoại:</Text> {bill.customer_phone || 'N/A'}
              </div>
              <div>
                <Text strong>Bàn số:</Text> {bill.table_number}
              </div>
            </div>
          </Card>

          <Card title="Chi tiết món ăn">
            <Table
              dataSource={bill.items}
              pagination={false}
              rowKey="dish_id"
              columns={[
                {
                  title: 'Món ăn',
                  dataIndex: 'dish_name',
                  key: 'dish_name',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: '15%',
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'unit_price',
                  key: 'unit_price',
                  width: '20%',
                  render: (price: number) => `${price.toLocaleString('vi-VN')} VNĐ`,
                },
                {
                  title: 'Thành tiền',
                  key: 'total_price',
                  width: '20%',
                  render: (_: unknown, record: BillItem) =>
                    `${(record.quantity * record.unit_price).toLocaleString('vi-VN')} VNĐ`,
                },
              ]}
              summary={() => (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>Tổng tiền món ăn</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{subtotal.toLocaleString('vi-VN')} VNĐ</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  {bill.discount_amount && bill.discount_amount > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <Text strong>Giảm giá</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text strong>-{bill.discount_amount.toLocaleString('vi-VN')} VNĐ</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>Thuế VAT ({tax_percentage * 100}%)</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{tax.toLocaleString('vi-VN')} VNĐ</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>Tổng cộng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
                        {total.toLocaleString('vi-VN')} VNĐ
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              )}
            />
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
              >
                Xác nhận thanh toán
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
      >
        <p>Bạn có chắc chắn muốn thanh toán hóa đơn #{bill.id}?</p>
        <p>Tổng tiền: <Text strong>{total.toLocaleString('vi-VN')} VNĐ</Text></p>
      </Modal>
    </div>
  );
};

export default Checkout; 