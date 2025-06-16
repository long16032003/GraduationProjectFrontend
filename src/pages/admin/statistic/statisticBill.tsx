import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Card, Input, Modal, Tag, DatePicker, Select, Tooltip, Statistic, Row, Col } from 'antd';
import { SearchOutlined, EyeOutlined, PrinterOutlined, ExclamationCircleOutlined, FilterOutlined } from '@ant-design/icons';
import { useList, useOne } from '@refinedev/core';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { tax_percentage, type Bill, type BillItem } from '@/types';

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
    const itemCount = Math.floor(Math.random() * 5) + 1;
    
    for (let j = 1; j <= itemCount; j++) {
      items.push({
        dish_id: j,
        dish_name: `Món ăn ${j}`,
        quantity: Math.floor(Math.random() * 3) + 1,
        unit_price: Math.floor(Math.random() * 100000) + 50000
      });
    }
    
    const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const discount = Math.random() > 0.7 ? Math.floor(total * 0.1) : 0;
    const tax = Math.floor(total * tax_percentage);
    
    bills.push({
      id: i,
      creator_id: Math.floor(Math.random() * 10) + 1,
      customer_id: Math.floor(Math.random() * 100) + 1,
      table_id: Math.floor(Math.random() * 20) + 1,
      customer_name: `Khách hàng ${i}`,
      customer_phone: `090${Math.floor(1000000 + Math.random() * 9000000)}`,
      table_number: Math.floor(Math.random() * 20) + 1,
      total_amount: total + tax - discount,
      created_at: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format(),
      payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      items: items,
      discount_amount: discount,
      notes: Math.random() > 0.7 ? 'Ghi chú cho hóa đơn này' : undefined
    });
  }
  
  return bills;
};

const StatisticBill: React.FC = () => {
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [searchText, setSearchText] = useState('');
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

  // Mock data for bills - this would be replaced with actual API call
//   const { data, isLoading: isLoadingList } = useList<Bill>({
//     resource: 'bills',
//     filters: [
//       {
//         field: 'status',
//         operator: 'eq',
//         value: filters.status !== 'all' ? filters.status : undefined,
//       },
//       {
//         field: 'payment_method',
//         operator: 'eq',
//         value: filters.paymentMethod !== 'all' ? filters.paymentMethod : undefined,
//       },
//       // Date range filter would be handled in backend
//     ],
//   });

// const bills = data?.data || [];
  const handleViewDetails = (record: Bill) => {
    setSelectedBill(record);
    setIsDetailModalVisible(true);
  };

  const handlePrintBill = (record: Bill) => {
    // Implement print functionality
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
      width: '10%',
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
      render: (amount: number) => `${amount?.toLocaleString('vi-VN')} VNĐ`,
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
      render: (method: string) => {
        const methodDisplay: Record<string, string> = {
          cash: 'Tiền mặt',
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
      width: '10%',
      render: (status: string) => {
        const statusDisplay: Record<string, string> = {
          paid: 'Đã thanh toán',
          unpaid: 'Chưa thanh toán',
          cancelled: 'Đã hủy',
        };
        
        return <Tag color={getStatusColor(status)}>{statusDisplay[status] || status}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_: unknown, record: Bill) => (
        <Space size='middle'>
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="In hóa đơn">
            <Button 
              icon={<PrinterOutlined />} 
              onClick={() => handlePrintBill(record)}
            />
          </Tooltip>
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
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => selectedBill && handlePrintBill(selectedBill)}
          >
            In hóa đơn
          </Button>,
        ]}
      >
        {/* {selectedBill && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Khách hàng:</strong> {selectedBill.customer_name}</p>
                <p><strong>Số điện thoại:</strong> {selectedBill.customer_phone || 'N/A'}</p>
                <p><strong>Bàn số:</strong> {selectedBill.table_number}</p>
              </div>
              <div>
                <p><strong>Ngày tạo:</strong> {dayjs(selectedBill.created_at).format('HH:mm:ss DD/MM/YYYY')}</p>
                <p><strong>Phương thức thanh toán:</strong> {
                  {
                    cash: 'Tiền mặt',
                    bank_transfer: 'Chuyển khoản',
                  }[selectedBill.payment_method] || selectedBill.payment_method
                }</p>
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
              dataSource={selectedBill.items || []}
              pagination={false}
              rowKey="dish_id"
              summary={(pageData) => {
                const total = pageData.reduce(
                  (sum, item) => sum + (item.quantity * item.unit_price),
                  0,
                );
                
                const discount = selectedBill.discount_amount || 0;
                const tax = (selectedBill.total_amount * tax_percentage) || 0;
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

            {selectedBill.notes && (
              <div className="mt-4">
                <strong>Ghi chú:</strong> {selectedBill.notes}
              </div>
            )}
          </div>
        )} */}
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
    </Card>
  );
};

export default StatisticBill;
