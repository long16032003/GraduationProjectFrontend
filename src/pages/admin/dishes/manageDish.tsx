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
import { PlusOutlined, ExclamationCircleOutlined, LoadingOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import dayjs from 'dayjs';
import type { DishCategory, Dish, Media } from '@/types';


const ManageDish: React.FC = () => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageFile, setImageFile] = useState<Media | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Lấy danh sách món ăn
  const { data: dishes, isLoading: isLoadingDishes } = useList<Dish>({
    resource: 'dishes',
  });

  // Lấy danh sách danh mục
  const { data: categoriesData } = useList<DishCategory[]>({
    resource: 'dish-categories',
  });

  // Các mutation để thêm/sửa/xóa
  const { mutate: createDish, isLoading: isCreating } = useCreate();
  const { mutate: updateDish, isLoading: isUpdating } = useUpdate();
  const { mutate: deleteDish, isLoading: isDeleting } = useDelete();

  const { mutate: uploadImage, isLoading: isUploading } = useCreate();

  const columns = [
    {
      title: 'Tên món',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text: string) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: '120px',
      render: (image: Media | null) => (
        <div className="w-20 h-20">
          {image ? (
            <img
              src={image.path}
              alt="Món ăn"
              className="w-full h-full object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: ['dish_categories', 'name'],
      key: 'category',
      width: '15%',
      filters: categoriesData?.map((category: DishCategory) => ({ text: category.name, value: category.id })),
      onFilter: (value: number, record: Dish) => record.category_id === value,  
      render: (text: string) => (
        <Tag color="blue" className="px-3 py-1">
          {text}
        </Tag>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: '15%',
      sorter: (a: Dish, b: Dish) => a.price - b.price,
      render: (price: number) => (
        <span className='text-orange-600 font-bold'>
          {new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
          }).format(price)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: '15%',
      render: (isActive: boolean) => (
        <Tag 
          color={isActive ? 'success' : 'error'}
          className="px-3 py-1"
        >
          {isActive ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '15%',
      sorter: (a: Dish, b: Dish) => dayjs(a.created_at).diff(dayjs(b.created_at)),
      render: (date: string) => (
        <span className="text-gray-500">
          {dayjs(date).format('DD/MM/YYYY HH:mm')}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_: any, record: Dish) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-blue-500 hover:text-blue-600"
            onClick={() => handleEdit(record)}
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

  const handleAdd = () => {
    setEditingDish(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Dish) => {
    setEditingDish(record);
    setImageFile(record.image || null);
    form.setFieldsValue({
      name: record.name,
      category_id: record.category_id,
      price: record.price,
      description: record.description,
      is_active: record.is_active,
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
          await deleteDish({
            resource: 'dishes',
            id: record.id,
          });
          message.success('Xóa món ăn thành công');
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa món ăn');
        }
      },
    });
  };

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
      console.log("file: ", file);
      const fileData = {
        file: file,
      }
      console.log("fileData: ", fileData);
      const response = await uploadImage({
        resource: 'upload-image',
        values: fileData,
      });
      setImageFile(response.data);
      form.setFieldValue('image', response.data);
      message.success('Tải ảnh thành công');
    } catch (error) {
      message.error('Lỗi khi upload: ' + (error as Error).message);
    } finally {
      setUploadLoading(false);
    }
  
    return false; // Không upload mặc định, vì bạn đã xử lý tay
  };
  

  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    setFileList(info.fileList.slice(-1)); // Chỉ giữ file mới nhất
  };

  const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );

  const handleSubmit = async (values: Dish) => {
    try {
      setLoading(true);
      const data: Dish = {
        id: editingDish?.id || 0,
        name: values.name,
        description: values.description,
        price: values.price,
        category_id: values.category_id,
        is_active: values.is_active,
        creator_id: values.creator_id,
        image_id: imageFile?.id || null,
        created_at: values.created_at,
        updated_at: values.updated_at,
      };

      if (editingDish) {
        await updateDish({
          resource: 'dishes',
          id: editingDish.id,
          values: data,
        });
        message.success('Cập nhật món ăn thành công');
      } else {
        await createDish({
          resource: 'dishes',
          values: data,
        });
        message.success('Thêm món ăn thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      setImageFile(null);
      setFileList([]);
    } catch (error) {
      console.error('Error submitting:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  console.log("dishes: ", dishes);

  return (
    <Card
      title={
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium">Quản lý thực đơn</span>
          <Tag color="orange" className="uppercase">
            {dishes?.data?.length || 0} món
          </Tag>
        </div>
      }
      className="m-4 shadow-md"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Thêm món mới
        </Button>
      }
    >
      <div className="mb-4 flex justify-between items-center">
        <Input.Search
          placeholder="Tìm kiếm món ăn..."
          allowClear
          onSearch={(value) => setSearchText(value)}
          style={{ width: 300 }}
          className="shadow-sm"
        />
      </div>

      <Table
        columns={columns}
        dataSource={dishes?.data}
        loading={isLoadingDishes || isCreating || isUpdating || isDeleting}
        rowKey="id"
        pagination={{
          total: dishes?.total,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng số ${total} món`,
          className: "pagination-table"
        }}
        className="shadow-sm"
        rowClassName="hover:bg-gray-50 transition-colors duration-200"
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
            name='category_id'
            label='Danh mục'
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select>
              {categoriesData?.map((category: DishCategory) => (
                <Select.Option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </Select.Option>
              )) || []}
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
            name='is_active'
            label='Trạng thái'
            initialValue={true}
          >
            <Select>
              <Select.Option value={true}>Đang bán</Select.Option>
              <Select.Option value={false}>Ngừng bán</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
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
              listType='picture-card'
              className='avatar-uploader'
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              fileList={fileList}
            >
              {dishes?.image ? (
                <img
                  src={dishes?.image?.path}
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
