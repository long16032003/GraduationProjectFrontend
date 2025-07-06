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
  Badge,
  Spin,
  message
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  FileTextOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { CanAccess, useList } from '@refinedev/core';
import { NoPermission } from '@/components/NoPermission';

const { Title } = Typography;
const { RangePicker } = DatePicker;

// Interface definitions matching backend structure
interface ExportIngredient {
  id: number;
  creator_id: number;
  note?: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
  };
  details?: ExportIngredientDetail[];
}

interface ExportIngredientDetail {
  id: number;
  export_ingredient_id: number;
  ingredient_id: number;
  quantity: number;
  ingredient?: {
    id: number;
    name: string;
    unit: string;
  };
}

const ManageExportWarehouse: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedExport, setSelectedExport] = useState<ExportIngredient | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [exportDetails, setExportDetails] = useState<ExportIngredientDetail[]>([]);
  
  // API calls
  const { data: exports, isLoading, refetch } = useList<ExportIngredient>({
    resource: 'export-ingredients',
    meta: {
      populate: ['creator', 'details.ingredient']
    }
  });
  
  // Filter exports based on search text and date range
  const filteredExports = exports?.data.filter(item => {
    const matchesSearch = 
      item.id.toString().includes(searchText) ||
      (item.creator?.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (item.note || '').toLowerCase().includes(searchText.toLowerCase());
    
    const matchesDateRange = !dateRange || (
      dayjs(item.created_at).isAfter(dateRange[0], 'day') && 
      dayjs(item.created_at).isBefore(dateRange[1], 'day')
    );
    
    return matchesSearch && matchesDateRange;
  }) || [];
  
  // Handle view details
  const handleViewDetails = (record: ExportIngredient) => {
    setSelectedExport(record);
    setExportDetails(record.details || []);
    setIsDetailModalVisible(true);
  };
  
  // Handle create new export
  const handleCreateExport = () => {
    navigate('/admin/warehouse/export/new');
  };
  
  // Handle print
  const handlePrint = (record: ExportIngredient) => {
    const printContent = generatePrintContent(record);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  // Handle export to Excel
  const handleExportExcel = (record: ExportIngredient) => {
    try {
      const currentDetails = record.details || [];
      
      // Prepare data for Excel
      const excelData = [
        ['PHIẾU XUẤT KHO'],
        ['Mã phiếu:', `#${record.id}`],
        ['Người lập:', record.creator?.name || 'N/A'],
        ['Ngày lập:', dayjs(record.created_at).format('DD/MM/YYYY HH:mm')],
        ['Ghi chú:', record.note || 'Không có'],
        [], // Empty row
        ['STT', 'Tên nguyên liệu', 'Số lượng', 'Đơn vị'],
        ...currentDetails.map((detail, index) => [
          index + 1,
          detail.ingredient?.name || 'N/A',
          detail.quantity,
          detail.ingredient?.unit || 'N/A'
        ]),
        [], // Empty row
        ['', `Tổng số loại nguyên liệu: ${currentDetails.length}`, '', ''],
        ['', `Tổng số lượng: ${currentDetails.reduce((sum, item) => sum + item.quantity, 0)}`, '', '']
      ];

      // Create and download
      const csvContent = excelData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `phieu_xuat_kho_${record.id}_${dayjs().format('DDMMYYYY')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('Đã tải xuống phiếu xuất kho thành công!');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Có lỗi xảy ra khi xuất phiếu xuất kho');
    }
  };

  // Generate print content HTML
  const generatePrintContent = (record: ExportIngredient) => {
    const currentDetails = record.details || [];
    
    // Create table rows
    const tableRows = currentDetails.map((detail, index) => {
      const ingredientName = detail.ingredient?.name || 'N/A';
      const quantity = Number(detail.quantity).toLocaleString('vi-VN');
      const unit = detail.ingredient?.unit || 'N/A';
      
      return `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>${ingredientName}</td>
          <td class="text-center text-bold">${quantity}</td>
          <td class="text-center">${unit}</td>
        </tr>
      `;
    }).join('');

    // Format dates safely
    const createdDate = dayjs(record.created_at).format('DD/MM/YYYY');
    const createdTime = dayjs(record.created_at).format('HH:mm:ss');
    const printTime = dayjs().format('DD/MM/YYYY HH:mm:ss');
    const exportId = record.id.toString().padStart(6, '0');
    const creatorName = record.creator?.name || 'N/A';
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>Phiếu xuất kho #${record.id}</title>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      font-size: 14px;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    .document-title {
      font-size: 20px;
      font-weight: bold;
      color: #e67e22;
      margin: 15px 0;
    }
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      gap: 40px;
    }
    .info-group {
      flex: 1;
    }
    .info-row {
      margin-bottom: 8px;
      display: flex;
    }
    .info-label {
      font-weight: bold;
      min-width: 120px;
      color: #333;
    }
    .info-value {
      flex: 1;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .table th,
    .table td {
      border: 1px solid #ddd;
      padding: 12px 8px;
      text-align: left;
    }
    .table th {
      background-color: #f8f9fa;
      font-weight: bold;
      color: #333;
      text-align: center;
    }
    .table tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    .text-center {
      text-align: center;
    }
    .text-bold {
      font-weight: bold;
    }
    .signature-section {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      text-align: center;
      flex: 1;
    }
    .signature-title {
      font-weight: bold;
      margin-bottom: 60px;
    }
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 60px;
      padding-top: 5px;
    }
    .note-section {
      margin-top: 30px;
      padding: 15px;
      background-color: #f8f9fa;
      border-left: 4px solid #e67e22;
    }
    .print-info {
      margin-top: 30px;
      text-align: center;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
    @media print {
      body { margin: 0; }
      .print-info { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">NHÀ HÀNG BAMBOO SÔNG CHANH</div>
    <div class="document-title">PHIẾU XUẤT KHO</div>
    <div style="font-size: 16px; color: #666;">Số: ${exportId}</div>
  </div>

  <div class="info-section">
    <div class="info-group">
      <div class="info-row">
        <span class="info-label">Người lập phiếu:</span>
        <span class="info-value">${creatorName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Ngày lập:</span>
        <span class="info-value">${createdDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Giờ lập:</span>
        <span class="info-value">${createdTime}</span>
      </div>
    </div>
    <div class="info-group">
      <div class="info-row">
        <span class="info-label">Mã phiếu:</span>
        <span class="info-value text-bold">#${record.id}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Trạng thái:</span>
        <span class="info-value" style="color: #27ae60; font-weight: bold;">Hoàn thành</span>
      </div>
      <div class="info-row">
        <span class="info-label">Số mặt hàng:</span>
        <span class="info-value text-bold">${currentDetails.length}</span>
      </div>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th style="width: 50px;">STT</th>
        <th>Tên nguyên liệu</th>
        <th style="width: 100px;">Số lượng</th>
        <th style="width: 80px;">Đơn vị</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  ${record.note ? `
  <div class="note-section">
    <div style="font-weight: bold; margin-bottom: 10px;">Ghi chú:</div>
    <div>${record.note}</div>
  </div>
  ` : ''}

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-title">Người lập phiếu</div>
      <div class="signature-line">${creatorName}</div>
    </div>
    <div class="signature-box">
      <div class="signature-title">Thủ kho</div>
      <div class="signature-line">........................</div>
    </div>
    <div class="signature-box">
      <div class="signature-title">Người phê duyệt</div>
      <div class="signature-line">........................</div>
    </div>
  </div>

  <div class="print-info">
    In lúc: ${printTime} | Hệ thống quản lý nhà hàng
  </div>
</body>
</html>`;
  };
  
  // Export history table columns
  const columns: ColumnsType<ExportIngredient> = [
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
      key: 'creator',
      width: '150px',
      render: (_, record) => record.creator?.name || 'N/A',
    },
    {
      title: 'Ngày lập',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '150px',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Số mặt hàng',
      key: 'item_count',
      width: '120px',
      render: (_, record) => (
        <Badge 
          count={record.details?.length || 0} 
          showZero 
          color="#52c41a" 
          overflowCount={99} 
        />
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (note: string) => note || <span className="text-gray-400">Không có</span>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: '120px',
      render: () => (
        <Tag color="success">Hoàn thành</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '160px',
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
              onClick={() => handlePrint(record)}
              className="text-green-500 hover:text-green-600"
            />
          </Tooltip>
          <Tooltip title="Tải Excel">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleExportExcel(record)}
              className="text-purple-500 hover:text-purple-600"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // Detail modal columns
  const detailColumns: ColumnsType<ExportIngredientDetail> = [
    {
      title: 'STT',
      key: 'index',
      width: '60px',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên nguyên liệu',
      key: 'ingredient_name',
      render: (_, record) => record.ingredient?.name || 'N/A',
    },
    {
      title: 'Đơn vị',
      key: 'unit',
      width: '80px',
      render: (_, record) => record.ingredient?.unit || 'N/A',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '100px',
      render: (quantity: number) => (
        <span className="font-medium">{Number(quantity).toLocaleString('vi-VN')}</span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }
  
  return (
    <CanAccess resource='export-ingredient' action='create' fallback={<NoPermission />}>
      <div className="p-4">
      <Card className="shadow-sm mb-4">
        <Breadcrumb 
          className="mb-4"
          items={[
            {
              title: <a href="/admin">Dashboard</a>,
            },
            {
              title: <a href="/admin/warehouse">Quản lý kho</a>,
            },
            {
              title: 'Lịch sử xuất kho',
            },
          ]}
        />
        
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
          <Col xs={24} md={8}>
            <Button onClick={() => refetch()}>
              Làm mới
            </Button>
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={filteredExports}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
          scroll={{ x: 1000 }}
          locale={{ emptyText: 'Chưa có phiếu xuất nào' }}
          summary={pageData => {
            const totalExports = pageData.length;
            const totalItems = pageData.reduce((sum, record) => sum + (record.details?.length || 0), 0);
            
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <strong>Tổng số phiếu: {totalExports}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>Tổng mặt hàng: {totalItems}</strong>
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
            <Tag color="success" className="ml-2">
              Hoàn thành
            </Tag>
          </span>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={800}
        footer={[
          <Button 
            key="print" 
            icon={<PrinterOutlined />}
            onClick={() => selectedExport && handlePrint(selectedExport)}
          >
            In phiếu
          </Button>,
          <Button 
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => selectedExport && handleExportExcel(selectedExport)}
          >
            Tải Excel
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
                <p><strong>Người lập phiếu:</strong> {selectedExport.creator?.name || 'N/A'}</p>
                <p><strong>Ngày lập:</strong> {dayjs(selectedExport.created_at).format('DD/MM/YYYY HH:mm')}</p>
              </div>
              <div>
                <p><strong>Số mặt hàng:</strong> {exportDetails.length}</p>
                <p><strong>Ghi chú:</strong> {selectedExport.note || 'Không có'}</p>
              </div>
            </div>
            
            <Table
              columns={detailColumns}
              dataSource={exportDetails}
              pagination={false}
              rowKey="id"
              bordered
              size="small"
              locale={{ emptyText: 'Không có chi tiết' }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <strong>Tổng cộng</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong>
                        {exportDetails.reduce((sum, item) => sum + item.quantity, 0).toLocaleString('vi-VN')}
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </>
        )}
      </Modal>
      </div>
    </CanAccess>
  );
};

export default ManageExportWarehouse;