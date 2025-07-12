import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  DatePicker,
  Select,
  Table,
  InputNumber,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  message,
  Breadcrumb,
  Spin
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  RollbackOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import { CanAccess, useCreate, useList } from '@refinedev/core';
import type { ColumnsType } from 'antd/es/table';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';
import { NoPermission } from '@/components/NoPermission';

const { Title, Text } = Typography;
const { Option } = Select;

// Define interfaces based on the backend API
interface Ingredient {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  created_at: string;
  updated_at: string;
}

interface ImportItem {
  key: string;
  ingredient_id: number;
  ingredient_name?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  supplier_name: string;
}

interface ImportFormValues {
  note?: string;
  total_amount: number;
  details: {
    ingredient_id: number;
    quantity: number;
    unit_price: number;
    supplier_name: string;
  }[];
}

const NewImportWarehouse: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ImportItem[]>([]);
  
  // Get current user
  const currentUser = use$(auth$.user);
  
  // Fetch ingredients from API
  const { data: ingredientsData, isLoading: ingredientsLoading } = useList<Ingredient>({
    resource: 'ingredients',
    pagination: { mode: 'off' }
  });
  
  const { mutate: createEnterIngredient, isLoading: isCreating } = useCreate();
  
  const ingredients = ingredientsData?.data || [];
  
  // Calculate total price for all items
  const totalPrice = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  
  // Add a new empty item
  const addItem = () => {
    const newItem: ImportItem = {
      key: Date.now().toString(),
      ingredient_id: 0,
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      supplier_name: ''
    };
    setItems([...items, newItem]);
  };
  
  // Remove an item by key
  const removeItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };
  
  // Update an item property
  const updateItem = (key: string, field: keyof ImportItem, value: string | number) => {
    const newItems = items.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };
        
        // Update the ingredient details if ingredient_id changes
        if (field === 'ingredient_id') {
          const selectedIngredient = ingredients.find(ing => ing.id === value);
          if (selectedIngredient) {
            updatedItem.ingredient_name = selectedIngredient.name;
            updatedItem.unit = selectedIngredient.unit;
          }
        }
        
        // Recalculate total price if quantity or unit price changes
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setItems(newItems);
  };
  
  // Submit the import form
  const handleSubmit = async (values: { note?: string }) => {
    if (items.length === 0) {
      message.error('Vui lòng thêm ít nhất một nguyên liệu');
      return;
    }
    
    // Validate items
    const invalidItems = items.filter(item => 
      !item.ingredient_id || 
      item.quantity <= 0 || 
      item.unit_price <= 0 || 
      !item.supplier_name.trim()
    );
    
    if (invalidItems.length > 0) {
      message.error('Vui lòng điền đầy đủ thông tin cho tất cả nguyên liệu');
      return;
    }
    
    try {
      const submitData: ImportFormValues = {
        total_amount: Math.round(totalPrice), // Convert to integer as required by backend
        note: values.note,
        details: items.map(item => ({
          ingredient_id: item.ingredient_id,
          quantity: Math.round(item.quantity), // Convert to integer
          unit_price: Math.round(item.unit_price), // Convert to integer
          supplier_name: item.supplier_name.trim()
        }))
      };
      
      await createEnterIngredient({
        resource: 'enter-ingredients',
        values: submitData,
      });
      navigate('/admin/warehouse/import');
    } catch (error: unknown) {
      console.error('Error creating import:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo phiếu nhập kho';
      message.error(errorMessage);
    }
  };
  
  // Table columns for import items
  const columns: ColumnsType<ImportItem> = [
    {
      title: 'STT',
      key: 'index',
      width: '60px',
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Tên nguyên liệu',
      key: 'ingredient',
      render: (_, record) => (
        <Select
          placeholder="Chọn nguyên liệu"
          style={{ width: '100%', minWidth: '200px' }}
          value={record.ingredient_id || undefined}
          onChange={(value) => updateItem(record.key, 'ingredient_id', value)}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
          }
        >
          {ingredients.map(ing => (
            <Option key={ing.id} value={ing.id}>
              {ing.name} ({ing.unit})
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Nhà cung cấp',
      key: 'supplier_name',
      render: (_, record) => (
        <Input
          placeholder="Tên nhà cung cấp"
          style={{ width: '100%', minWidth: '180px' }}
          value={record.supplier_name}
          onChange={(e) => updateItem(record.key, 'supplier_name', e.target.value)}
        />
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: '80px',
      render: (text) => <span className="text-gray-600">{text || '-'}</span>,
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      width: '120px',
      render: (_, record) => (
        <InputNumber
          min={0.1}
          step={0.1}
          style={{ width: '100%' }}
          value={record.quantity}
          onChange={(value) => updateItem(record.key, 'quantity', value || 0)}
          placeholder="0"
        />
      ),
    },
    {
      title: 'Đơn giá (VNĐ)',
      key: 'unit_price',
      width: '150px',
      render: (_, record) => (
        <InputNumber
          min={0}
          step={1000}
          style={{ width: '100%' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, ''))}
          value={record.unit_price || 0}
          onChange={(value) => updateItem(record.key, 'unit_price', value || 0)}
          placeholder="0"
        />
      ),
    },
    {
      title: 'Thành tiền (VNĐ)',
      key: 'total_price',
      width: '150px',
      render: (_, record) => (
        <span className="font-semibold text-orange-600">
          {record.total_price.toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: '50px',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeItem(record.key)}
          disabled={items.length === 1}
        />
      ),
    },
  ];
  
  // Initialize with one empty item
  useEffect(() => {
    if (items.length === 0) {
      addItem();
    }
  }, []);
  
  return (
    <CanAccess resource='enter-ingredient' action='create' fallback={<NoPermission />}>
      <div className="p-6">
      <Card className="shadow-sm">
        
        <Title level={3} className="mb-6 flex items-center">
          <ShoppingCartOutlined className="mr-3 text-orange-500" />
          Tạo phiếu nhập kho
        </Title>
        
        <Spin spinning={ingredientsLoading || isCreating}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-4"
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label={
                  <span className="flex items-center">
                    <UserOutlined className="mr-2" />
                    Người tạo phiếu
                  </span>
                }>
                  <Input 
                    value={currentUser?.name || 'N/A'} 
                    disabled 
                    className="bg-gray-50"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item label={
                  <span className="flex items-center">
                    <CalendarOutlined className="mr-2" />
                    Thời gian tạo
                  </span>
                }>
                  <Input 
                    value={dayjs().format('DD/MM/YYYY HH:mm')} 
                    disabled 
                    className="bg-gray-50"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item 
              name="note" 
              label={
                <span className="flex items-center">
                  <FileTextOutlined className="mr-2" />
                  Ghi chú (tùy chọn)
                </span>
              }
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Nhập ghi chú cho phiếu nhập kho..."
                maxLength={255}
                showCount
              />
            </Form.Item>
            
            <Divider orientation="left" className="text-lg font-semibold">
              Chi tiết nhập kho
            </Divider>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <Table
                columns={columns}
                dataSource={items}
                pagination={false}
                rowKey="key"
                className="mb-4"
                scroll={{ x: 1000 }}
                bordered
                size="middle"
              />
              
              <div className="flex justify-between items-center mt-4">
                <Button 
                  type="dashed" 
                  icon={<PlusOutlined />} 
                  onClick={addItem}
                  className="border-orange-300 text-orange-600 hover:border-orange-500 hover:text-orange-700"
                >
                  Thêm nguyên liệu
                </Button>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    Tổng tiền: {totalPrice.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t">
              <Space size="middle">
                <Button 
                  icon={<RollbackOutlined />} 
                  onClick={() => navigate('/admin/warehouse')}
                  size="large"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  htmlType="submit"
                  loading={isCreating}
                  size="large"
                >
                  Tạo phiếu nhập
                </Button>
              </Space>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
    </CanAccess>
  );
};

export default NewImportWarehouse;
