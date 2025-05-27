import React, { useState } from 'react';
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
  Upload,
} from 'antd';
import { PlusOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';

interface Dish {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  description?: string;
  status: 'available' | 'unavailable';
  image?: string;
}

interface DishFormData {
  name: string;
  categoryId: string;
  price: number;
  description?: string;
  status: 'available' | 'unavailable';
  image?: string;
}

const ManageDish: React.FC = () => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [imageUrl, setImageUrl] = useState<string>();
  const [uploadLoading, setUploadLoading] = useState(false);

  // Mock data - sẽ được thay thế bằng API call
  const categories = [
    { id: '1', name: 'Món khai vị' },
    { id: '2', name: 'Món chính' },
    { id: '3', name: 'Tráng miệng' },
  ];

  const data: Dish[] = [
    {
      id: '1',
      code: 'MA001',
      name: 'Gỏi cuốn',
      categoryId: '1',
      categoryName: 'Món khai vị',
      price: 50000,
      description: 'Gỏi cuốn tôm thịt tươi ngon',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?q=80&w=300',
    },
    {
      id: '2',
      code: 'MA002',
      name: 'Phở bò',
      categoryId: '2',
      categoryName: 'Món chính',
      price: 75000,
      description: 'Phở bò với nước dùng đặc biệt',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=300',
    },
    {
      id: '3',
      code: 'MA003',
      name: 'Chè thái',
      categoryId: '3',
      categoryName: 'Tráng miệng',
      price: 35000,
      description: 'Chè thái thơm ngon, nhiều topping',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1628191139360-4083564d03fd?q=80&w=300',
    },
    {
      id: '4',
      code: 'MA004',
      name: 'Cơm rang hải sản',
      categoryId: '2',
      categoryName: 'Món chính',
      price: 85000,
      description: 'Cơm rang với hải sản tươi sống',
      status: 'unavailable',
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=300',
    },
    {
      id: '5',
      code: 'MA005',
      name: 'Salad trộn',
      categoryId: '1',
      categoryName: 'Món khai vị',
      price: 45000,
      description: 'Salad trộn với sốt đặc biệt',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300',
    },
  ];

  const columns = [
    {
      title: 'Mã món',
      dataIndex: 'code',
      key: 'code',
      width: '10%',
    },
    {
      title: 'Tên món',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      sorter: (a: Dish, b: Dish) => a.name.localeCompare(b.name),
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: '120px',
      render: (image: string) => (
        <div className='w-20 h-20'>
          {image ? (
            <img
              src={image}
              alt='Món ăn'
              className='w-full h-full object-cover rounded'
            />
          ) : (
            <div className='w-full h-full bg-gray-200 rounded flex items-center justify-center'>
              <span className='text-gray-500'>No image</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: '15%',
      filters: categories.map((cat) => ({ text: cat.name, value: cat.id })),
      onFilter: (value: string, record: Dish) => record.categoryId === value,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: '15%',
      render: (price: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price),
      sorter: (a: Dish, b: Dish) => a.price - b.price,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status: string) => (
        <Tag color={status === 'available' ? 'green' : 'red'}>
          {status === 'available' ? 'Có sẵn' : 'Không có'}
        </Tag>
      ),
      filters: [
        { text: 'Có sẵn', value: 'available' },
        { text: 'Không có', value: 'unavailable' },
      ],
      onFilter: (value: string, record: Dish) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_: any, record: Dish) => (
        <Space size='middle'>
          <Button
            type='primary'
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            onClick={() => showDeleteConfirm(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingDish(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Dish) => {
    setEditingDish(record);
    setImageUrl(record.image);
    form.setFieldsValue({
      name: record.name,
      categoryId: record.categoryId,
      price: record.price,
      description: record.description,
      status: record.status,
    });
    setIsModalVisible(true);
  };

  const showDeleteConfirm = (record: Dish) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa món "${record.name}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          // API call để xóa món ăn
          // await deleteDish(record.id);
          message.success('Xóa món ăn thành công');
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa món ăn');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Chỉ có thể tải lên file JPG/PNG!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setUploadLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setUploadLoading(false);
        setImageUrl(url);
      });
    }
  };

  const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );

  const handleSubmit = async (values: DishFormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key !== 'image') {
          formData.append(key, values[key]);
        }
      });
      if (imageUrl) {
        formData.append('image', imageUrl);
      }

      if (editingDish) {
        // API call để cập nhật món ăn
        // await updateDish(editingDish.id, formData);
        message.success('Cập nhật món ăn thành công');
      } else {
        // API call để thêm món ăn mới
        // await createDish(formData);
        message.success('Thêm món ăn thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      setImageUrl(undefined);
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title='Quản lý thực đơn'
      className='m-4'
    >
      <div className='mb-4 flex justify-between items-center'>
        <Input.Search
          placeholder='Tìm kiếm món ăn...'
          allowClear
          onSearch={(value) => setSearchText(value)}
          style={{ width: 300 }}
        />
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Thêm món mới
        </Button>
      </div>

      <Table
        columns={columns as any}
        dataSource={data}
        loading={loading}
        rowKey='id'
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng số ${total} món`,
        }}
      />

      <Modal
        title={editingDish ? 'Sửa món ăn' : 'Thêm món ăn mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
        >
          <Form.Item
            name='name'
            label='Tên món'
            rules={[
              { required: true, message: 'Vui lòng nhập tên món' },
              { max: 100, message: 'Tên món không được quá 100 ký tự' },
              {
                validator: async (_, value) => {
                  if (value) {
                    // Kiểm tra tên món trùng lặp
                    // const exists = await checkDishNameExists(value);
                    // if (exists) throw new Error('Tên món đã tồn tại');
                  }
                },
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name='categoryId'
            label='Danh mục'
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select>
              {categories.map((category) => (
                <Select.Option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name='price'
            label='Giá'
            rules={[
              { required: true, message: 'Vui lòng nhập giá' },
              { type: 'number', min: 0, message: 'Giá không được âm' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter='VNĐ'
            />
          </Form.Item>

          <Form.Item
            name='description'
            label='Mô tả'
            rules={[{ max: 500, message: 'Mô tả không được quá 500 ký tự' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name='status'
            label='Trạng thái'
            initialValue='available'
          >
            <Select>
              <Select.Option value='available'>Có sẵn</Select.Option>
              <Select.Option value='unavailable'>Không có</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name='image'
            label='Ảnh món ăn'
            valuePropName='fileList'
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              name='avatar'
              listType='picture-card'
              className='avatar-uploader'
              showUploadList={false}
              // action='https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188'
              action={``}
              beforeUpload={beforeUpload}
              onChange={handleChange}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt='avatar'
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>

          <Form.Item className='flex justify-end'>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button
                type='primary'
                htmlType='submit'
                loading={loading}
              >
                {editingDish ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManageDish;

const styles = `
  .avatar-uploader .ant-upload {
    width: 200px;
    height: 200px;
  }
`;
