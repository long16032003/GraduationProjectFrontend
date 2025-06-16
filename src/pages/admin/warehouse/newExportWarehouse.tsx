import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  InputNumber,
  Table,
  Space,
  Typography,
  Breadcrumb,
  Row,
  Col,
  Divider,
  message,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { PageLoader } from '@/components/ui/loader';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Interface definitions
interface Ingredient {
  id: number;
  name: string;
  unit: string;
  current_quantity: number;
  unit_price: number;
}

interface ExportItem {
  key: string;
  ingredient_id: number;
  ingredient_name: string;
  unit: string;
  quantity: number;
  available_quantity: number;
  unit_price: number;
  total_price: number;
  reason: string;
}

// Mock data for demonstration
const mockIngredients: Ingredient[] = [
  { id: 1, name: 'Gạo', unit: 'kg', current_quantity: 100, unit_price: 20000 },
  { id: 2, name: 'Thịt bò', unit: 'kg', current_quantity: 30, unit_price: 180000 },
  { id: 3, name: 'Thịt heo', unit: 'kg', current_quantity: 50, unit_price: 120000 },
  { id: 4, name: 'Ớt', unit: 'kg', current_quantity: 10, unit_price: 40000 },
  { id: 5, name: 'Tỏi', unit: 'kg', current_quantity: 15, unit_price: 60000 },
  { id: 6, name: 'Hành', unit: 'kg', current_quantity: 20, unit_price: 35000 },
  { id: 7, name: 'Cà chua', unit: 'kg', current_quantity: 25, unit_price: 40000 },
  { id: 8, name: 'Dầu ăn', unit: 'lít', current_quantity: 40, unit_price: 50000 },
  { id: 9, name: 'Nước mắm', unit: 'lít', current_quantity: 20, unit_price: 70000 },
  { id: 10, name: 'Đường', unit: 'kg', current_quantity: 50, unit_price: 25000 }
];

const NewExportWarehouse: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [exportItems, setExportItems] = useState<ExportItem[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [reason, setReason] = useState<string>('');
  
  // Calculate total amount
  const totalAmount = exportItems.reduce((sum, item) => sum + item.total_price, 0);
  
  // Handle add item
  const handleAddItem = () => {
    if (!selectedIngredientId || !quantity || quantity <= 0 || !reason.trim()) {
      message.error('Vui lòng chọn nguyên liệu, nhập số lượng và lý do xuất kho');
      return;
    }
    
    const selectedIngredient = mockIngredients.find(i => i.id === selectedIngredientId);
    
    if (!selectedIngredient) {
      message.error('Nguyên liệu không hợp lệ');
      return;
    }
    
    if (quantity > selectedIngredient.current_quantity) {
      message.error(`Số lượng xuất không được vượt quá số lượng hiện có (${selectedIngredient.current_quantity} ${selectedIngredient.unit})`);
      return;
    }
    
    const existingItemIndex = exportItems.findIndex(item => item.ingredient_id === selectedIngredientId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...exportItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > selectedIngredient.current_quantity) {
        message.error(`Tổng số lượng xuất không được vượt quá số lượng hiện có (${selectedIngredient.current_quantity} ${selectedIngredient.unit})`);
        return;
      }
      
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
        total_price: newQuantity * selectedIngredient.unit_price,
        reason: reason
      };
      
      setExportItems(updatedItems);
    } else {
      // Add new item
      const newItem: ExportItem = {
        key: `${selectedIngredient.id}`,
        ingredient_id: selectedIngredient.id,
        ingredient_name: selectedIngredient.name,
        unit: selectedIngredient.unit,
        quantity: quantity,
        available_quantity: selectedIngredient.current_quantity,
        unit_price: selectedIngredient.unit_price,
        total_price: quantity * selectedIngredient.unit_price,
        reason: reason
      };
      
      setExportItems([...exportItems, newItem]);
    }
    
    // Reset selection
    setSelectedIngredientId(null);
    setQuantity(null);
    setReason('');
    form.setFieldsValue({
      ingredient_id: undefined,
      quantity: null,
      reason: ''
    });
  };
  
  // Handle remove item
  const handleRemoveItem = (key: string) => {
    setExportItems(exportItems.filter(item => item.key !== key));
  };
  
  // Handle submit
  const handleSubmit = (values: any) => {
    if (exportItems.length === 0) {
      message.error('Vui lòng thêm ít nhất một nguyên liệu vào phiếu xuất');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form values:', {
        ...values,
        items: exportItems,
        total_amount: totalAmount,
        created_at: dayjs().format()
      });
      
      message.success('Tạo phiếu xuất kho thành công!');
      navigate('/admin/warehouse/export');
      setIsLoading(false);
    }, 1000);
  };
  
  // Export items table columns
  const columns: ColumnsType<ExportItem> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
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
      width: 80,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity: number, record) => (
        <span>
          {quantity} / {record.available_quantity}
        </span>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 120,
      render: (price: number) => `${price.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total_price',
      key: 'total_price',
      width: 150,
      render: (price: number) => (
        <span className="font-semibold text-orange-600">
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
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Xóa nguyên liệu"
          description="Bạn có chắc chắn muốn xóa nguyên liệu này?"
          onConfirm={() => handleRemoveItem(record.key)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  if (isLoading) {
    return <PageLoader text="Đang xử lý..." />;
  }
  
  return (
    <div className="p-4">
      <Card className="shadow-sm mb-4">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item href="/admin">Dashboard</Breadcrumb.Item>
          <Breadcrumb.Item href="/admin/warehouse/ingredient">Quản lý kho</Breadcrumb.Item>
          <Breadcrumb.Item href="/admin/warehouse/export">Lịch sử xuất kho</Breadcrumb.Item>
          <Breadcrumb.Item>Tạo phiếu xuất kho</Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="m-0">Tạo phiếu xuất kho mới</Title>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/warehouse/export')}
          >
            Quay lại
          </Button>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            export_date: dayjs(),
            export_type: 'production'
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="export_date"
                label="Ngày xuất kho"
                rules={[{ required: true, message: 'Vui lòng chọn ngày xuất kho' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY"
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="export_type"
                label="Loại xuất kho"
                rules={[{ required: true, message: 'Vui lòng chọn loại xuất kho' }]}
              >
                <Select>
                  <Option value="production">Sản xuất</Option>
                  <Option value="damage">Hàng hỏng</Option>
                  <Option value="transfer">Chuyển kho</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="staff_name"
                label="Người lập phiếu"
                rules={[{ required: true, message: 'Vui lòng nhập tên người lập phiếu' }]}
              >
                <Input placeholder="Nhập tên người lập phiếu" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider>Thông tin nguyên liệu</Divider>
          
          <Row gutter={16} className="mb-4">
            <Col xs={24} md={6}>
              <Form.Item
                name="ingredient_id"
                label="Chọn nguyên liệu"
              >
                <Select
                  showSearch
                  placeholder="Chọn nguyên liệu"
                  optionFilterProp="children"
                  onChange={(value) => setSelectedIngredientId(value)}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={mockIngredients.map(item => ({
                    value: item.id,
                    label: `${item.name} (${item.current_quantity} ${item.unit})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="quantity"
                label="Số lượng"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="Nhập số lượng"
                  onChange={(value) => setQuantity(value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="reason"
                label="Lý do xuất kho"
              >
                <Input 
                  placeholder="Nhập lý do xuất kho"
                  onChange={(e) => setReason(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4} className="flex items-end">
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddItem}
                style={{ marginBottom: 24 }}
                block
              >
                Thêm nguyên liệu
              </Button>
            </Col>
          </Row>
          
          <Table
            columns={columns}
            dataSource={exportItems}
            pagination={false}
            bordered
            size="small"
            className="mb-4"
            summary={() => (
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
                  <Table.Summary.Cell index={2} colSpan={2}></Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
          
          <Divider />
          
          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <TextArea 
              rows={3} 
              placeholder="Nhập ghi chú cho phiếu xuất kho (nếu có)"
            />
          </Form.Item>
          
          <div className="flex justify-end">
            <Space>
              <Button onClick={() => navigate('/admin/warehouse/export')}>
                Hủy
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                disabled={exportItems.length === 0}
              >
                Lưu phiếu xuất
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
      
      <Card className="shadow-sm">
        <div className="flex items-center">
          <InfoCircleOutlined className="text-blue-500 mr-2" />
          <Title level={5} className="m-0">Lưu ý khi tạo phiếu xuất kho</Title>
        </div>
        <ul className="mt-4 pl-5">
          <li className="mb-2">Số lượng xuất không được vượt quá số lượng hiện có trong kho.</li>
          <li className="mb-2">Cần ghi rõ lý do xuất kho cho từng nguyên liệu.</li>
          <li className="mb-2">Kiểm tra kỹ thông tin trước khi lưu phiếu xuất kho.</li>
          <li>Phiếu xuất kho sau khi lưu không thể chỉnh sửa.</li>
        </ul>
      </Card>
    </div>
  );
};

export default NewExportWarehouse; 