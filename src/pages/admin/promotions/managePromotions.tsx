import React, { useState } from 'react';
import { 
  Button, 
  Space, 
  Card, 
  Input, 
  Modal, 
  Form, 
  message, 
  InputNumber, 
  DatePicker, 
  Table, 
  Tag, 
  Select,
  Radio,
  Tooltip,
  Statistic,
  Row,
  Col,
  Tabs,
  Upload,
  Image
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  GiftOutlined, 
  CalendarOutlined, 
  UserOutlined,
  PercentageOutlined,
  DollarOutlined,
  CodeOutlined,
  EyeOutlined,
  UploadOutlined,
  PictureOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { CanAccess, useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { Promotion, PromotionCode, PromotionFormData, Media, Customer } from '@/types';
import { NoPermission } from '@/components/NoPermission';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const ManagePromotions: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [viewCodesModal, setViewCodesModal] = useState(false);
  const [selectedPromotionCodes, setSelectedPromotionCodes] = useState<PromotionCode[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageFile, setImageFile] = useState<Media | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Fetch promotions with relations
  const { data: promotionsData, isLoading } = useList<Promotion>({
    resource: 'promotions',
    meta: {
      populate: ['creator', 'promotion_codes', 'image']
    },
    sorters: [
      {
        field: 'created_at',
        order: 'desc'
      }
    ]
  });

  const { mutate: createPromotion, isLoading: isCreating } = useCreate();
  const { mutate: updatePromotion, isLoading: isUpdating } = useUpdate();
  const { mutate: deletePromotion, isLoading: isDeleting } = useDelete();
  const { mutate: uploadImage, isLoading: isUploading } = useCreate();

  // Sử dụng biến môi trường VITE_APP_URL
  const API_URL = import.meta.env.VITE_API_URL;

  const promotions = promotionsData?.data || [];

  // Filter promotions by status
  const activePromotions = promotions.filter(p => {
    const now = dayjs();
    const start = dayjs(p.start_date);
    const end = dayjs(p.end_date);
    return now.isAfter(start) && now.isBefore(end);
  });

  const upcomingPromotions = promotions.filter(p => {
    const now = dayjs();
    const start = dayjs(p.start_date);
    return now.isBefore(start);
  });

  const expiredPromotions = promotions.filter(p => {
    const now = dayjs();
    const end = dayjs(p.end_date);
    return now.isAfter(end);
  });

  const getPromotionsByTab = () => {
    switch (activeTab) {
      case '1': return activePromotions;
      case '2': return upcomingPromotions;
      case '3': return expiredPromotions;
      default: return promotions;
    }
  };

  const columns = [
    {
      title: 'Ưu đãi',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (text: string, record: Promotion) => (
        <div className="flex items-center gap-3">
          {record.image ? (
            <Image
              src={`${API_URL}/storage/${record.image.path}`}
              alt={record.name}
              width={50}
              height={50}
              className="rounded-lg object-cover"
              preview={false}
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <GiftOutlined className="text-blue-500 text-lg" />
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-800">{text}</div>
            <div className="text-sm text-gray-500 line-clamp-1">
              {record.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discount_type',
      key: 'discount_type',
      width: '15%',
      render: (type: string, record: Promotion) => {
        const isPercentage = type === 'percentage';
        const value = isPercentage ? record.discount_percentage : record.discount_amount;
        return (
          <div className="flex flex-col gap-1">
            <Tag 
              color={isPercentage ? 'red' : 'green'} 
              icon={isPercentage ? <PercentageOutlined /> : <DollarOutlined />}
              className="w-fit"
            >
              {isPercentage ? `${value}%` : `${value?.toLocaleString()}đ`}
            </Tag>
            {record.min_order_amount && (
              <div className="text-xs text-gray-500">
                Đơn tối thiểu: {record.min_order_amount.toLocaleString()}đ
              </div>
            )}
            {record.max_discount_amount && isPercentage && (
              <div className="text-xs text-gray-500">
                Giảm tối đa: {record.max_discount_amount.toLocaleString()}đ
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Điều kiện',
      key: 'conditions',
      width: '15%',
      render: (_: unknown, record: Promotion) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-600">
            <UserOutlined className="text-sm" />
            <span className="text-sm">{record.required_points} điểm</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <CodeOutlined className="text-sm" />
            <span className="text-sm">{record.limit} mã</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      key: 'dates',
      width: '18%',
      render: (_: unknown, record: Promotion) => {
        const now = dayjs();
        const start = dayjs(record.start_date);
        const end = dayjs(record.end_date);
        const isActive = now.isAfter(start) && now.isBefore(end);
        const isUpcoming = now.isBefore(start);
        
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <CalendarOutlined className="text-sm text-blue-500" />
              <span className="text-sm">{start.format('DD/MM/YYYY')}</span>
            </div>
            <div className="text-sm text-gray-500">
              đến {end.format('DD/MM/YYYY')}
            </div>
                         <Tag 
               color={isActive ? 'green' : isUpcoming ? 'blue' : 'red'}
             >
               {isActive ? 'Đang diễn ra' : isUpcoming ? 'Sắp diễn ra' : 'Đã kết thúc'}
             </Tag>
          </div>
        );
      },
    },
    {
      title: 'Mã đã tạo',
      key: 'codes_count',
      width: '12%',
      render: (_: unknown, record: Promotion) => {
        const totalCodes = record.promotion_codes?.length || 0;
        const usedCodes = record.promotion_codes?.filter(code => code.used_at).length || 0;
        
        return (
          <div className="text-center">
            <Statistic
              value={usedCodes}
              suffix={`/ ${totalCodes}`}
              valueStyle={{ fontSize: '14px' }}
            />
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewCodes(record)}
              className="p-0 h-auto"
            >
              Xem mã
            </Button>
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '15%',
      render: (_: unknown, record: Promotion) => (
        <Space>
          <Tooltip title="Sửa ưu đãi">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-blue-500 hover:text-blue-600"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa ưu đãi">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      const submitData: PromotionFormData = {
        name: values.name,
        description: values.description,
        discount_type: values.discount_type,
        discount_percentage: values.discount_type === 'percentage' ? values.discount_value : null,
        discount_amount: values.discount_type === 'fixed' ? values.discount_value : null,
        min_order_amount: values.min_order_amount,
        max_discount_amount: values.max_discount_amount,
        required_points: values.required_points,
        limit: values.limit,
        start_date: values.date_range[0].format('YYYY-MM-DD'),
        end_date: values.date_range[1].format('YYYY-MM-DD'),
        image_id: imageFile?.id?.toString() || undefined,
      };

      if (editingPromotion) {
        await updatePromotion({
          resource: 'promotions',
          id: editingPromotion.id,
          values: submitData,
        });
        message.success('Cập nhật ưu đãi thành công');
      } else {
        await createPromotion({
          resource: 'promotions',
          values: submitData,
        });
        message.success('Thêm ưu đãi thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingPromotion(null);
      setImageFile(null);
      setFileList([]);
    } catch (error) {
      console.error('Error:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại');
    }
  };

  const handleEdit = (record: Promotion) => {
    setEditingPromotion(record);
    setImageFile(record.image || null);
    
    // Set fileList if we have an image
    if (record.image) {
      setFileList([
        {
          uid: '-1',
          name: record.image.title || 'promotion.png',
          status: 'done',
          url: `${API_URL}/storage/${record.image.path}`,
        }
      ]);
    } else {
      setFileList([]);
    }
    
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      discount_type: record.discount_type,
      discount_value: record.discount_type === 'percentage' 
        ? record.discount_percentage 
        : record.discount_amount,
      min_order_amount: record.min_order_amount,
      max_discount_amount: record.max_discount_amount,
      required_points: record.required_points,
      limit: record.limit,
      date_range: [dayjs(record.start_date), dayjs(record.end_date)],
      image_id: record.image_id,
    });
    setIsModalVisible(true);
  };

  const showDeleteConfirm = (record: Promotion) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa ưu đãi "${record.name}"? Tất cả mã ưu đãi liên quan cũng sẽ bị xóa.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deletePromotion({
            resource: 'promotions',
            id: record.id,
          });
          message.success('Xóa ưu đãi thành công');
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa ưu đãi');
        }
      },
    });
  };

  const handleViewCodes = (promotion: Promotion) => {
    setSelectedPromotionCodes(promotion.promotion_codes || []);
    setViewCodesModal(true);
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'promotions');
      
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
              form.setFieldValue('image_id', imageData.id);
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
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );

  const codesColumns = [
    {
      title: 'Mã code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <Tag color="blue" className="font-mono text-sm px-3 py-1">
          {code}
        </Tag>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer: Customer) => customer ? customer.name : 'Chưa sử dụng',
    },
    {
      title: 'Ngày sử dụng',
      dataIndex: 'used_at',
      key: 'used_at',
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: unknown, record: PromotionCode) => (
        <Tag color={record.used_at ? 'red' : 'green'}>
          {record.used_at ? 'Đã sử dụng' : 'Chưa sử dụng'}
        </Tag>
      ),
    },
  ];

  return (
    <CanAccess resource='promotion' action='create' fallback={<NoPermission />}>
      <div className="p-6">
      <Card 
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <GiftOutlined className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-orange-600 mb-0">Quản lý ưu đãi</h2>
              <p className="text-gray-500 text-sm mb-0">Tạo và quản lý các chương trình khuyến mãi</p>
            </div>
          </div>
        }
        className="shadow-lg border-0"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            // className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-md"
                      onClick={() => {
            setEditingPromotion(null);
            form.resetFields();
            setImageFile(null);
            setFileList([]);
            setIsModalVisible(true);
          }}
          >
            Tạo ưu đãi mới
          </Button>
        }
      >
        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card className="text-center border-l-4 border-l-green-500">
              <Statistic
                title="Đang diễn ra"
                value={activePromotions.length}
                valueStyle={{ color: '#52c41a' }}
                prefix={<GiftOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="text-center border-l-4 border-l-blue-500">
              <Statistic
                title="Sắp diễn ra"
                value={upcomingPromotions.length}
                valueStyle={{ color: '#1890ff' }}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="text-center border-l-4 border-l-red-500">
              <Statistic
                title="Đã kết thúc"
                value={expiredPromotions.length}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<DeleteOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="text-center border-l-4 border-l-purple-500">
              <Statistic
                title="Tổng cộng"
                value={promotions.length}
                valueStyle={{ color: '#722ed1' }}
                prefix={<GiftOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          className="mb-4"
          items={[
            {
              key: '1',
              label: `Đang diễn ra (${activePromotions.length})`,
            },
            {
              key: '2',
              label: `Sắp diễn ra (${upcomingPromotions.length})`,
            },
            {
              key: '3',
              label: `Đã kết thúc (${expiredPromotions.length})`,
            },
            {
              key: '4',
              label: `Tất cả (${promotions.length})`,
            },
          ]}
        />

        <Table
          columns={columns}
          dataSource={getPromotionsByTab()}
          rowKey="id"
          loading={isLoading || isCreating || isUpdating || isDeleting}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng số ${total} ưu đãi`,
          }}
          className="bg-white rounded-lg shadow-sm"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <GiftOutlined className="text-orange-500 text-lg" />
            <span>{editingPromotion ? 'Sửa ưu đãi' : 'Tạo ưu đãi mới'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingPromotion(null);
          setImageFile(null);
          setFileList([]);
        }}
        footer={null}
        width={800}
        className="top-8"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
          initialValues={{
            discount_type: 'percentage',
            required_points: 0,
            limit: 100,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên ưu đãi"
                rules={[{ required: true, message: 'Vui lòng nhập tên ưu đãi' }]}
              >
                <Input 
                  className="rounded-md" 
                  placeholder="VD: Giảm giá mùa hè..." 
                  prefix={<GiftOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="required_points"
                label="Điểm yêu cầu"
                rules={[
                  { required: true, message: 'Vui lòng nhập điểm yêu cầu' },
                  { type: 'number', min: 0, message: 'Điểm yêu cầu không được âm' }
                ]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }}
                  placeholder="0"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả ưu đãi"
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả chi tiết về ưu đãi..."
              className="rounded-md"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="discount_type"
                label="Loại giảm giá"
                rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
              >
                <Radio.Group className="w-full">
                  <Radio.Button value="percentage" className="w-1/2 text-center">
                    <PercentageOutlined /> Phần trăm
                  </Radio.Button>
                  <Radio.Button value="fixed" className="w-1/2 text-center">
                    <DollarOutlined /> Số tiền
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="discount_value"
                label="Giá trị giảm"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá trị giảm' },
                  { type: 'number', min: 0, message: 'Giá trị giảm phải lớn hơn 0' }
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="limit"
                label="Số lượng mã"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng mã' },
                  { type: 'number', min: 1, message: 'Số lượng mã phải lớn hơn 0' }
                ]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }}
                  placeholder="100"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="min_order_amount"
                label="Đơn hàng tối thiểu (VNĐ)"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="max_discount_amount"
                label="Giảm tối đa (VNĐ)"
                tooltip="Chỉ áp dụng cho giảm theo phần trăm"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="date_range"
            label="Thời gian áp dụng"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng' }]}
          >
            <RangePicker 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
            />
          </Form.Item>

          <Form.Item
            label="Hình ảnh ưu đãi"
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
                  alt="Ưu đãi"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>

          <Form.Item className="flex justify-end mb-0 mt-6">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreating || isUpdating}
                // className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
              >
                {editingPromotion ? 'Cập nhật' : 'Tạo ưu đãi'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Codes Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CodeOutlined className="text-blue-500 text-lg" />
            <span>Danh sách mã ưu đãi</span>
          </div>
        }
        open={viewCodesModal}
        onCancel={() => setViewCodesModal(false)}
        footer={[
          <Button key="close" onClick={() => setViewCodesModal(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        <Table
          columns={codesColumns}
          dataSource={selectedPromotionCodes}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} mã`,
          }}
          size="small"
        />
      </Modal>
    </div>
    </CanAccess>
  );
};

export default ManagePromotions;

const styles = `
  .avatar-uploader .ant-upload {
    width: 200px;
    height: 200px;
  }
`;