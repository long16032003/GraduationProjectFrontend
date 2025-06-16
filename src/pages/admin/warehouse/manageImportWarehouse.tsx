import React, { useState } from 'react';
import {
  Table,
  Button,
  Card,
  Space,
  Tag,
  Input,
  DatePicker,
  Row,
  Col,
  Typography,
  Breadcrumb,
  Tooltip,
  Modal,
  Badge
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useGo } from '@refinedev/core';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Interface definitions
interface ImportWarehouse {
  id: number;
  staff_name: string;
  total_amount: number;
  note: string;
  create_at: string;
  item_count: number;
  status: 'completed' | 'pending' | 'cancelled';
}

interface ImportDetail {
  id: number;
  ingredient_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  supplier_name: string;
}

// Mock data for demonstration
const generateMockImports = (): ImportWarehouse[] => {
  return [
    {
      id: 1001,
      staff_name: 'Võ Thanh Hiếu',
      total_amount: 3500000,
      note: 'Nhập hàng đầu tháng',
      create_at: '2023-06-10T08:00:00',
      item_count: 5,
      status: 'completed'
    },
    {
      id: 1002,
      staff_name: 'Nguyễn Văn A',
      total_amount: 2800000,
      note: 'Nhập hàng bổ sung',
      create_at: '2023-06-15T10:30:00',
      item_count: 3,
      status: 'completed'
    },
    {
      id: 1003,
      staff_name: 'Trần Thị B',
      total_amount: 4200000,
      note: 'Nhập hàng theo kế hoạch',
      create_at: '2023-06-20T14:15:00',
      item_count: 7,
      status: 'completed'
    },
    {
      id: 1004,
      staff_name: 'Lê Văn C',
      total_amount: 1500000,
      note: 'Nhập hàng khẩn cấp',
      create_at: '2023-06-25T16:45:00',
      item_count: 2,
      status: 'completed'
    },
    {
      id: 1005,
      staff_name: 'Võ Thanh Hiếu',
      total_amount: 5100000,
      note: 'Nhập hàng cuối tháng',
      create_at: '2023-06-30T09:20:00',
      item_count: 8,
      status: 'completed'
    }
  ];
};

const generateMockImportDetails = (importId: number): ImportDetail[] => {
  // Example details for import ID 1001
  if (importId === 1001) {
    return [
      {
        id: 1,
        ingredient_name: 'Gạo',
        unit: 'kg',
        quantity: 50,
        unit_price: 20000,
        total_price: 1000000,
        supplier_name: 'Công ty TNHH Thực phẩm Hải Châu'
      },
      {
        id: 2,
        ingredient_name: 'Thịt bò',
        unit: 'kg',
        quantity: 10,
        unit_price: 180000,
        total_price: 1800000,
        supplier_name: 'Công ty CP Thực phẩm sạch Việt Nam'
      },
      {
        id: 3,
        ingredient_name: 'Ớt',
        unit: 'kg',
        quantity: 5,
        unit_price: 40000,
        total_price: 200000,
        supplier_name: 'Nhà cung cấp Thực phẩm XYZ'
      },
      {
        id: 4,
        ingredient_name: 'Tỏi',
        unit: 'kg',
        quantity: 3,
        unit_price: 60000,
        total_price: 180000,
        supplier_name: 'Nhà cung cấp Thực phẩm XYZ'
      },
      {
        id: 5,
        ingredient_name: 'Cà chua',
        unit: 'kg',
        quantity: 8,
        unit_price: 40000,
        total_price: 320000,
        supplier_name: 'Công ty TNHH Thực phẩm Hải Châu'
      }
    ];
  }
  
  // Default empty array for other import IDs
  return [];
};

const ManageImportWarehouse: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedImport, setSelectedImport] = useState<ImportWarehouse | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const go = useGo();

  // Mock data
  const imports = generateMockImports();
  
  // Filter imports based on search text and date range
  const filteredImports = imports.filter(item => {
    const matchesSearch = 
      item.id.toString().includes(searchText) ||
      item.staff_name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.note.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesDateRange = !dateRange || (
      dayjs(item.create_at).isAfter(dateRange[0], 'day') && 
      dayjs(item.create_at).isBefore(dateRange[1], 'day')
    );
    
    return matchesSearch && matchesDateRange;
  });
  
  // Handle view details
  const handleViewDetails = (record: ImportWarehouse) => {
    setSelectedImport(record);
    setIsDetailModalVisible(true);
  };
  
  // Handle create new import
  const handleCreateImport = () => {
    go({
      to: '/admin/warehouse/import/new'
    });
  };
  
  // Get status tag color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'processing';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Đang xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };
  
  // Import history table columns
  const columns: ColumnsType<ImportWarehouse> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'id',
      key: 'id',
      width: '100px',
      render: (id: number) => (
        <span className="font-medium">#{id}</span>
      ),
    },
    {
      title: 'Người lập',
      dataIndex: 'staff_name',
      key: 'staff_name',
      width: '150px',
    },
    {
      title: 'Ngày lập',
      dataIndex: 'create_at',
      key: 'create_at',
      width: '150px',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.create_at).unix() - dayjs(b.create_at).unix(),
    },
    {
      title: 'Số mặt hàng',
      dataIndex: 'item_count',
      key: 'item_count',
      width: '120px',
      render: (count: number) => (
        <Badge count={count} showZero color="#52c41a" overflowCount={99} />
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: '150px',
      render: (amount: number) => (
        <span className="font-semibold text-orange-600">
          {amount.toLocaleString('vi-VN')} VNĐ
        </span>
      ),
      sorter: (a, b) => a.total_amount - b.total_amount,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '120px',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '120px',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              className="text-blue-500 hover:text-blue-600"
            />
          </Tooltip>
          <Tooltip title="In phiếu nhập">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => console.log('Print import', record.id)}
              className="text-green-500 hover:text-green-600"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // Detail modal columns
  const detailColumns: ColumnsType<ImportDetail> = [
    {
      title: 'STT',
      key: 'index',
      width: '60px',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'ingredient_name',
      key: 'ingredient_name',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: '80px',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '100px',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: '120px',
      render: (price: number) => `${price.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total_price',
      key: 'total_price',
      width: '150px',
      render: (price: number) => (
        <span className="font-semibold">
          {price.toLocaleString('vi-VN')} VNĐ
        </span>
      ),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
      ellipsis: true,
    },
  ];
  
  return (
    <div className="p-4">
      <Card className="shadow-sm mb-4">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item href="/admin">Dashboard</Breadcrumb.Item>
          <Breadcrumb.Item href="/admin/warehouse/ingredient">Quản lý kho</Breadcrumb.Item>
          <Breadcrumb.Item>Lịch sử nhập kho</Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="m-0">
            <FileTextOutlined className="mr-2" />
            Lịch sử nhập kho
          </Title>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateImport}
          >
            Tạo phiếu nhập mới
          </Button>
        </div>
        
        <Row gutter={16} className="mb-4">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm theo mã phiếu, người lập, ghi chú..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={filteredImports}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
          scroll={{ x: 1100 }}
          summary={pageData => {
            let totalAmount = 0;
            
            pageData.forEach(({ total_amount }) => {
              totalAmount += total_amount;
            });
            
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <strong>Tổng cộng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong className="text-orange-600">
                      {totalAmount.toLocaleString('vi-VN')} VNĐ
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={3}></Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>
      
      {/* Detail Modal */}
      <Modal
        title={
          <span>
            Chi tiết phiếu nhập #{selectedImport?.id}
            <Tag 
              color={selectedImport ? getStatusColor(selectedImport.status) : 'default'}
              className="ml-2"
            >
              {selectedImport ? getStatusText(selectedImport.status) : ''}
            </Tag>
          </span>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={1000}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />}>
            In phiếu nhập
          </Button>,
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedImport && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Người lập phiếu:</strong> {selectedImport.staff_name}</p>
                <p><strong>Ngày lập:</strong> {dayjs(selectedImport.create_at).format('DD/MM/YYYY HH:mm')}</p>
              </div>
              <div>
                <p><strong>Tổng tiền:</strong> {selectedImport.total_amount.toLocaleString('vi-VN')} VNĐ</p>
                <p><strong>Ghi chú:</strong> {selectedImport.note || 'Không có'}</p>
              </div>
            </div>
            
            <Table
              columns={detailColumns}
              dataSource={generateMockImportDetails(selectedImport.id)}
              pagination={false}
              rowKey="id"
              bordered
              size="small"
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default ManageImportWarehouse;