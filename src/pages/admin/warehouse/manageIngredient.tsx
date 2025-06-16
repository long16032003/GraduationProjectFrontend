import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  Input,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Tag,
  Tooltip,
  Typography,
  Row,
  Col,
  Statistic,
  Divider,
  Badge,
  Tabs,
  Alert
} from 'antd';
import {
  PlusOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  FilterOutlined,
  ImportOutlined,
  ExportOutlined,
  WarningOutlined,
  SyncOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import type { TableProps, ColumnsType } from 'antd/es/table';
import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';

// Define interfaces based on the database diagram
interface Ingredient {
  id: number;
  name: string;
  unit: string;
  created_at: string;
  updated_at: string;
}

interface Inventory {
  id: number;
  ingredient_id: number;
  warehouse_id: number;
  quantity: number;
  min_quantity: number;
  ingredient?: Ingredient;
  warehouse?: Warehouse;
}

interface Warehouse {
  id: number;
  name: string;
  address: string;
}

interface EnterIngredient {
  id: number;
  staff_id: number;
  create_at: string;
  total_amount: number;
  note?: string;
  details: EnterIngredientDetail[];
}

interface EnterIngredientDetail {
  id: number;
  enter_ingredient_id: number;
  ingredient_id: number;
  quantity: number;
  unit_price: number;
  supplier_name: string;
  ingredient?: Ingredient;
}

interface ExportIngredient {
  id: number;
  staff_id: number;
  note?: string;
  create_at: string;
  details: ExportIngredientDetail[];
}

interface ExportIngredientDetail {
  id: number;
  export_ingredient_id: number;
  ingredient_id: number;
  quantity: number;
  ingredient?: Ingredient;
}

// Form interfaces
interface IngredientFormValues {
  name: string;
  unit: string;
}

interface InventoryFormValues {
  ingredient_id: number;
  warehouse_id: number;
  quantity: number;
  min_quantity: number;
}

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Mock data function - would be replaced with actual API calls
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

const generateMockWarehouses = (): Warehouse[] => {
  return [
    { id: 1, name: 'Kho chính', address: '123 Đường A, Quận 1, TP.HCM' },
    { id: 2, name: 'Kho phụ', address: '456 Đường B, Quận 2, TP.HCM' }
  ];
};

const generateMockInventory = (): Inventory[] => {
  const ingredients = generateMockIngredients();
  const warehouses = generateMockWarehouses();

  return ingredients.map((ingredient, index) => ({
    id: index + 1,
    ingredient_id: ingredient.id,
    warehouse_id: Math.random() > 0.5 ? 1 : 2,
    quantity: Math.floor(Math.random() * 100) + 10,
    min_quantity: 20,
    ingredient,
    warehouse: warehouses[Math.random() > 0.5 ? 0 : 1]
  }));
};

const ManageIngredient: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  // State variables
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [searchText, setSearchText] = useState<string>('');
  const [isIngredientModalVisible, setIsIngredientModalVisible] = useState<boolean>(false);
  const [isInventoryModalVisible, setIsInventoryModalVisible] = useState<boolean>(false);
  const [isStockCheckModalVisible, setIsStockCheckModalVisible] = useState<boolean>(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);

  // Mock data for development
  const ingredients = generateMockIngredients();
  const warehouses = generateMockWarehouses();
  const inventory = generateMockInventory();

  // Filtered inventory based on search
  const filteredInventory = inventory.filter(item => 
    item.ingredient?.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.warehouse?.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Low stock items
  const lowStockItems = inventory.filter(item => item.quantity <= item.min_quantity);

  // Columns for the inventory table
  const inventoryColumns: ColumnsType<Inventory> = [
    {
      title: 'Tên nguyên liệu',
      dataIndex: ['ingredient', 'name'],
      key: 'ingredient_name',
      sorter: (a: Inventory, b: Inventory) => 
        (a.ingredient?.name || '').localeCompare(b.ingredient?.name || ''),
    },
    {
      title: 'Đơn vị',
      dataIndex: ['ingredient', 'unit'],
      key: 'unit',
      width: '10%',
    },
    {
      title: 'Kho',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      width: '15%',
      filters: warehouses.map(warehouse => ({ text: warehouse.name, value: warehouse.id.toString() })),
      onFilter: (value, record: Inventory) => 
        record.warehouse_id.toString() === value.toString(),
    },
    {
      title: 'Số lượng hiện tại',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '15%',
      sorter: (a: Inventory, b: Inventory) => a.quantity - b.quantity,
      render: (quantity: number, record: Inventory) => (
        <span className={quantity <= record.min_quantity ? 'text-red-500 font-bold' : ''}>
          {quantity} {record.ingredient?.unit}
          {quantity <= record.min_quantity && (
            <Tooltip title="Dưới mức tồn kho tối thiểu">
              <WarningOutlined className="ml-2 text-red-500" />
            </Tooltip>
          )}
        </span>
      ),
    },
    {
      title: 'Tồn kho tối thiểu',
      dataIndex: 'min_quantity',
      key: 'min_quantity',
      width: '15%',
      render: (min: number, record: Inventory) => `${min} ${record.ingredient?.unit}`,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: '15%',
      render: (_: unknown, record: Inventory) => (
        <Tag color={record.quantity <= record.min_quantity ? 'error' : 'success'}>
          {record.quantity <= record.min_quantity ? 'Cần nhập thêm' : 'Đủ hàng'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_: unknown, record: Inventory) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditInventory(record)}
            className="text-blue-500 hover:text-blue-600"
            title="Cập nhật thông tin tồn kho"
          />
          <Button 
            type="text" 
            icon={<ImportOutlined />} 
            onClick={() => navigate('/admin/warehouse/import')}
            className="text-green-500 hover:text-green-600"
            title="Đi tới trang nhập kho"
          />
          <Button 
            type="text" 
            icon={<ExportOutlined />} 
            onClick={() => navigate('/admin/warehouse/export')}
            className="text-orange-500 hover:text-orange-600"
            title="Đi tới trang xuất kho"
          />
        </Space>
      ),
    },
  ];

  // Columns for the ingredients table
  const ingredientColumns: ColumnsType<Ingredient> = [
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Ingredient, b: Ingredient) => a.name.localeCompare(b.name),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: '15%',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '20%',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a: Ingredient, b: Ingredient) => 
        dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_: unknown, record: Ingredient) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditIngredient(record)}
            className="text-blue-500 hover:text-blue-600"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
          />
        </Space>
      ),
    },
  ];

  // Event handlers
  const handleAddIngredient = () => {
    setEditingIngredient(null);
    form.resetFields();
    setIsIngredientModalVisible(true);
  };

  const handleEditIngredient = (record: Ingredient) => {
    setEditingIngredient(record);
    form.setFieldsValue({
      name: record.name,
      unit: record.unit,
    });
    setIsIngredientModalVisible(true);
  };

  const handleSaveIngredient = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingIngredient) {
        // Update existing ingredient
        // useUpdate would be called here in a real application
        message.success('Nguyên liệu đã được cập nhật thành công');
      } else {
        // Create new ingredient
        // useCreate would be called here in a real application
        message.success('Nguyên liệu đã được tạo thành công');
      }
      
      setIsIngredientModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const showDeleteConfirm = (record: Ingredient) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa nguyên liệu "${record.name}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        // useDelete would be called here in a real application
        message.success(`Đã xóa nguyên liệu "${record.name}"`);
      },
    });
  };

  const handleEditInventory = (record: Inventory) => {
    setEditingInventory(record);
    form.setFieldsValue({
      ingredient_id: record.ingredient_id,
      warehouse_id: record.warehouse_id,
      quantity: record.quantity,
      min_quantity: record.min_quantity,
    });
    setIsInventoryModalVisible(true);
  };

  const handleSaveInventory = async () => {
    try {
      const values = await form.validateFields();
      
      // Update inventory
      // useUpdate would be called here in a real application
      message.success('Thông tin tồn kho đã được cập nhật thành công');
      
      setIsInventoryModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const handleSaveStockCheck = async () => {
    try {
      const values = await form.validateFields();
      
      // Save stock check results
      // useCreate would be called here in a real application
      message.success('Đã lưu kết quả kiểm kho thành công');
      
      setIsStockCheckModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card className="shadow-sm">
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col>
            <Title level={4} className="m-0">Quản lý nguyên liệu</Title>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Tìm kiếm nguyên liệu"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-64"
              />
              {activeTab === 'ingredients' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddIngredient}
                >
                  Thêm nguyên liệu
                </Button>
              )}
              {activeTab === 'inventory' && (
                <>
                  <Button
                    icon={<ImportOutlined />}
                    type="primary"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => navigate('/admin/warehouse/import')}
                  >
                    Nhập kho
                  </Button>
                  <Button
                    icon={<ExportOutlined />}
                    type="primary"
                    danger
                    onClick={() => navigate('/admin/warehouse/export')}
                  >
                    Xuất kho
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng nguyên liệu"
              value={ingredients.length}
              prefix={<InfoCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng kho"
              value={warehouses.length}
              prefix={<InfoCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Cần nhập thêm"
              value={lowStockItems.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: lowStockItems.length > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Giá trị tồn kho"
              value={10000000} // This would be calculated from actual data
              prefix="₫"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert
          message="Cảnh báo tồn kho thấp"
          description={`Có ${lowStockItems.length} nguyên liệu dưới mức tồn kho tối thiểu, cần nhập thêm.`}
          type="warning"
          showIcon
          className="mb-4"
          action={
            <Button size="small" danger>
              Xem chi tiết
            </Button>
          }
        />
      )}

      {/* Main Tabs */}
      <Card className="shadow-sm flex-1">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
        >
          <TabPane 
            tab={<span><InfoCircleOutlined /> Tồn kho</span>} 
            key="inventory"
          >
            <Table
              columns={inventoryColumns}
              dataSource={filteredInventory}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              loading={false} // Set to true when loading data from API
              bordered
              scroll={{ x: 800 }}
              summary={pageData => {
                let totalQuantity = 0;
                
                pageData.forEach(item => {
                  totalQuantity += item.quantity;
                });
                
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <strong>Tổng cộng</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{totalQuantity}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} colSpan={3}></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </TabPane>
          <TabPane 
            tab={<span><InfoCircleOutlined /> Danh sách nguyên liệu</span>} 
            key="ingredients"
          >
            <Table
              columns={ingredientColumns}
              dataSource={ingredients.filter(item => 
                item.name.toLowerCase().includes(searchText.toLowerCase())
              )}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              loading={false} // Set to true when loading data from API
              bordered
            />
          </TabPane>
          <TabPane 
            tab={<span><InfoCircleOutlined /> Kiểm kho</span>} 
            key="stock-check"
          >
            <div className="p-4">
              <Alert
                message="Chức năng kiểm kho"
                description="Kiểm kho giúp bạn đối chiếu số lượng thực tế của nguyên liệu trong kho với số lượng được ghi nhận trên hệ thống. Các sai lệch sẽ được ghi nhận và điều chỉnh."
                type="info"
                showIcon
                className="mb-4"
              />
              
              <Table
                columns={[
                  {
                    title: 'Tên nguyên liệu',
                    dataIndex: ['ingredient', 'name'],
                    key: 'ingredient_name',
                  },
                  {
                    title: 'Đơn vị',
                    dataIndex: ['ingredient', 'unit'],
                    key: 'unit',
                    width: '10%',
                  },
                  {
                    title: 'Kho',
                    dataIndex: ['warehouse', 'name'],
                    key: 'warehouse',
                    width: '15%',
                  },
                  {
                    title: 'Số lượng hệ thống',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    width: '15%',
                    render: (quantity: number, record: Inventory) => (
                      <span>{quantity} {record.ingredient?.unit}</span>
                    ),
                  },
                  {
                    title: 'Số lượng thực tế',
                    key: 'actual_quantity',
                    width: '20%',
                    render: (_, record: Inventory) => (
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        defaultValue={record.quantity}
                        addonAfter={record.ingredient?.unit}
                      />
                    ),
                  },
                  {
                    title: 'Chênh lệch',
                    key: 'difference',
                    width: '15%',
                    render: () => (
                      <span>0</span>
                    ),
                  },
                ]}
                dataSource={filteredInventory}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                bordered
                footer={() => (
                  <div className="text-right">
                    <Button type="primary" icon={<SaveOutlined />}>
                      Lưu kiểm kho
                    </Button>
                  </div>
                )}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Ingredient Modal */}
      <Modal
        title={editingIngredient ? "Cập nhật nguyên liệu" : "Thêm nguyên liệu mới"}
        open={isIngredientModalVisible}
        onOk={handleSaveIngredient}
        onCancel={() => setIsIngredientModalVisible(false)}
        okText={editingIngredient ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên nguyên liệu"
            rules={[{ required: true, message: 'Vui lòng nhập tên nguyên liệu' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="unit"
            label="Đơn vị"
            rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
          >
            <Select>
              <Select.Option value="kg">Kilogram (kg)</Select.Option>
              <Select.Option value="g">Gram (g)</Select.Option>
              <Select.Option value="l">Lít (l)</Select.Option>
              <Select.Option value="ml">Mililít (ml)</Select.Option>
              <Select.Option value="quả">Quả</Select.Option>
              <Select.Option value="cái">Cái</Select.Option>
              <Select.Option value="thùng">Thùng</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Inventory Modal */}
      <Modal
        title="Cập nhật thông tin tồn kho"
        open={isInventoryModalVisible}
        onOk={handleSaveInventory}
        onCancel={() => setIsInventoryModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="ingredient_id"
            label="Nguyên liệu"
            rules={[{ required: true, message: 'Vui lòng chọn nguyên liệu' }]}
          >
            <Select disabled>
              {ingredients.map(ingredient => (
                <Select.Option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="warehouse_id"
            label="Kho"
            rules={[{ required: true, message: 'Vui lòng chọn kho' }]}
          >
            <Select>
              {warehouses.map(warehouse => (
                <Select.Option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số lượng hiện tại"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 0, message: 'Số lượng không được âm' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="min_quantity"
            label="Tồn kho tối thiểu"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng tồn kho tối thiểu' },
              { type: 'number', min: 0, message: 'Số lượng không được âm' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Stock Check Modal */}
      <Modal
        title="Kiểm kho"
        open={isStockCheckModalVisible}
        onOk={handleSaveStockCheck}
        onCancel={() => setIsStockCheckModalVisible(false)}
        okText="Lưu kiểm kho"
        cancelText="Hủy"
        width={800}
      >
        <Form form={form} layout="vertical">
          <Alert
            message="Thông tin kiểm kho"
            description="Nhập số lượng thực tế được kiểm đếm trong kho. Hệ thống sẽ cập nhật chênh lệch."
            type="info"
            showIcon
            className="mb-4"
          />
          
          <Table
            columns={[
              {
                title: 'Tên nguyên liệu',
                dataIndex: ['ingredient', 'name'],
                key: 'ingredient_name',
              },
              {
                title: 'Đơn vị',
                dataIndex: ['ingredient', 'unit'],
                key: 'unit',
                width: '10%',
              },
              {
                title: 'Số lượng hệ thống',
                dataIndex: 'quantity',
                key: 'quantity',
                width: '20%',
                render: (quantity: number, record: Inventory) => (
                  <span>{quantity} {record.ingredient?.unit}</span>
                ),
              },
              {
                title: 'Số lượng thực tế',
                key: 'actual_quantity',
                width: '20%',
                render: (_, record: Inventory) => (
                  <Form.Item
                    name={['actual_quantities', record.id]}
                    initialValue={record.quantity}
                    noStyle
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      addonAfter={record.ingredient?.unit}
                    />
                  </Form.Item>
                ),
              },
            ]}
            dataSource={filteredInventory}
            rowKey="id"
            pagination={false}
            bordered
            size="small"
          />
        </Form>
      </Modal>
    </div>
  );
};

export default ManageIngredient;