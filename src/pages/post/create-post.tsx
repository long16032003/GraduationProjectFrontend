import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography, Breadcrumb, Space, Row, Col, Select, Upload, Image, type UploadFile } from 'antd';
import { HomeOutlined, SaveOutlined, EyeOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { useCreate, useGo } from '@refinedev/core';
import { Link } from 'react-router';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import type { Post, Staff } from '@/types';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';
import type { UploadProps } from 'antd/lib';
import type { UploadChangeParam } from 'antd/lib/upload/interface';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const CreatePost: React.FC = () => {
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<{
    title: string;
    summary: string;
    content: string;
    creator: Staff;
    created_at: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const { mutate: createPost, isLoading } = useCreate<Post>();
  const go = useGo();
  const user = auth$.user.peek();

  // Cấu hình ReactQuill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align', 'color', 'background'
  ];

  // Xử lý submit form
  const handleSubmit = async (values: { title: string; summary: string; status: string }) => {
    if (!content.trim()) {
      message.error('Vui lòng nhập nội dung bài viết');
      return;
    }

    try {
      await createPost({
        resource: 'posts',
        values: {
          ...values,
          content: content,
          status: 'published'
        }
      }, {
        onSuccess: () => {
          message.success('Tạo bài viết thành công!');
          go({ to: '/posts', type: 'replace' });
        },
        onError: (error) => {
          message.error(error?.message || 'Có lỗi xảy ra khi tạo bài viết');
        }
      });
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  // Xử lý preview
  const handlePreview = () => {
    form.validateFields().then(values => {
      setPreviewData({
        ...values,
        content: content,
        creator: user,
        created_at: new Date().toISOString()
      });
      setPreviewVisible(true);
    }).catch(() => {
      message.warning('Vui lòng điền đầy đủ thông tin trước khi xem trước');
    });
  };

  // Xử lý upload ảnh
  const handleImageUpload: UploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/upload', // Thay đổi theo API upload của bạn
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ được upload file ảnh!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Ảnh phải nhỏ hơn 5MB!');
        return false;
      }
      return true;
    },
    onChange: (info: UploadChangeParam<UploadFile>) => {
      if (info.file.status === 'uploading') {
        setUploading(true);
      }
      if (info.file.status === 'done') {
        setUploading(false);
        message.success('Upload ảnh thành công!');
        // Có thể insert ảnh vào editor ở đây
      }
      if (info.file.status === 'error') {
        setUploading(false);
        message.error('Upload ảnh thất bại!');
      }
    },
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <Breadcrumb 
            className="mb-6"
            items={[
              {
                title: (
                  <Link to="/" className="flex items-center">
                    <HomeOutlined className="mr-1" />
                    Trang chủ
                  </Link>
                ),
              },
              {
                title: <Link to="/posts">Bài viết</Link>,
              },
              {
                title: <span className="text-orange-500 font-medium">Tạo bài viết mới</span>,
              },
            ]}
          />

          {/* Header */}
          <div className="mb-8">
            <Title level={2} className="!mb-2 text-gray-800">
              ✍️ Tạo bài viết mới
            </Title>
            <Text type="secondary" className="text-base">
              Chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng
            </Text>
          </div>

          <Row gutter={24}>
            {/* Form chính */}
            <Col xs={24} lg={16}>
              <Card className="shadow-sm">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={{
                    status: 'published'
                  }}
                >
                  <Form.Item
                    name="title"
                    label={<span className="font-medium">Tiêu đề bài viết</span>}
                    rules={[
                      { required: true, message: 'Vui lòng nhập tiêu đề' },
                      { min: 10, message: 'Tiêu đề phải có ít nhất 10 ký tự' },
                      { max: 200, message: 'Tiêu đề không được quá 200 ký tự' }
                    ]}
                  >
                    <Input 
                      placeholder="Nhập tiêu đề hấp dẫn cho bài viết của bạn..."
                      size="large"
                      showCount
                      maxLength={200}
                    />
                  </Form.Item>

                  <Form.Item
                    name="summary"
                    label={<span className="font-medium">Tóm tắt</span>}
                    rules={[
                      { required: true, message: 'Vui lòng nhập tóm tắt' },
                      { min: 20, message: 'Tóm tắt phải có ít nhất 20 ký tự' },
                      { max: 500, message: 'Tóm tắt không được quá 500 ký tự' }
                    ]}
                  >
                    <TextArea 
                      rows={4}
                      placeholder="Nhập tóm tắt ngắn gọn về nội dung bài viết..."
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-medium">Nội dung bài viết</span>}
                    required
                  >
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      modules={modules}
                      formats={formats}
                      style={{ 
                        height: '400px', 
                        marginBottom: '50px',
                        backgroundColor: 'white'
                      }}
                      placeholder="Bắt đầu viết nội dung bài viết của bạn..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="status"
                    label={<span className="font-medium">Trạng thái</span>}
                  >
                    <Select size="large">
                      <Select.Option value="published">Xuất bản ngay</Select.Option>
                      <Select.Option value="draft">Lưu nháp</Select.Option>
                    </Select>
                  </Form.Item>

                  {/* Action buttons */}
                  <Form.Item className="mb-0">
                    <Space size="middle">
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={isLoading}
                        icon={<SaveOutlined />}
                        size="large"
                        className="bg-orange-500 hover:bg-orange-600 border-orange-500"
                      >
                        {isLoading ? 'Đang tạo...' : 'Tạo bài viết'}
                      </Button>
                      
                      <Button 
                        icon={<EyeOutlined />}
                        onClick={handlePreview}
                        size="large"
                      >
                        Xem trước
                      </Button>
                      
                      <Link to="/posts">
                        <Button size="large">
                          Hủy
                        </Button>
                      </Link>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            {/* Sidebar */}
            <Col xs={24} lg={8}>
              <Space direction="vertical" size="large" className="w-full">
                {/* Tips */}
                <Card title="💡 Mẹo viết bài hay" size="small">
                  <ul className="text-sm text-gray-600 space-y-2 pl-4">
                    <li>• Tiêu đề ngắn gọn, thu hút</li>
                    <li>• Tóm tắt súc tích, đầy đủ ý chính</li>
                    <li>• Nội dung có cấu trúc rõ ràng</li>
                    <li>• Sử dụng hình ảnh minh họa</li>
                    <li>• Kiểm tra chính tả trước khi đăng</li>
                  </ul>
                </Card>

                {/* Upload ảnh - Phát triển sau */}
                {/* <Card title="📸 Upload ảnh" size="small">
                  <Dragger {...handleImageUpload} className="!border-dashed !border-orange-300 hover:!border-orange-500">
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined className="text-orange-500" />
                    </p>
                    <p className="ant-upload-text">Kéo thả hoặc click để upload</p>
                    <p className="ant-upload-hint text-xs">
                      Hỗ trợ: JPG, PNG, GIF. Tối đa 5MB
                    </p>
                  </Dragger>
                </Card> */}

                {/* Thống kê */}
                <Card title="📊 Thống kê" size="small">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số từ:</span>
                      <span className="font-medium">{content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ký tự:</span>
                      <span className="font-medium">{content.replace(/<[^>]*>/g, '').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian đọc:</span>
                      <span className="font-medium">
                        ~{Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, '').split(' ').length / 200))} phút
                      </span>
                    </div>
                  </div>
                </Card>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* Preview Modal */}
      {previewVisible && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <Title level={4} className="!mb-0">👀 Xem trước bài viết</Title>
              <Button onClick={() => setPreviewVisible(false)}>Đóng</Button>
            </div>
            <div className="p-6">
              <Title level={2} className="!mb-4">{previewData.title}</Title>
              <div className="text-gray-500 mb-4">
                Tác giả: {previewData.creator?.name} • {new Date().toLocaleDateString('vi-VN')}
              </div>
              <div className="bg-orange-50 p-4 rounded-lg mb-6">
                <Text className="text-gray-700 italic">{previewData.summary}</Text>
              </div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: previewData.content }}
              />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default CreatePost; 