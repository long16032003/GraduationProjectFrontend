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
import { CanAccess, useGo, useList } from '@refinedev/core';
import { NoPermission } from '@/components/NoPermission';

const { Title } = Typography;
const { RangePicker } = DatePicker;

// Interface definitions based on backend API
interface EnterIngredient {
  id: number;
  creator_id: number;
  total_amount: number;
  note?: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  details?: EnterIngredientDetail[];
  details_count?: number;
}

interface EnterIngredientDetail {
  id: number;
  enter_ingredient_id: number;
  ingredient_id: number;
  quantity: number;
  unit_price: number;
  supplier_name: string;
  ingredient?: {
    id: number;
    name: string;
    unit: string;
  };
}

const ManageImportWarehouse: React.FC = () => {
  const navigate = useNavigate();
  const go = useGo();
  
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedImport, setSelectedImport] = useState<EnterIngredient | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [importDetails, setImportDetails] = useState<EnterIngredientDetail[]>([]);

  // Fetch enter ingredients from API
  const { data: enterIngredientsData, isLoading, refetch } = useList<EnterIngredient>({
    resource: 'enter-ingredients',
    // pagination: {
    //   pageSize: 50,
    // },
    sorters: [
      {
        field: 'created_at',
        order: 'desc'
      }
    ],
  });

  const enterIngredients = enterIngredientsData?.data || [];
  
  // Filter imports based on search text and date range
  const filteredImports = enterIngredients.filter(item => {
    const matchesSearch = 
      item.id.toString().includes(searchText) ||
      (item.creator?.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (item.note || '').toLowerCase().includes(searchText.toLowerCase());
    
    const matchesDateRange = !dateRange || (
      dayjs(item.created_at).isAfter(dateRange[0].startOf('day')) && 
      dayjs(item.created_at).isBefore(dateRange[1].endOf('day'))
    );
    
    return matchesSearch && matchesDateRange;
  });
  
  // Handle view details
  const handleViewDetails = async (record: EnterIngredient) => {
    setSelectedImport(record);
    setIsDetailModalVisible(true);
    
    if (record.details && record.details.length > 0) {
      setImportDetails(record.details);
    } else {
      // Fetch details if not included
      setDetailLoading(true);
      try {
        // In a real app, you might have a separate endpoint for details
        // For now, we'll assume details are included in the main response
        setImportDetails([]);
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setDetailLoading(false);
      }
    }
  };
  
  // Handle create new import
  const handleCreateImport = () => {
    go({
      to: '/admin/warehouse/import/new'
    });
  };
  
  // Handle print
  const handlePrint = (record: EnterIngredient) => {
    const printContent = generatePrintContent(record, record.details || []);
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
  const handleExportExcel = (record: EnterIngredient) => {
    try {
      const currentDetails = record.details || [];
      
      // Prepare data for Excel
      const excelData = [
        ['PHIẾU NHẬP KHO'],
        ['Mã phiếu:', `#${record.id}`],
        ['Người lập:', record.creator?.name || 'N/A'],
        ['Ngày lập:', dayjs(record.created_at).format('DD/MM/YYYY HH:mm')],
        ['Tổng tiền:', `${Number(record.total_amount).toLocaleString('vi-VN')} VNĐ`],
        ['Ghi chú:', record.note || 'Không có'],
        [], // Empty row
        ['STT', 'Tên nguyên liệu', 'Số lượng', 'Đơn vị', 'Đơn giá (VNĐ)', 'Thành tiền (VNĐ)', 'Nhà cung cấp'],
        ...currentDetails.map((detail, index) => [
          index + 1,
          detail.ingredient?.name || 'N/A',
          detail.quantity,
          detail.ingredient?.unit || 'N/A',
          detail.unit_price,
          detail.quantity * detail.unit_price,
          detail.supplier_name
        ]),
        [], // Empty row
        ['', '', '', '', 'TỔNG TIỀN:', record.total_amount, '']
      ];

      // Create worksheet
      const ws = document.createElement('table');
      ws.innerHTML = excelData.map(row => 
        `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
      ).join('');

      // Create and download
      const csvContent = excelData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `phieu_nhap_kho_${record.id}_${dayjs().format('DDMMYYYY')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('Đã tải xuống phiếu nhập kho thành công!');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Có lỗi xảy ra khi xuất phiếu nhập kho');
    }
  };



  // Generate print content HTML
  const generatePrintContent = (record: EnterIngredient, details: EnterIngredientDetail[]) => {
    const currentDetails = details.length > 0 ? details : record.details || [];
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Phiếu nhập kho #${record.id}</title>
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
            .text-right {
              text-align: right;
            }
            .text-bold {
              font-weight: bold;
            }
            .total-section {
              margin-top: 20px;
              padding-top: 15px;
              border-top: 2px solid #333;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 18px;
              font-weight: bold;
              color: #e67e22;
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
            <div class="document-title">PHIẾU NHẬP KHO</div>
            <div style="font-size: 16px; color: #666;">Số: ${record.id.toString().padStart(6, '0')}</div>
          </div>

          <div class="info-section">
            <div class="info-group">
              <div class="info-row">
                <span class="info-label">Người lập phiếu:</span>
                <span class="info-value">${record.creator?.name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Ngày lập:</span>
                <span class="info-value">${dayjs(record.created_at).format('DD/MM/YYYY')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Giờ lập:</span>
                <span class="info-value">${dayjs(record.created_at).format('HH:mm:ss')}</span>
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
                <th style="width: 120px;">Đơn giá (VNĐ)</th>
                <th style="width: 130px;">Thành tiền (VNĐ)</th>
                <th>Nhà cung cấp</th>
              </tr>
            </thead>
            <tbody>
              ${currentDetails.map((detail, index) => {
                const totalPrice = detail.quantity * detail.unit_price;
                return `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${detail.ingredient?.name || 'N/A'}</td>
                    <td class="text-center text-bold">${Number(detail.quantity).toLocaleString('vi-VN')}</td>
                    <td class="text-center">${detail.ingredient?.unit || 'N/A'}</td>
                    <td class="text-right">${Number(detail.unit_price).toLocaleString('vi-VN')}</td>
                    <td class="text-right text-bold">${Number(totalPrice).toLocaleString('vi-VN')}</td>
                    <td>${detail.supplier_name}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>TỔNG TIỀN:</span>
              <span>${Number(record.total_amount).toLocaleString('vi-VN')} VNĐ</span>
            </div>
          </div>

          ${record.note ? `
            <div class="note-section">
              <div style="font-weight: bold; margin-bottom: 10px;">Ghi chú:</div>
              <div>${record.note}</div>
            </div>
          ` : ''}

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-title">Người lập phiếu</div>
              <div class="signature-line">${record.creator?.name || 'N/A'}</div>
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
            In lúc: ${dayjs().format('DD/MM/YYYY HH:mm:ss')} | 
            Hệ thống quản lý nhà hàng
          </div>
        </body>
      </html>
    `;
  };
  
  // Import history table columns
  const columns: ColumnsType<EnterIngredient> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'id',
      key: 'id',
      width: '100px',
      render: (id: number) => (
        <span className="font-medium text-blue-600">#{id}</span>
      ),
    },
    {
      title: 'Người lập',
      key: 'creator_name',
      width: '150px',
      render: (_, record) => (
        <span>{record.creator?.name || 'N/A'}</span>
      ),
    },
    {
      title: 'Ngày lập',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '150px',
      render: (date: string) => (
        <div className="text-sm">
          <div>{dayjs(date).format('DD/MM/YYYY')}</div>
          <div className="text-gray-500">{dayjs(date).format('HH:mm')}</div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Số mặt hàng',
      key: 'item_count',
      width: '120px',
      render: (_, record) => (
        <Badge 
          count={record.details?.length || record.details_count || 0} 
          showZero 
          color="#52c41a" 
          overflowCount={99} 
        />
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: '150px',
      render: (amount: number) => (
        <span className="font-semibold text-orange-600">
          {Number(amount).toLocaleString('vi-VN')} VNĐ
        </span>
      ),
      sorter: (a, b) => a.total_amount - b.total_amount,
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
          <Tooltip title="In phiếu nhập">
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
  const detailColumns: ColumnsType<EnterIngredientDetail> = [
    {
      title: 'STT',
      key: 'index',
      width: '60px',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên nguyên liệu',
      key: 'ingredient_name',
      render: (_, record) => (
        <span>{record.ingredient?.name || 'N/A'}</span>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '100px',
      render: (quantity: number) => (
        <span className="font-medium">{quantity.toLocaleString('vi-VN')}</span>
      ),
    },
    {
      title: 'Đơn vị',
      key: 'unit',
      width: '80px',
      render: (_, record) => (
        <span className="text-gray-600">{record.ingredient?.unit || 'N/A'}</span>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: '120px',
      render: (price: number) => `${Number(price).toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Thành tiền',
      key: 'total_price',
      width: '150px',
      render: (_, record) => {
        const totalPrice = record.quantity * record.unit_price;
        return (
          <span className="font-semibold text-blue-600">
            {totalPrice.toLocaleString('vi-VN')} VNĐ
          </span>
        );
      },
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
      ellipsis: true,
    },
  ];
  
  return (
    <CanAccess resource='enter-ingredient' action='create' fallback={<NoPermission />}>
      <div className="p-6">
      <Card className="shadow-sm">
        
        <div className="flex justify-between items-center mb-6">
          <Title level={3} className="m-0 flex items-center text-orange-600">
            <FileTextOutlined className="mr-3 text-orange-600" />
            Lịch sử nhập kho
          </Title>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateImport}
            size="large"
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
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <Button 
              icon={<SearchOutlined />} 
              onClick={() => refetch()}
              loading={isLoading}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
        
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={filteredImports}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} phiếu nhập`,
            }}
            bordered
            scroll={{ x: 1100 }}
            className="ant-table-striped"
            rowClassName={(_, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
            summary={pageData => {
              let totalAmount = 0;
              
              pageData.forEach(({ total_amount }) => {
                totalAmount += total_amount;
              });
              
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <strong>Tổng cộng trang này</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong className="text-orange-600">
                        {Number(totalAmount).toLocaleString('vi-VN')} VNĐ
                      </strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} colSpan={3}></Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Spin>
      </Card>
      
      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <FileTextOutlined className="mr-2 text-orange-500" />
            <span>Chi tiết phiếu nhập #{selectedImport?.id}</span>
            <Tag color="success" className="ml-2">Hoàn thành</Tag>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedImport(null);
          setImportDetails([]);
        }}
        width={1000}
        footer={[
          <Button 
            key="print" 
            icon={<PrinterOutlined />}
            onClick={() => selectedImport && handlePrint(selectedImport)}
          >
            In phiếu
          </Button>,
          <Button 
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => selectedImport && handleExportExcel(selectedImport)}
          >
            Tải Excel
          </Button>,
          <Button 
            key="close" 
            onClick={() => {
              setIsDetailModalVisible(false);
              setSelectedImport(null);
              setImportDetails([]);
            }}
          >
            Đóng
          </Button>,
        ]}
      >
        {selectedImport && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Row gutter={24}>
                <Col span={12}>
                  <div className="space-y-2">
                    <div><strong>Người lập phiếu:</strong> {selectedImport.creator?.name || 'N/A'}</div>
                    <div><strong>Ngày lập:</strong> {dayjs(selectedImport.created_at).format('DD/MM/YYYY HH:mm')}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-2">
                    <div><strong>Tổng tiền:</strong> 
                      <span className="text-orange-600 font-semibold ml-2">
                        {Number(selectedImport.total_amount).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                    <div><strong>Ghi chú:</strong> {selectedImport.note || 'Không có'}</div>
                  </div>
                </Col>
              </Row>
            </div>
            
            <Spin spinning={detailLoading}>
              <Table
                columns={detailColumns}
                dataSource={importDetails}
                pagination={false}
                rowKey="id"
                bordered
                size="small"
                scroll={{ x: 800 }}
                locale={{ emptyText: 'Không có dữ liệu chi tiết' }}
              />
            </Spin>
          </div>
        )}
      </Modal>
    </div>
    </CanAccess>
  );
};

export default ManageImportWarehouse;