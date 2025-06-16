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
import { useCreate, useList } from '@refinedev/core';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

// Define interfaces based on the database diagram
interface Ingredient {
  id: number;
  name: string;
  unit: string;
  created_at: string;
  updated_at: string;
}

interface Supplier {
  id: number;
  name: string;
  contact: string;
  address: string;
  phone: string;
}

interface ImportItem {
  key: string;
  ingredient_id: number;
  ingredient_name?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  supplier_id?: number;
  supplier_name?: string;
}

interface ImportFormValues {
  note: string;
  created_at: string;
  items: ImportItem[];
}

// Mock data function for development
const generateMockIngredients = (): Ingredient[] => {
  const ingredients = [
    { id: 1, name: 'Gạo', unit: 'kg', created_at: '2023-06-10T08:00:00', updated_at: '2023-06-10T08:00:00' },
    { id: 2, name: 'Thịt bò', unit: 'kg', created_at: '2023-06-11T09:15:00', updated_at: '2023-06-11T09:15:00' },
    { id: 3, name: 'Cà chua', unit: 'kg', created_at: '2023-06-12T10:30:00', updated_at: '2023-06-12T10:30:00' },
    { id: 4, name: 'Hành tây', unit: 'kg', created_at: '2023-06-13T11:45:00', updated_at: '2023-06-13T11:45:00' },
    { id: 5, name: 'Ớt', unit: 'kg', created_at: '2023-06-14T13:00:00', updated_at: '2023-06-14T13:00:00' },
    { id: 6, name: 'Tỏi', unit: 'kg', created_at: '2023-06-15T14:15:00', updated_at: '2023-06-15T14:15:00' },
    { id: 7, name: 'Bột mỳ', unit: 'kg', created_at: '2023-06-16T15:30:00', updated_at: '2023-06-16T15:30:00' },
    { id: 8, name: 'Trứng', unit: 'quả', created_at: '2023-06-17T16:45:00', updated_at: '2023-06-17T16:45:00' },
    { id: 9, name: 'Sữa', unit: 'lít', created_at: '2023-06-18T17:00:00', updated_at: '2023-06-18T17:00:00' },
    { id: 10, name: 'Dầu ăn', unit: 'lít', created_at: '2023-06-19T18:15:00', updated_at: '2023-06-19T18:15:00' },
  ];
  return ingredients;
};

const generateMockSuppliers = (): Supplier[] => {
  return [
    { id: 1, name: 'Công ty TNHH Thực phẩm Hải Châu', contact: 'Nguyễn Văn A', address: '123 Đường A, Quận 1, TP.HCM', phone: '0901234567' },
    { id: 2, name: 'Công ty CP Thực phẩm sạch Việt Nam', contact: 'Trần Thị B', address: '456 Đường B, Quận 2, TP.HCM', phone: '0912345678' },
    { id: 3, name: 'Nhà cung cấp Thực phẩm XYZ', contact: 'Lê Văn C', address: '789 Đường C, Quận 3, TP.HCM', phone: '0923456789' }
  ];
};

const NewImportWarehouse: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ImportItem[]>([]);
  
  // In a real application, this would be fetched from the API
  const ingredients = generateMockIngredients();
  const suppliers = generateMockSuppliers();
  
  // Calculate total price for all items
  const totalPrice = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  
  // Add a new empty item
  const addItem = () => {
    const newItem: ImportItem = {
      key: Date.now().toString(), // Unique key for the row
      ingredient_id: 0,
      quantity: 1,
      unit_price: 0,
      total_price: 0
    };
    setItems([...items, newItem]);
  };
  
  // Remove an item by key
  const removeItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };
  
  // Update an item property
  const updateItem = (key: string, field: keyof ImportItem, value: any) => {
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
        
        // Update the supplier name if supplier_id changes
        if (field === 'supplier_id') {
          const selectedSupplier = suppliers.find(sup => sup.id === value);
          if (selectedSupplier) {
            updatedItem.supplier_name = selectedSupplier.name;
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
  const handleSubmit = async (values: ImportFormValues) => {
    if (items.length === 0) {
      message.error('Vui lòng thêm ít nhất một nguyên liệu');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, you would save this data to the server
      // await createImport({
      //   resource: 'import-warehouse',
      //   values: {
      //     note: values.note,
      //     created_at: values.created_at,
      //     total_amount: totalPrice,
      //     items: items.map(item => ({
      //       ingredient_id: item.ingredient_id,
      //       quantity: item.quantity,
      //       unit_price: item.unit_price,
      //       supplier_id: item.supplier_id
      //     }))
      //   },
      // });
      
      // Show success message
      message.success('Nhập kho thành công');
      
      // Redirect to ingredient management
      navigate('/admin/warehouse/ingredient');
    } catch (error) {
      console.error('Error submitting import form:', error);
      message.error('Có lỗi xảy ra khi lưu phiếu nhập kho');
    } finally {
      setLoading(false);
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
      title: 'Tên hàng',
      key: 'ingredient',
      render: (_, record) => (
        <Select
          placeholder="--Nguyên liệu--"
          style={{ width: '100%' }}
          value={record.ingredient_id || undefined}
          onChange={(value) => updateItem(record.key, 'ingredient_id', value)}
        >
          {ingredients.map(ing => (
            <Option key={ing.id} value={ing.id}>{ing.name}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Nhà cung cấp',
      key: 'supplier',
      render: (_, record) => (
        <Select
          placeholder="--Nhà cung cấp--"
          style={{ width: '100%' }}
          value={record.supplier_id || undefined}
          onChange={(value) => updateItem(record.key, 'supplier_id', value)}
        >
          {suppliers.map(sup => (
            <Option key={sup.id} value={sup.id}>{sup.name}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
      key: 'unit',
      width: '100px',
      render: (text) => text || '-',
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
          onChange={(value) => updateItem(record.key, 'quantity', value)}
        />
      ),
    },
    {
      title: 'Đơn giá',
      key: 'unit_price',
      width: '150px',
      render: (_, record) => (
        <InputNumber
          min={0}
          style={{ width: '100%' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, ''))}
          value={record.unit_price || 0}
          onChange={(value) => updateItem(record.key, 'unit_price', value || 0)}
          addonAfter="VNĐ"
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total_price',
      width: '150px',
      render: (_, record) => (
        <span className="font-semibold">
          {record.total_price.toLocaleString('vi-VN')} VNĐ
        </span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: '70px',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeItem(record.key)}
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
    <div className="p-4">
      <Card className="shadow-sm mb-4">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item href="/admin">Dashboard</Breadcrumb.Item>
          <Breadcrumb.Item href="/admin/warehouse/ingredient">Quản lý kho</Breadcrumb.Item>
          <Breadcrumb.Item>Thêm phiếu nhập</Breadcrumb.Item>
        </Breadcrumb>
        
        <Title level={4} className="mb-4">
          <ShoppingCartOutlined className="mr-2" />
          Thêm phiếu nhập
        </Title>
        
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              created_at: dayjs(),
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label={<span><UserOutlined /> Người lập phiếu</span>}>
                  <Input value="Võ Thanh Hiếu" disabled />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item 
                  name="created_at" 
                  label={<span><CalendarOutlined /> Thời gian lập</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn ngày lập' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    format="DD/MM/YYYY HH:mm"
                    showTime={{ format: 'HH:mm' }}
                    placeholder="dd/mm/yyyy --:--"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item 
              name="note" 
              label={<span><FileTextOutlined /> Nội dung</span>}
            >
              <Input.TextArea rows={4} placeholder="Nhập nội dung phiếu nhập (nếu có)" />
            </Form.Item>
            
            <Divider orientation="left">Dữ liệu nhập hàng</Divider>
            
            <Table
              columns={columns}
              dataSource={items}
              pagination={false}
              rowKey="key"
              className="mb-4"
              footer={() => (
                <div className="flex justify-between items-center">
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />} 
                    onClick={addItem}
                  >
                    Thêm hàng
                  </Button>
                  <div className="text-right font-bold text-lg">
                    Tổng tiền: {totalPrice.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              )}
            />
            
            <div className="flex justify-end mt-4">
              <Space>
                <Button 
                  icon={<RollbackOutlined />} 
                  onClick={() => navigate('/admin/warehouse/ingredient')}
                >
                  Trở về
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  htmlType="submit"
                >
                  Lưu phiếu nhập
                </Button>
              </Space>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default NewImportWarehouse;
