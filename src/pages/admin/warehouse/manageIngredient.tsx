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
  Alert,
  Upload,
  Image
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
  SaveOutlined,
  UploadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { TableProps, ColumnsType } from 'antd/es/table';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { CanAccess, useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import type { Media } from '@/types';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import { NoPermission } from '@/components/NoPermission';
import { httpClient } from '@/utils/http';

// Define interfaces based on the new database structure
interface Ingredient {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  creator_id: number;
  image_id?: number;
  image?: Media;
  created_at: string;
  updated_at: string;
}

// Form interfaces
interface IngredientFormValues {
  name: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  image?: Media;
}

const { Title, Text } = Typography;


const ManageIngredient: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { data: ingredients, isLoading, refetch } = useList<Ingredient>({
    resource: 'ingredients',
  });

  // Mutations
  const { mutate: createIngredient, isLoading: isCreating } = useCreate();
  const { mutate: updateIngredient, isLoading: isUpdating } = useUpdate();
  const { mutate: deleteIngredient, isLoading: isDeleting } = useDelete();
  const { mutate: uploadImage, isLoading: isUploading } = useCreate();

  // API URL from environment
  const API_URL = import.meta.env.VITE_API_URL;

  // State variables
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [searchText, setSearchText] = useState<string>('');
  const [isIngredientModalVisible, setIsIngredientModalVisible] = useState<boolean>(false);
  const [isStockCheckModalVisible, setIsStockCheckModalVisible] = useState<boolean>(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageFile, setImageFile] = useState<Media | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isLowStockModalVisible, setIsLowStockModalVisible] = useState(false);
  // State for storing actual quantities during stock check
  const [actualQuantities, setActualQuantities] = useState<Record<number, number>>({});

  // Mock data for development
  // const ingredients = generateMockIngredients();

  // Filtered ingredients based on search
  const filteredIngredients = ingredients?.data.filter(item => 
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Low stock items
  const lowStockItems = ingredients?.data.filter(item => item.quantity <= item.min_quantity);

  // Columns for the inventory table
  const inventoryColumns: ColumnsType<Ingredient> = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: '5%',
      render: (text: string, record: Ingredient, index: number) => index + 1,
    },
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'name',
      key: 'ingredient_name',
      sorter: (a: Ingredient, b: Ingredient) => 
        a.name.localeCompare(b.name),
      render: (text: string, record: Ingredient) => (
        <div className="flex items-center gap-2">
          <Image src={`${API_URL}/storage/${record.image?.path}`} alt={record.name} width={60} height={60} className='border-2 border-gray-300 rounded-md'/>
          {text}
        </div>
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: '10%',
    },
    {
      title: 'Số lượng hiện tại',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '15%',
      sorter: (a: Ingredient, b: Ingredient) => a.quantity - b.quantity,
      render: (quantity: number, record: Ingredient) => (
        <span className={quantity <= record.min_quantity ? 'text-red-500 font-bold' : ''}>
          {quantity} {record.unit}
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
      render: (min: number, record: Ingredient) => `${min} ${record.unit}`,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: '15%',
      render: (_: unknown, record: Ingredient) => (
        <Tag color={record.quantity <= record.min_quantity ? 'error' : 'success'}>
          {record.quantity <= record.min_quantity ? 'Cần nhập thêm' : 'Đủ hàng'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '15%',
      render: (date: string) => dayjs(date).format('HH:mm DD/MM/YYYY'),
      sorter: (a: Ingredient, b: Ingredient) => 
        dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '10%',
      render: (_: unknown, record: Ingredient) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditIngredient(record)}
            className="text-blue-500 hover:text-blue-600"
            title="Chỉnh sửa"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
            title="Xóa"
          />
        </Space>
      ),
    },
  ];

  // Event handlers
  const beforeUpload = async (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < 2;
  
    if (!isJpgOrPng) {
      message.error('Chỉ chấp nhận JPG/PNG!');
      return false;
    }
  
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
      return false;
    }
  
    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'ingredients');
      
      uploadImage(
        {
          resource: 'upload-image',
          values: formData
        },
        {
          onSuccess: (response) => {
            console.log("Upload success:", response);
            if (response?.data) {
              const imageData = response.data;
              console.log("Image data:", imageData);
              setImageFile(imageData as unknown as Media);
              form.setFieldValue('image', imageData);
              message.success('Tải ảnh thành công');
            } else {
              console.error("Invalid response structure:", response);
              message.error('Lỗi định dạng dữ liệu từ server');
            }
            setUploadLoading(false);
          },
          onError: (error) => {
            console.error("Upload error:", error);
            message.error('Lỗi khi upload: ' + error.message);
            setUploadLoading(false);
          }
        }
      );
    } catch (error) {
      message.error('Lỗi khi upload: ' + (error as Error).message);
      setUploadLoading(false);
    }
  
    return false;
  };

  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    setFileList(info.fileList.slice(-1));
  };

  const uploadButton = (
    <div>
      {uploadLoading ? <UploadOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );

  const handleAddIngredient = () => {
    setEditingIngredient(null);
    form.resetFields();
    setImageFile(null);
    setFileList([]);
    setIsIngredientModalVisible(true);
  };

  const handleEditIngredient = (record: Ingredient) => {
    setEditingIngredient(record);
    setImageFile(record.image || null);
    
    // Set fileList if we have an image
    if (record.image) {
      setFileList([
        {
          uid: '-1',
          name: record.image.title || 'image.png',
          status: 'done',
          url: `${API_URL}/storage/${record.image.path}`,
        }
      ]);
    } else {
      setFileList([]);
    }
    
    form.setFieldsValue({
      name: record.name,
      unit: record.unit,
      quantity: record.quantity,
      min_quantity: record.min_quantity,
    });

    setIsIngredientModalVisible(true);
  };

  const handleSaveIngredient = async (values: IngredientFormValues) => {
    try {
      const data = {
        name: values.name,
        unit: values.unit,
        quantity: values.quantity,
        min_quantity: values.min_quantity,
        image_id: imageFile?.id || null,
      };

      if (editingIngredient) {
        await updateIngredient({
          resource: 'ingredients',
          id: editingIngredient.id,
          values: data,
        });
      } else {
        await createIngredient({
          resource: 'ingredients',
          values: data,
        });
      }
      
      setIsIngredientModalVisible(false);
      form.resetFields();
      setImageFile(null);
      setFileList([]);
    } catch (error) {
      console.error('Save Failed:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại');
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
        deleteIngredient({
          resource: 'ingredients',
          id: record.id,
        });
      },
    });
  };

  const handleSaveStockCheck = async () => {
    try {
      // Filter ingredients that have quantity changes
      const ingredientsToUpdate = ingredients?.data?.filter(ingredient => {
        const actualQty = actualQuantities[ingredient.id];
        return actualQty !== undefined && actualQty !== ingredient.quantity;
      }) || [];

      if (ingredientsToUpdate.length === 0) {
        message.info('Không có thay đổi nào để lưu');
        return;
      }

      // Create detailed change summary
      const changeDetails = ingredientsToUpdate.map(ingredient => {
        const actualQty = actualQuantities[ingredient.id];
        const difference = actualQty - ingredient.quantity;
        return {
          name: ingredient.name,
          unit: ingredient.unit,
          systemQty: ingredient.quantity,
          actualQty: actualQty,
          difference: difference
        };
      });

      // Show confirmation dialog
      Modal.confirm({
        title: 'Xác nhận lưu kiểm kho',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>Bạn có chắc chắn muốn cập nhật <strong>{ingredientsToUpdate.length}</strong> nguyên liệu sau?</p>
            <div className="max-h-64 overflow-y-auto mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Nguyên liệu</th>
                    <th className="text-center p-2">Hệ thống</th>
                    <th className="text-center p-2">Thực tế</th>
                    <th className="text-center p-2">Chênh lệch</th>
                  </tr>
                </thead>
                <tbody>
                  {changeDetails.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="text-center p-2">{item.systemQty} {item.unit}</td>
                      <td className="text-center p-2">{item.actualQty} {item.unit}</td>
                      <td className={`text-center p-2 font-medium ${
                        item.difference > 0 ? 'text-green-600' : 
                        item.difference < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {item.difference > 0 ? '+' : ''}{item.difference} {item.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-yellow-600">
              <strong>Lưu ý:</strong> Thao tác này sẽ thay đổi số lượng tồn kho trong hệ thống và không thể hoàn tác.
            </p>
          </div>
        ),
        okText: 'Đồng ý cập nhật',
        cancelText: 'Hủy',
        width: 600,
        onOk: async () => {
          try {
            // Create const for ingredients that need updating
            const ingredientsNeedUpdate = ingredientsToUpdate;
            
            // Create object with format {id_ingredient: quantity} using forEach
            const updateData: Record<number, number> = {};
            ingredientsNeedUpdate.forEach(ingredient => {
              updateData[ingredient.id] = actualQuantities[ingredient.id];
            });

            // Call single API to update all ingredients
            await httpClient(`${API_URL}/ingredients/update-quantitys`, {
              method: 'PUT',
              body: updateData,
            });
            
            message.success(`Đã cập nhật số lượng tồn kho thực tế.`);
            
            // Reset actual quantities to match updated system quantities
            const newActualQuantities: Record<number, number> = {};
            ingredients?.data?.forEach(ingredient => {
              newActualQuantities[ingredient.id] = actualQuantities[ingredient.id] || ingredient.quantity;
            });
            setActualQuantities(newActualQuantities);
            
            // Refresh data to get updated quantities
            await refetch();
            
          } catch (error) {
            console.error('Bulk update failed:', error);
            message.error('Có lỗi xảy ra khi cập nhật. Vui lòng thử lại');
          }
        },
      });
      
    } catch (error) {
      console.error('Save stock check failed:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại');
    }
  };

  // Handle actual quantity change
  const handleActualQuantityChange = (ingredientId: number, value: number | null) => {
    setActualQuantities(prev => ({
      ...prev,
      [ingredientId]: value || 0
    }));
  };

  // Initialize actual quantities when component mounts or data changes
  useEffect(() => {
    if (ingredients?.data) {
      const initialQuantities: Record<number, number> = {};
      ingredients.data.forEach(ingredient => {
        initialQuantities[ingredient.id] = ingredient.quantity;
      });
      setActualQuantities(initialQuantities);
    }
  }, [ingredients?.data]);

  return (
    <CanAccess resource='ingredient' action='create' fallback={<NoPermission />}>
      <div className="flex flex-1 flex-col gap-4 p-4">
      <Card className="shadow-sm">
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col>
            <Title level={3} className="m-0 text-orange-600">Quản lý nguyên liệu</Title>
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
              
              {activeTab === 'inventory' && (
                <>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddIngredient}
                >
                  Thêm nguyên liệu
                </Button>
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

      {/* Statistics Dashboard */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-500 text-sm">Tổng nguyên liệu</Text>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {ingredients?.data.length || 0}
                </div>
                <Text className="text-xs text-gray-400">loại nguyên liệu</Text>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <InfoCircleOutlined className="text-blue-600 text-xl" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-500 text-sm">Cần nhập thêm</Text>
                <div className="text-2xl font-bold text-red-600 mt-1">
                  {lowStockItems?.length || 0}
                </div>
                <Text className="text-xs text-gray-400">nguyên liệu thiếu</Text>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <WarningOutlined className="text-red-600 text-xl" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-500 text-sm">Tồn kho an toàn</Text>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {ingredients?.data.filter(item => item.quantity > item.min_quantity).length || 0}
                </div>
                <Text className="text-xs text-gray-400">nguyên liệu đủ</Text>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <InfoCircleOutlined className="text-green-600 text-xl" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-500 text-sm">Tỷ lệ an toàn</Text>
                <div className="text-2xl font-bold text-orange-600 mt-1">
                  {ingredients?.data && ingredients.data.length > 0 
                    ? Math.round((ingredients.data.filter(item => item.quantity > item.min_quantity).length / ingredients.data.length) * 100)
                    : 0
                  }%
                </div>
                <Text className="text-xs text-gray-400">kho đảm bảo</Text>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <SyncOutlined className="text-orange-600 text-xl" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {lowStockItems && lowStockItems.length > 0 && (
        <Alert
          message="Cảnh báo tồn kho thấp"
          description={`Có ${lowStockItems?.length} nguyên liệu dưới mức tồn kho tối thiểu, cần nhập thêm.`}
          type="warning"
          showIcon
          className="mb-4"
          action={
            <Button 
              size="small" 
              danger
              onClick={() => setIsLowStockModalVisible(true)}
            >
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
          items={[
            {
              label: <span><InfoCircleOutlined /> Tồn kho</span>,
              key: 'inventory',
              children: (
                <Table
                  columns={inventoryColumns}
                  dataSource={filteredIngredients}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  loading={false} // Set to true when loading data from API
                  bordered
                  scroll={{ x: 800 }}

                />
              ),
            },
            {
              label: <span><InfoCircleOutlined /> Kiểm kho</span>,
              key: 'stock-check',
              children: (
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
                        dataIndex: 'name',
                        key: 'ingredient_name',
                      },
                      {
                        title: 'Đơn vị',
                        dataIndex: 'unit',
                        key: 'unit',
                        width: '10%',
                      },
                      {
                        title: 'Số lượng hệ thống',
                        dataIndex: 'quantity',
                        key: 'quantity',
                        width: '15%',
                        render: (quantity: number, record: Ingredient) => (
                          <span>{quantity} {record.unit}</span>
                        ),
                      },
                      {
                        title: 'Số lượng thực tế',
                        key: 'actual_quantity',
                        width: '20%',
                        render: (_, record: Ingredient) => (
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            value={actualQuantities[record.id] || record.quantity}
                            onChange={(value) => handleActualQuantityChange(record.id, value)}
                            addonAfter={record.unit}
                          />
                        ),
                      },
                      {
                        title: 'Chênh lệch',
                        key: 'difference',
                        width: '15%',
                        render: (_, record: Ingredient) => {
                          const actualQty = actualQuantities[record.id] || record.quantity;
                          const difference = actualQty - record.quantity;
                          return (
                            <span 
                              className={
                                difference > 0 
                                  ? 'text-green-600 font-semibold' 
                                  : difference < 0 
                                    ? 'text-red-600 font-semibold' 
                                    : 'text-gray-600'
                              }
                            >
                              {difference > 0 ? '+' : ''}{difference} {record.unit}
                            </span>
                          );
                        },
                      },
                    ]}
                    dataSource={filteredIngredients}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    bordered
                    footer={() => (
                      <div className="text-right">
                        <Button 
                          type="primary" 
                          icon={<SaveOutlined />}
                          onClick={handleSaveStockCheck}
                          loading={isUpdating}
                        >
                          Lưu kiểm kho
                        </Button>
                      </div>
                    )}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Ingredient Modal */}
      <Modal
        title={editingIngredient ? "Cập nhật nguyên liệu" : "Thêm nguyên liệu mới"}
        open={isIngredientModalVisible}
        onCancel={() => {
          setIsIngredientModalVisible(false);
          form.resetFields();
          setImageFile(null);
          setFileList([]);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveIngredient}
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
            <Input placeholder="Ví dụ: kg, g, lít, ml, quả, cái, thùng..." />
          </Form.Item>
          {/* <Form.Item
            name="quantity"
            label="Số lượng hiện tại"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 0, message: 'Số lượng không được âm' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item> */}
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

          <Form.Item
            label="Ảnh nguyên liệu"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              fileList={fileList}
            >
              {imageFile ? (
                <img
                  src={`${API_URL}/storage/${imageFile.path}`}
                  alt="Nguyên liệu"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>

          <Form.Item className="flex justify-end">
            <Space>
              <Button onClick={() => setIsIngredientModalVisible(false)}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreating || isUpdating}
              >
                {editingIngredient ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Low Stock Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-yellow-500" />
            <span>Chi tiết nguyên liệu tồn kho thấp</span>
          </div>
        }
        open={isLowStockModalVisible}
        onCancel={() => setIsLowStockModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsLowStockModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="import"
            type="primary"
            onClick={() => {
              setIsLowStockModalVisible(false);
              // Navigate to import page - you can implement this
              window.location.href = '/admin/warehouse';
            }}
          >
            Đi đến nhập kho
          </Button>
        ]}
        width={900}
      >
        <div className="space-y-4">
          <Alert
            message="Cảnh báo tồn kho"
            description={`Có ${lowStockItems?.length || 0} nguyên liệu có tồn kho dưới mức tối thiểu. Bạn nên nhập thêm để đảm bảo hoạt động liên tục.`}
            type="warning"
            showIcon
            className="mb-4"
          />
          
          <Table
            columns={[
              {
                title: 'Tên nguyên liệu',
                dataIndex: 'name',
                key: 'name',
                width: '25%',
                render: (name: string) => (
                  <span className="font-medium">{name}</span>
                ),
              },
              {
                title: 'Đơn vị',
                dataIndex: 'unit',
                key: 'unit',
                width: '10%',
                align: 'center',
              },
              {
                title: 'Tồn kho hiện tại',
                dataIndex: 'quantity',
                key: 'quantity',
                width: '15%',
                align: 'center',
                render: (quantity: number, record: Ingredient) => (
                  <span className={`font-medium ${quantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                    {quantity} {record.unit}
                  </span>
                ),
              },
              {
                title: 'Tồn kho tối thiểu',
                dataIndex: 'min_quantity',
                key: 'min_quantity',
                width: '15%',
                align: 'center',
                render: (minQuantity: number, record: Ingredient) => (
                  <span className="text-gray-600">
                    {minQuantity} {record.unit}
                  </span>
                ),
              },
              {
                title: 'Chênh lệch',
                key: 'difference',
                width: '15%',
                align: 'center',
                render: (_, record: Ingredient) => {
                  const diff = record.quantity - record.min_quantity;
                  return (
                    <span className={`font-medium ${diff < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {diff > 0 ? '+' : ''}{diff} {record.unit}
                    </span>
                  );
                },
              },
              {
                title: 'Mức độ ưu tiên',
                key: 'priority',
                width: '20%',
                align: 'center',
                render: (_, record: Ingredient) => {
                  const ratio = record.quantity / record.min_quantity;
                  let priority, color, text;
                  
                  if (ratio <= 0) {
                    priority = 'Khẩn cấp';
                    color = 'red';
                    text = 'Hết hàng';
                  } else if (ratio <= 0.5) {
                    priority = 'Cao';
                    color = 'volcano';
                    text = 'Rất thấp';
                  } else if (ratio <= 0.8) {
                    priority = 'Trung bình';
                    color = 'orange';
                    text = 'Thấp';
                  } else {
                    priority = 'Thấp';
                    color = 'gold';
                    text = 'Sắp thấp';
                  }
                  
                  return (
                    <div className="space-y-1">
                      <Tag color={color}>{priority}</Tag>
                      <div className="text-xs text-gray-500">{text}</div>
                    </div>
                  );
                },
              },
            ]}
            dataSource={lowStockItems || []}
            rowKey="id"
            pagination={false}
            bordered
            size="small"
            scroll={{ x: 800 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={6}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Tổng số nguyên liệu cần nhập: {lowStockItems?.length || 0}
                      </span>
                      <span className="text-red-600 font-medium">
                        Nguyên liệu hết hàng: {lowStockItems?.filter(item => item.quantity === 0).length || 0}
                      </span>
                    </div>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
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
                dataIndex: 'name',
                key: 'ingredient_name',
              },
              {
                title: 'Đơn vị',
                dataIndex: 'unit',
                key: 'unit',
                width: '10%',
              },
              {
                title: 'Số lượng hệ thống',
                dataIndex: 'quantity',
                key: 'quantity',
                width: '20%',
                render: (quantity: number, record: Ingredient) => (
                  <span>{quantity} {record.unit}</span>
                ),
              },
              {
                title: 'Số lượng thực tế',
                key: 'actual_quantity',
                width: '20%',
                render: (_, record: Ingredient) => (
                  <Form.Item
                    name={['actual_quantities', record.id]}
                    initialValue={record.quantity}
                    noStyle
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      addonAfter={record.unit}
                    />
                  </Form.Item>
                ),
              },
            ]}
            dataSource={filteredIngredients}
            rowKey="id"
            pagination={false}
            bordered
            size="small"
          />
        </Form>
      </Modal>
    </div>
    </CanAccess>
  );
};

export default ManageIngredient;

const styles = `
  .avatar-uploader .ant-upload {
    width: 200px;
    height: 200px;
  }
`;