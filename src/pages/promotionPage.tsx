import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Tag, Divider, Modal, Form, Input, DatePicker, message, Image, Upload, Tabs } from 'antd';
import { GiftOutlined, ClockCircleOutlined, EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined, TagOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Promotion {
  id: number;
  title: string;
  description: string;
  discountPercent?: number;
  discountAmount?: number;
  code: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  poster: string;
}

const PromotionPage: React.FC = () => {
  // Dữ liệu giả cho các ưu đãi
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: 1,
      title: 'Giảm 15% cho đơn hàng đầu tiên',
      description: 'Áp dụng cho khách hàng mới. Giảm tối đa 50.000đ cho đơn hàng đầu tiên.',
      discountPercent: 15,
      code: 'WELCOME15',
      startDate: '2023-06-01',
      endDate: '2023-12-31',
      isActive: true,
      poster: 'https://img.freepik.com/free-vector/gradient-sale-background_23-2149024132.jpg'
    },
    {
      id: 2,
      title: 'Giảm 30.000đ cho đơn từ 200.000đ',
      description: 'Áp dụng cho tất cả các món ăn. Giảm trực tiếp 30.000đ khi đặt đơn từ 200.000đ.',
      discountAmount: 30000,
      code: 'SAVE30K',
      startDate: '2023-07-01',
      endDate: '2023-08-31',
      isActive: true,
      poster: 'https://img.freepik.com/free-vector/modern-sale-banner-with-text-space_1017-14926.jpg'
    },
    {
      id: 3,
      title: 'Combo tiết kiệm - Giảm 20%',
      description: 'Áp dụng khi đặt combo 2 người. Giảm 20% tổng hóa đơn.',
      discountPercent: 20,
      code: 'COMBO20',
      startDate: '2023-06-15',
      endDate: '2023-07-15',
      isActive: false,
      poster: 'https://img.freepik.com/free-vector/flat-design-sales-banner-template_23-2149955168.jpg'
    },
    {
      id: 4,
      title: 'Sinh nhật vui vẻ - Tặng món tráng miệng',
      description: 'Khách hàng được tặng 1 món tráng miệng bất kỳ trong ngày sinh nhật khi đặt đơn từ 300.000đ.',
      code: 'BIRTHDAY',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      isActive: true,
      poster: 'https://img.freepik.com/free-vector/gradient-birthday-sale-background_52683-66464.jpg'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [posterUrl, setPosterUrl] = useState('');

  // Chỉ hiển thị các ưu đãi đang hoạt động
  const activePromotions = promotions.filter(promo => promo.isActive);

  const handleAdd = () => {
    setCurrentPromotion(null);
    form.resetFields();
    setFileList([]);
    setPosterUrl('');
    setIsModalVisible(true);
  };

  const showModal = (promotion?: Promotion) => {
    if (promotion) {
      setCurrentPromotion(promotion);
      form.setFieldsValue({
        ...promotion,
        dateRange: [dayjs(promotion.startDate), dayjs(promotion.endDate)]
      });
      setPosterUrl(promotion.poster);
      setFileList([
        {
          uid: '-1',
          name: 'poster.jpg',
          status: 'done',
          url: promotion.poster,
        }
      ]);
    } else {
      setCurrentPromotion(null);
      form.resetFields();
      setFileList([]);
      setPosterUrl('');
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa ưu đãi này?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        setPromotions(prev => prev.filter(promo => promo.id !== id));
        message.success('Xóa ưu đãi thành công');
      }
    });
  };

  const handleSubmit = (values: any) => {
    const [startDate, endDate] = values.dateRange.map((date: any) => date.format('YYYY-MM-DD'));
    
    if (!posterUrl) {
      message.error('Vui lòng tải lên ảnh poster cho ưu đãi');
      return;
    }
    
    const newPromotion: Promotion = {
      id: currentPromotion?.id || Math.max(...promotions.map(p => p.id), 0) + 1,
      title: values.title,
      description: values.description,
      code: values.code,
      startDate,
      endDate,
      isActive: values.isActive,
      poster: posterUrl
    };

    if (values.discountType === 'percent') {
      newPromotion.discountPercent = values.discountValue;
    } else {
      newPromotion.discountAmount = values.discountValue;
    }

    if (currentPromotion) {
      // Update existing promotion
      setPromotions(prev => 
        prev.map(promo => promo.id === currentPromotion.id ? newPromotion : promo)
      );
      message.success('Cập nhật ưu đãi thành công!');
    } else {
      // Add new promotion
      setPromotions(prev => [...prev, newPromotion]);
      message.success('Thêm ưu đãi mới thành công!');
    }

    setIsModalVisible(false);
    form.resetFields();
  };

  const handlePosterChange: UploadProps['onChange'] = ({ fileList: newFileList, file }) => {
    setFileList(newFileList);
    
    // Giả lập việc tải ảnh lên và nhận URL
    if (file.status === 'done' || file.status === 'uploading') {
      // Trong môi trường thực tế, URL sẽ được trả về từ server
      // Ở đây, chúng ta giả định một URL demo nếu không có URL thực
      const demoUrls = [
        'https://img.freepik.com/free-vector/gradient-sale-background_23-2149024132.jpg',
        'https://img.freepik.com/free-vector/modern-sale-banner-with-text-space_1017-14926.jpg',
        'https://img.freepik.com/free-vector/flat-design-sales-banner-template_23-2149955168.jpg',
        'https://img.freepik.com/free-vector/gradient-birthday-sale-background_52683-66464.jpg'
      ];
      
      if (file.status === 'done') {
        const randomUrl = demoUrls[Math.floor(Math.random() * demoUrls.length)];
        setPosterUrl(randomUrl);
        message.success('Tải ảnh thành công!');
      }
    }
  };

  // Tùy chỉnh cách tải lên
  const customUploadRequest = ({ onSuccess }: any) => {
    // Giả lập việc tải lên thành công sau 1 giây
    setTimeout(() => {
      onSuccess("ok");
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="p-6  from-blue-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Title level={2} className="mb-0 flex items-center">
                <GiftOutlined className="mr-3 text-red-500" /> 
                <span>Quản lý ưu đãi</span>
              </Title>
              <Text className="text-gray-500">Quản lý các mã giảm giá và chương trình khuyến mãi</Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className="shadow-md"
            >
              Thêm ưu đãi mới
            </Button>
          </div>

          <Tabs defaultActiveKey="1" className="promotion-tabs">
            <TabPane tab="Ưu đãi đang áp dụng" key="1">
              <Row gutter={[24, 24]} className="mt-4">
                {activePromotions.map(promotion => (
                  <Col xs={24} md={12} lg={8} key={promotion.id}>
                    <Card 
                      hoverable 
                      className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                      cover={
                        <div className="h-48 overflow-hidden relative">
                          <img 
                            alt={promotion.title}
                            src={promotion.poster}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg">
                            {promotion.discountPercent ? `${promotion.discountPercent}%` : 
                             promotion.discountAmount ? `${new Intl.NumberFormat('vi-VN').format(promotion.discountAmount)}đ` : 
                             'Đặc biệt'}
                          </div>
                        </div>
                      }
                      actions={[
                        <Button type="text" icon={<EditOutlined className="text-blue-500" />} onClick={() => showModal(promotion)}>Sửa</Button>,
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(promotion.id)}>Xóa</Button>
                      ]}
                    >
                      <div className="p-2">
                        <Title level={4} className="mb-2 text-blue-600 line-clamp-1">{promotion.title}</Title>
                        
                        <div className="flex items-center mb-3">
                          <TagOutlined className="mr-2 text-orange-500" />
                          <Tag color="orange" className="mr-0 px-3 py-1 text-base">
                            {promotion.code}
                          </Tag>
                        </div>
                        
                        <Paragraph className="text-gray-600 mb-3" ellipsis={{ rows: 2 }}>
                          {promotion.description}
                        </Paragraph>
                        
                        <Divider className="my-2" />
                        
                        <div className="flex items-center text-gray-500">
                          <ClockCircleOutlined className="mr-2 text-blue-400" />
                          <Text>
                            Đến {dayjs(promotion.endDate).format('DD/MM/YYYY')}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}

                {activePromotions.length === 0 && (
                  <Col span={24} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <GiftOutlined style={{ fontSize: '3rem' }} className="text-gray-300 mb-4" />
                      <Text className="text-gray-500 text-lg">Chưa có ưu đãi nào đang áp dụng</Text>
                      <Button 
                        type="primary" 
                        className="mt-4" 
                        icon={<PlusOutlined />} 
                        onClick={handleAdd}
                      >
                        Thêm ưu đãi mới
                      </Button>
                    </div>
                  </Col>
                )}
              </Row>
            </TabPane>
          </Tabs>
        </div>

        <Modal
          title={
            <div className="flex items-center">
              <GiftOutlined className="mr-2 text-red-500 text-xl" />
              <span>{currentPromotion ? "Chỉnh sửa ưu đãi" : "Thêm ưu đãi mới"}</span>
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          className="promotion-modal"
          destroyOnClose
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              discountType: 'percent',
              isActive: true
            }}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="title"
                  label="Tiêu đề"
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                >
                  <Input placeholder="Nhập tiêu đề ưu đãi" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                >
                  <TextArea rows={4} placeholder="Mô tả chi tiết về ưu đãi" />
                </Form.Item>

                <Form.Item
                  name="code"
                  label="Mã giảm giá"
                  rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá!' }]}
                >
                  <Input placeholder="Nhập mã giảm giá (VD: SUMMER2023)" />
                </Form.Item>

                <Form.Item label="Giá trị ưu đãi" required>
                  <Input.Group compact>
                    <Form.Item
                      name="discountType"
                      noStyle
                    >
                      <Input.Group compact>
                        <Form.Item name="discountType" noStyle>
                          <select className="border border-gray-300 rounded-l px-3 py-1 outline-none h-[32px]">
                            <option value="percent">Phần trăm (%)</option>
                            <option value="amount">Số tiền (VNĐ)</option>
                          </select>
                        </Form.Item>
                        <Form.Item 
                          name="discountValue" 
                          noStyle
                          rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}
                        >
                          <Input
                            className="w-32" 
                            placeholder="Giá trị"
                            type="number"
                          />
                        </Form.Item>
                      </Input.Group>
                    </Form.Item>
                  </Input.Group>
                </Form.Item>

                <Form.Item
                  name="dateRange"
                  label="Thời gian áp dụng"
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng!' }]}
                >
                  <DatePicker.RangePicker 
                    className="w-full"
                    format="DD/MM/YYYY"
                    placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                  />
                </Form.Item>

                <Form.Item
                  name="isActive"
                  valuePropName="checked"
                >
                  <div className="flex items-center">
                    <Input
                      type="checkbox"
                      className="mr-2 h-4 w-4"
                      id="isActiveCheckbox"
                    />
                    <label htmlFor="isActiveCheckbox" className="cursor-pointer">Đang áp dụng</label>
                  </div>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Ảnh poster"
                  required
                  help="Kích thước đề xuất: 800x400px"
                >
                  <div className="text-center">
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onChange={handlePosterChange}
                      customRequest={customUploadRequest}
                      maxCount={1}
                    >
                      {fileList.length >= 1 ? null : (
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>Tải lên</div>
                        </div>
                      )}
                    </Upload>
                    
                    {posterUrl && (
                      <div className="mt-2">
                        <Image
                          src={posterUrl}
                          alt="Poster preview"
                          style={{ maxWidth: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item className="mb-0 flex justify-end mt-4">
              <Button onClick={handleCancel} className="mr-2">
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-500">
                {currentPromotion ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default PromotionPage;
