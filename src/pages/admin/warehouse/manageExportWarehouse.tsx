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
import { PageLoader } from '@/components/ui/loader';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Interface definitions
interface ExportWarehouse {
  id: number;
  staff_name: string;
  total_amount: number;
  note: string;
  create_at: string;
  item_count: number;
  status: 'completed' | 'pending' | 'cancelled';
  export_type: 'production' | 'damage' | 'transfer' | 'other';
}

interface ExportDetail {
  id: number;
  ingredient_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  reason: string;
}

// Mock data for demonstration
const generateMockExports = (): ExportWarehouse[] => {
  return [
    {
      id: 2001,
      staff_name: 'Võ Thanh Hiếu',
      total_amount: 1500000,
      note: 'Xuất nguyên liệu cho sản xuất',
      create_at: '2023-06-12T09:30:00',
      item_count: 4,
      status: 'completed',
      export_type: 'production'
    },
    {
      id: 2002,
      staff_name: 'Nguyễn Văn A',
      total_amount: 800000,
      note: 'Xuất nguyên liệu hỏng',
      create_at: '2023-06-16T11:45:00',
      item_count: 2,
      status: 'completed',
      export_type: 'damage'
    },
    {
      id: 2003,
      staff_name: 'Trần Thị B',
      total_amount: 1200000,
      note: 'Xuất nguyên liệu cho chi nhánh 2',
      create_at: '2023-06-21T15:20:00',
      item_count: 3,
      status: 'completed',
      export_type: 'transfer'
    },
    {
      id: 2004,
      staff_name: 'Lê Văn C',
      total_amount: 600000,
      note: 'Xuất nguyên liệu cho đối tác',
      create_at: '2023-06-26T14:10:00',
      item_count: 1,
      status: 'completed',
      export_type: 'other'
    },
    {
      id: 2005,
      staff_name: 'Võ Thanh Hiếu',
      total_amount: 2100000,
      note: 'Xuất nguyên liệu cho sản xuất đặc biệt',
      create_at: '2023-06-30T10:15:00',
      item_count: 5,
      status: 'completed',
      export_type: 'production'
    }
  ];
};

const generateMockExportDetails = (exportId: number): ExportDetail[] => {
  // Example details for export ID 2001
  if (exportId === 2001) {
    return [
      {
        id: 1,
        ingredient_name: 'Gạo',
        unit: 'kg',
        quantity: 20,
        unit_price: 20000,
        total_price: 400000,
        reason: 'Sản xuất món cơm chiên'
      },
      {
        id: 2,
        ingredient_name: 'Thịt bò',
        unit: 'kg',
        quantity: 5,
        unit_price: 180000,
        total_price: 900000,
        reason: 'Sản xuất món bò xào'
      },
      {
        id: 3,
        ingredient_name: 'Ớt',
        unit: 'kg',
        quantity: 2,
        unit_price: 40000,
        total_price: 80000,
        reason: 'Gia vị cho các món'
      },
      {
        id: 4,
        ingredient_name: 'Tỏi',
        unit: 'kg',
        quantity: 2,
        unit_price: 60000,
        total_price: 120000,
        reason: 'Gia vị cho các món'
      }
    ];
  }
  
  // Default empty array for other export IDs
  return [];
};

const ManageExportWarehouse: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedExport, setSelectedExport] = useState<ExportWarehouse | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data
  const exports = generateMockExports();
  
  // Filter exports based on search text and date range
  const filteredExports = exports.filter(item => {
    const matchesSearch = 
      item.id.toString().includes(searchText) ||
      item.staff_name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.note.toLowerCase().includes(searchText.toLowerCase()) ||
      getExportTypeText(item.export_type).toLowerCase().includes(searchText.toLowerCase());
    
    const matchesDateRange = !dateRange || (
      dayjs(item.create_at).isAfter(dateRange[0], 'day') && 
      dayjs(item.create_at).isBefore(dateRange[1], 'day')
    );
    
    return matchesSearch && matchesDateRange;
  });
  
  // Handle view details
  const handleViewDetails = (record: ExportWarehouse) => {
    setSelectedExport(record);
    setIsDetailModalVisible(true);
  };
  
  // Handle create new export
  const handleCreateExport = () => {
    navigate('/admin/warehouse/export/new');
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
  
  // Get export type text
  const getExportTypeText = (type: string) => {
    switch (type) {
      case 'production':
        return 'Sản xuất';
      case 'damage':
        return 'Hàng hỏng';
      case 'transfer':
        return 'Chuyển kho';
      case 'other':
        return 'Khác';
      default:
        return type;
    }
  };
  
  // Get export type color
  const getExportTypeColor = (type: string) => {
    switch (type) {
      case 'production':
        return 'blue';
      case 'damage':
        return 'red';
      case 'transfer':
        return 'purple';
      case 'other':
        return 'default';
      default:
        return 'default';
    }
  };
  
  // Export history table columns
  const columns: ColumnsType<ExportWarehouse> = [
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
      title: 'Loại xuất',
      dataIndex: 'export_type',
      key: 'export_type',
      width: '120px',
      render: (type: string) => (
        <Tag color={getExportTypeColor(type)}>
          {getExportTypeText(type)}
        </Tag>
      ),
      filters: [
        { text: 'Sản xuất', value: 'production' },
        { text: 'Hàng hỏng', value: 'damage' },
        { text: 'Chuyển kho', value: 'transfer' },
        { text: 'Khác', value: 'other' },
      ],
      onFilter: (value, record) => record.export_type === value,
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
          <Tooltip title="In phiếu xuất">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => console.log('Print export', record.id)}
              className="text-green-500 hover:text-green-600"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // Detail modal columns
  const detailColumns: ColumnsType<ExportDetail> = [
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
      title: 'Lý do xuất',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
  ];

  if (isLoading) {
    return <PageLoader text="Đang tải dữ liệu..." />;
  }
  
  return (
    <div className="p-4">
      <Card className="shadow-sm mb-4">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item href="/admin">Dashboard</Breadcrumb.Item>
          <Breadcrumb.Item href="/admin/warehouse/ingredient">Quản lý kho</Breadcrumb.Item>
          <Breadcrumb.Item>Lịch sử xuất kho</Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="m-0">
            <FileTextOutlined className="mr-2" />
            Lịch sử xuất kho
          </Title>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateExport}
          >
            Tạo phiếu xuất mới
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
          dataSource={filteredExports}
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
                  <Table.Summary.Cell index={0} colSpan={5}>
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
            Chi tiết phiếu xuất #{selectedExport?.id}
            <Tag 
              color={selectedExport ? getExportTypeColor(selectedExport.export_type) : 'default'}
              className="ml-2"
            >
              {selectedExport ? getExportTypeText(selectedExport.export_type) : ''}
            </Tag>
            <Tag 
              color={selectedExport ? getStatusColor(selectedExport.status) : 'default'}
              className="ml-2"
            >
              {selectedExport ? getStatusText(selectedExport.status) : ''}
            </Tag>
          </span>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={1000}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />}>
            In phiếu xuất
          </Button>,
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedExport && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Người lập phiếu:</strong> {selectedExport.staff_name}</p>
                <p><strong>Ngày lập:</strong> {dayjs(selectedExport.create_at).format('DD/MM/YYYY HH:mm')}</p>
              </div>
              <div>
                <p><strong>Tổng tiền:</strong> {selectedExport.total_amount.toLocaleString('vi-VN')} VNĐ</p>
                <p><strong>Ghi chú:</strong> {selectedExport.note || 'Không có'}</p>
              </div>
            </div>
            
            <Table
              columns={detailColumns}
              dataSource={generateMockExportDetails(selectedExport.id)}
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

export default ManageExportWarehouse;