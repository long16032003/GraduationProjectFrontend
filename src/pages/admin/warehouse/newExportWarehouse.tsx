import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  InputNumber,
  Table,
  Space,
  Typography,
  Breadcrumb,
  Row,
  Col,
  Divider,
  message,
  Popconfirm,
  Spin
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import type { ColumnsType } from 'antd/es/table';
import { CanAccess, useCreate, useList } from '@refinedev/core';
import auth$ from '@/stores/auth';
import { NoPermission } from '@/components/NoPermission';

const { Title } = Typography;
const { TextArea } = Input;

// Interface definitions matching backend structure
interface Ingredient {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  creator_id: number;
  image_id?: number;
  created_at: string;
  updated_at: string;
}

interface ExportItem {
  key: string;
  ingredient_id: number;
  ingredient_name: string;
  unit: string;
  quantity: number;
  available_quantity: number;
}

interface ExportFormValues {
  note?: string;
  details: Array<{
    ingredient_id: number;
    quantity: number;
  }>;
}

const NewExportWarehouse: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [exportItems, setExportItems] = useState<ExportItem[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  
  // Get current user
  const currentUser = auth$.user.get();

  // API hooks
  const { data: ingredients, isLoading: isLoadingIngredients } = useList<Ingredient>({
    resource: 'ingredients',
  });

  const { mutate: createExportIngredient, isLoading: isCreating } = useCreate();
  
  // Handle add item
  const handleAddItem = () => {
    if (!selectedIngredientId || !quantity || quantity <= 0) {
      message.error('Vui lòng chọn nguyên liệu và nhập số lượng hợp lệ');
      return;
    }
    
    const selectedIngredient = ingredients?.data.find(i => i.id === selectedIngredientId);
    
    if (!selectedIngredient) {
      message.error('Nguyên liệu không hợp lệ');
      return;
    }
    
    if (quantity > selectedIngredient.quantity) {
      message.error(`Số lượng xuất không được vượt quá số lượng hiện có (${selectedIngredient.quantity} ${selectedIngredient.unit})`);
      return;
    }
    
    const existingItemIndex = exportItems.findIndex(item => item.ingredient_id === selectedIngredientId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...exportItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > selectedIngredient.quantity) {
        message.error(`Tổng số lượng xuất không được vượt quá số lượng hiện có (${selectedIngredient.quantity} ${selectedIngredient.unit})`);
        return;
      }
      
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
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
        available_quantity: selectedIngredient.quantity,
      };
      
      setExportItems([...exportItems, newItem]);
    }
    
    // Reset selection
    setSelectedIngredientId(null);
    setQuantity(null);
    form.setFieldsValue({
      ingredient_id: undefined,
      quantity: null,
    });
  };
  
  // Handle remove item
  const handleRemoveItem = (key: string) => {
    setExportItems(exportItems.filter(item => item.key !== key));
  };
  
  // Handle submit
  const handleSubmit = (values: ExportFormValues) => {
    if (exportItems.length === 0) {
      message.error('Vui lòng thêm ít nhất một nguyên liệu vào phiếu xuất');
      return;
    }
    
    const exportData = {
      note: values.note || null,
      details: exportItems.map(item => ({
        ingredient_id: item.ingredient_id,
        quantity: item.quantity
      }))
    };

    createExportIngredient(
      {
        resource: 'export-ingredients',
        values: exportData,
      },
      {
        onSuccess: () => {
          message.success('Tạo phiếu xuất kho thành công!');
          navigate('/admin/warehouse');
        },
        onError: (error) => {
          console.error('Export error:', error);
          message.error('Có lỗi xảy ra khi tạo phiếu xuất kho');
        },
      }
    );
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
      title: 'Số lượng xuất',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity: number, record) => (
        <span className="font-medium">
          {quantity} / {record.available_quantity}
        </span>
      ),
    },
    {
      title: 'Còn lại',
      key: 'remaining',
      width: 100,
      render: (_, record) => (
        <span className={`font-medium ${(record.available_quantity - record.quantity) <= 0 ? 'text-red-600' : 'text-green-600'}`}>
          {record.available_quantity - record.quantity} {record.unit}
        </span>
      ),
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

  if (isLoadingIngredients) {
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
              title: <a href="/admin/warehouse/export">Lịch sử xuất kho</a>,
            },
            {
              title: 'Tạo phiếu xuất kho',
            },
          ]}
        />
        
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="m-0">Tạo phiếu xuất kho mới</Title>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/warehouse')}
          >
            Quay lại
          </Button>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16} className="mb-4">
            <Col xs={24} md={8}>
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
                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                  options={ingredients?.data.map(item => ({
                    value: item.id,
                    label: `${item.name} (Còn: ${item.quantity} ${item.unit})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="quantity"
                label="Số lượng xuất"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="Nhập số lượng"
                  onChange={(value) => setQuantity(value)}
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
                disabled={!selectedIngredientId || !quantity}
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
            locale={{ emptyText: 'Chưa có nguyên liệu nào được thêm' }}
            summary={() => 
              exportItems.length > 0 ? (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <strong>Tổng số loại nguyên liệu: {exportItems.length}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} colSpan={3}>
                      <strong>Tổng số lượng: {exportItems.reduce((sum, item) => sum + item.quantity, 0)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              ) : null
            }
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
              <Button onClick={() => navigate('/admin/warehouse')}>
                Hủy
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                disabled={exportItems.length === 0}
                loading={isCreating}
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
        <ul className="mt-4 pl-5 space-y-2">
          <li>• Số lượng xuất không được vượt quá số lượng hiện có trong kho</li>
          <li>• Kiểm tra kỹ thông tin trước khi lưu phiếu xuất kho</li>
          <li>• Phiếu xuất kho sau khi lưu sẽ tự động trừ số lượng tồn kho</li>
          <li>• Ghi chú giúp theo dõi mục đích sử dụng nguyên liệu</li>
        </ul>
      </Card>
    </div>
    </CanAccess>
  );
};

export default NewExportWarehouse; 