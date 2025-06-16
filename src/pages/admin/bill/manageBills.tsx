import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Card, Input, Modal, Tag, DatePicker, Select, Tooltip, Statistic, Row, Col, Form, InputNumber, message } from 'antd';
import { SearchOutlined, EyeOutlined, PrinterOutlined, ExclamationCircleOutlined, FilterOutlined, PlusOutlined, ShoppingCartOutlined, CheckOutlined } from '@ant-design/icons';
import { useList, useOne } from '@refinedev/core';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { tax_percentage, type Bill, type BillItem } from '@/types';
import { useNavigate } from 'react-router';

const { RangePicker } = DatePicker;
const { Option } = Select;

type RangeValue = [Dayjs, Dayjs] | null;

// Fake data for bills
const generateFakeBills = (): Bill[] => {
  const paymentMethods: Bill['payment_method'][] = ['cash', 'bank_transfer'];
  const statuses: Bill['status'][] = ['paid', 'unpaid', 'cancelled'];
  
  const bills: Bill[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const items: BillItem[] = [];
    // Với những hóa đơn đã thanh toán, mới có danh sách món ăn
    if (i % 3 !== 0) {
      const itemCount = Math.floor(Math.random() * 5) + 1;
      
      for (let j = 1; j <= itemCount; j++) {
        items.push({
          dish_id: j,
          dish_name: `Món ăn ${j}`,
          quantity: Math.floor(Math.random() * 3) + 1,
          unit_price: Math.floor(Math.random() * 100000) + 50000
        });
      }
    }
    
    // Chỉ tính tiền với những đơn đã thanh toán
    let total = 0;
    let discount = 0;
    let tax = 0;
    let status = statuses[Math.floor(Math.random() * statuses.length)];
    let payment_method = null;
    
    if (status === 'paid') {
      total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      discount = Math.random() > 0.7 ? Math.floor(total * 0.1) : 0;
      tax = Math.floor(total * tax_percentage);
      payment_method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    } else {
      // Nếu chưa thanh toán, để trống phương thức thanh toán
      status = 'unpaid';
      payment_method = null;
    }
    
    bills.push({
      id: i,
      creator_id: Math.floor(Math.random() * 10) + 1,
      customer_id: Math.floor(Math.random() * 100) + 1,
      customer_name: `Khách hàng ${i}`,
      customer_phone: Math.random() > 0.5 ? `090${Math.floor(1000000 + Math.random() * 9000000)}` : undefined,
      table_id: Math.floor(Math.random() * 20) + 1,
      table_number: Math.floor(Math.random() * 20) + 1,
      total_amount: status === 'paid' ? total + tax - discount : 0,
      created_at: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format(),
      payment_method: payment_method,
      status: status,
      items: items.length > 0 ? items : undefined,
      discount_amount: discount > 0 ? discount : undefined,
      notes: Math.random() > 0.7 ? 'Ghi chú cho hóa đơn này' : undefined,
      has_new_orders: Math.random() > 0.7 && status === 'unpaid'
    });
  }
  
  return bills;
};

// Form values type
interface CreateBillFormValues {
  customer_name: string;
  customer_phone?: string;
  table_number: number;
  notes?: string;
}

const ManageBills: React.FC = () => {
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null as RangeValue,
    paymentMethod: 'all',
  });

/**====================================START MOCK DATA========================================= */
  // Generate fake bills
  const allBills = useMemo(() => generateFakeBills(), []);
  const isLoadingList = false;
  
  // Filter bills based on filter criteria
  const bills = useMemo(() => {
    let filteredBills = [...allBills];
    
    // Filter by status
    if (filters.status !== 'all') {
      filteredBills = filteredBills.filter(bill => bill.status === filters.status);
    }
    
    // Filter by payment method
    if (filters.paymentMethod !== 'all') {
      filteredBills = filteredBills.filter(bill => bill.payment_method === filters.paymentMethod);
    }
    
    // Filter by date range
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      filteredBills = filteredBills.filter(bill => {
        const billDate = dayjs(bill.created_at);
        return billDate.isAfter(startDate) && billDate.isBefore(endDate.add(1, 'day'));
      });
    }
    
    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filteredBills = filteredBills.filter(bill => 
        bill.id.toString().includes(searchLower) || 
        (bill.customer_name && bill.customer_name.toLowerCase().includes(searchLower)) ||
        (bill.customer_phone && bill.customer_phone.includes(searchLower))
      );
    }
    
    return filteredBills;
  }, [allBills, filters, searchText]);
/**====================================END MOCK DATA========================================= */

  const handleViewDetails = (record: Bill) => {
    setSelectedBill(record);
    setIsDetailModalVisible(true);
  };

  const handlePrintBill = (record: Bill) => {
    console.log('Print bill', record.id);
    window.open(`/print-bill/${record.id}`, '_blank');
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setSelectedBill(null);
  };

  const handleOpenFilter = () => {
    setIsFilterModalVisible(true);
  };

  const handleApplyFilter = (values: typeof filters) => {
    setFilters(values);
    setIsFilterModalVisible(false);
  };

  const handleResetFilter = () => {
    setFilters({
      status: 'all',
      dateRange: null as RangeValue,
      paymentMethod: 'all',
    });
    setIsFilterModalVisible(false);
  };

  const handleCreateBill = () => {
    setIsCreateModalVisible(true);
  };

  const handleCreateModalCancel = () => {
    setIsCreateModalVisible(false);
    form.resetFields();
  };

  const handleCreateModalSubmit = (values: CreateBillFormValues) => {
    console.log('Tạo hóa đơn mới với thông tin:', values);
    // Trong app thực tế, sẽ gửi data này lên API để tạo hóa đơn mới
    message.success('Tạo hóa đơn mới thành công!');
    setIsCreateModalVisible(false);
    form.resetFields();
  };

  const handleCreateOrder = (billId: number) => {
    // Chuyển hướng đến trang tạo đơn gọi món
    navigate(`/admin/order/manageOrder/${billId}`);
  };

  const handleCheckout = (billId: number) => {
    navigate(`/admin/bills/checkout/${billId}`);
  };

  // Calculate summary statistics
  const totalBills = bills.length;
  const totalRevenue = bills.reduce((sum: number, bill: Bill) => sum + (bill.total_amount || 0), 0);
  const paidBills = bills.filter((bill: Bill) => bill.status === 'paid').length;
  const unpaidBills = bills.filter((bill: Bill) => bill.status === 'unpaid').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'unpaid':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'id',
      key: 'id',
      width: '8%',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: '15%',
    },
    {
      title: 'Bàn',
      dataIndex: 'table_number',
      key: 'table_number',
      width: '8%',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: '12%',
      render: (amount: number) => amount ? `${amount.toLocaleString('vi-VN')} VNĐ` : '-',
      sorter: (a: Bill, b: Bill) => (a.total_amount || 0) - (b.total_amount || 0),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '15%',
      render: (date: string) => dayjs(date).format('HH:mm:ss DD/MM/YYYY'),
      sorter: (a: Bill, b: Bill) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: '15%',
      render: (method: string | null) => {
        if (!method) return '-';
        
        const methodDisplay: Record<string, string> = {
          cash: 'Tiền mặt',
          credit_card: 'Thẻ tín dụng',
          momo: 'MoMo',
          vnpay: 'VNPay',
          bank_transfer: 'Chuyển khoản',
        };
        
        return methodDisplay[method] || method;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: string, record: Bill) => {
        const statusDisplay: Record<string, string> = {
          paid: 'Đã thanh toán',
          unpaid: 'Chưa thanh toán',
          cancelled: 'Đã hủy',
        };
        
        return (
          <Space>
            <Tag color={getStatusColor(status)}>{statusDisplay[status] || status}</Tag>
            {record.has_new_orders && <Tag color="blue">Có đơn mới</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_: unknown, record: Bill) => (
        <Space size='small'>
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetails(record)}
              size="small"
            />
          </Tooltip>
          {record.status === 'unpaid' && (
            <>
              <Tooltip title="Gọi món">
                <Button 
                  icon={<ShoppingCartOutlined />} 
                  onClick={() => handleCreateOrder(record.id)}
                  type="primary"
                  ghost
                  size="small"
                />
              </Tooltip>
              <Tooltip title="Thanh toán">
                <Button 
                  icon={<CheckOutlined />} 
                  onClick={() => handleCheckout(record.id)}
                  type="primary"
                  size="small"
                />
              </Tooltip>
            </>
          )}
          {record.status === 'paid' && (
            <Tooltip title="In hóa đơn">
              <Button 
                icon={<PrinterOutlined />} 
                onClick={() => handlePrintBill(record)}
                size="small"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card title='Quản lý hóa đơn' className='m-4'>
      {/* Summary Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng số hóa đơn" 
              value={totalBills} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng doanh thu" 
              value={totalRevenue} 
              valueStyle={{ color: '#3f8600' }}
              suffix="VNĐ"
              precision={0}
              formatter={(value) => `${value.toLocaleString('vi-VN')}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Đã thanh toán" 
              value={paidBills} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Chưa thanh toán" 
              value={unpaidBills} 
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <div className='mb-4 flex justify-between items-center'>
        <Space>
          <Input
            placeholder="Tìm kiếm theo mã hóa đơn, khách hàng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            icon={<FilterOutlined />}
            onClick={handleOpenFilter}
          >
            Bộ lọc
          </Button>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateBill}
        >
          Tạo hóa đơn mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={bills}
        loading={isLoadingList}
        rowKey='id'
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} hóa đơn`,
        }}
      />

      {/* Bill Detail Modal */}
      <Modal
        title={`Chi tiết hóa đơn #${selectedBill?.id}`}
        open={isDetailModalVisible}
        onCancel={handleCloseModal}
        width={800}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>,
          selectedBill?.status === 'unpaid' ? (
            <Space key="unpaid-actions">
              <Button
                type="primary"
                ghost
                icon={<ShoppingCartOutlined />}
                onClick={() => selectedBill && handleCreateOrder(selectedBill.id)}
              >
                Gọi món
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => selectedBill && handleCheckout(selectedBill.id)}
              >
                Thanh toán
              </Button>
            </Space>
          ) : selectedBill?.status === 'paid' ? (
            <Button
              key="print"
              icon={<PrinterOutlined />}
              onClick={() => selectedBill && handlePrintBill(selectedBill)}
            >
              In hóa đơn
            </Button>
          ) : null
        ]}
      >
        {selectedBill && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Khách hàng:</strong> {selectedBill.customer_name}</p>
                <p><strong>Số điện thoại:</strong> {selectedBill.customer_phone || 'N/A'}</p>
                <p><strong>Bàn số:</strong> {selectedBill.table_number}</p>
              </div>
              <div>
                <p><strong>Ngày tạo:</strong> {dayjs(selectedBill.created_at).format('HH:mm:ss DD/MM/YYYY')}</p>
                <p><strong>Phương thức thanh toán:</strong> {selectedBill.payment_method ? {
                  cash: 'Tiền mặt',
                  credit_card: 'Thẻ tín dụng',
                  momo: 'MoMo',
                  vnpay: 'VNPay',
                  bank_transfer: 'Chuyển khoản',
                }[selectedBill.payment_method] || selectedBill.payment_method : '-'}</p>
                <p><strong>Trạng thái:</strong> <Tag color={getStatusColor(selectedBill.status)}>
                  {
                    {
                      paid: 'Đã thanh toán',
                      unpaid: 'Chưa thanh toán',
                      cancelled: 'Đã hủy',
                    }[selectedBill.status] || selectedBill.status
                  }
                </Tag></p>
              </div>
            </div>

            {selectedBill.items && selectedBill.items.length > 0 ? (
              <Table
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
                    dataIndex: 'total_price',
                    key: 'total_price',
                    width: '20%',
                    render: (_: unknown, record: BillItem) => 
                      `${(record.quantity * record.unit_price).toLocaleString('vi-VN')} VNĐ`,
                  },
                ]}
                dataSource={selectedBill.items}
                pagination={false}
                rowKey="dish_id"
                summary={(pageData) => {
                  if (selectedBill.status !== 'paid') return null;

                  const total = pageData.reduce(
                    (sum, item) => sum + (item.quantity * item.unit_price),
                    0,
                  );
                  
                  const discount = selectedBill.discount_amount || 0;
                  const tax = Math.floor(total * tax_percentage);
                  const finalTotal = total + tax - discount;
                  
                  return (
                    <>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3}>Tổng tiền món ăn</Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong>{total.toLocaleString('vi-VN')} VNĐ</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                      
                      {discount > 0 && (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={3}>Giảm giá</Table.Summary.Cell>
                          <Table.Summary.Cell index={1}>
                            <strong>-{discount.toLocaleString('vi-VN')} VNĐ</strong>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      )}
                      
                      {tax > 0 && (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={3}>Thuế VAT</Table.Summary.Cell>
                          <Table.Summary.Cell index={1}>
                            <strong>{tax.toLocaleString('vi-VN')} VNĐ</strong>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      )}
                      
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3}>
                          <strong>Tổng cộng</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong style={{ fontSize: '16px', color: '#f5222d' }}>
                            {finalTotal.toLocaleString('vi-VN')} VNĐ
                          </strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </>
                  );
                }}
              />
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-md">
                <p className="text-gray-500">
                  {selectedBill.status === 'unpaid' 
                    ? 'Chưa có món ăn nào được gọi. Nhấn nút "Gọi món" để thêm món ăn.' 
                    : 'Không có thông tin về món ăn.'
                  }
                </p>
              </div>
            )}

            {selectedBill.notes && (
              <div className="mt-4">
                <strong>Ghi chú:</strong> {selectedBill.notes}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Filter Modal */}
      <Modal
        title="Bộ lọc hóa đơn"
        open={isFilterModalVisible}
        onCancel={() => setIsFilterModalVisible(false)}
        footer={[
          <Button key="reset" onClick={handleResetFilter}>
            Đặt lại
          </Button>,
          <Button key="cancel" onClick={() => setIsFilterModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="apply"
            type="primary"
            onClick={() => handleApplyFilter(filters)}
          >
            Áp dụng
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <div className="mb-2">Trạng thái</div>
            <Select
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="paid">Đã thanh toán</Option>
              <Option value="unpaid">Chưa thanh toán</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </div>

          <div>
            <div className="mb-2">Phương thức thanh toán</div>
            <Select
              style={{ width: '100%' }}
              value={filters.paymentMethod}
              onChange={(value) => setFilters({ ...filters, paymentMethod: value })}
            >
              <Option value="all">Tất cả phương thức</Option>
              <Option value="cash">Tiền mặt</Option>
              <Option value="bank_transfer">Chuyển khoản</Option>
            </Select>
          </div>

          <div>
            <div className="mb-2">Khoảng thời gian</div>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  dateRange: dates as RangeValue,
                });
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Create Bill Modal */}
      <Modal
        title="Tạo hóa đơn mới"
        open={isCreateModalVisible}
        onCancel={handleCreateModalCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateModalSubmit}
        >
          <Form.Item
            name="table_number"
            label="Bàn số"
            rules={[{ required: true, message: 'Vui lòng chọn số bàn' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Chọn số bàn" />
          </Form.Item>

          <Form.Item
            name="customer_name"
            label="Tên khách hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>

          <Form.Item
            name="customer_phone"
            label="Số điện thoại"
          >
            <Input placeholder="Nhập số điện thoại (nếu có)" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Nhập ghi chú cho hóa đơn nếu cần" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Space>
                <Button onClick={handleCreateModalCancel}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Tạo hóa đơn
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManageBills;
