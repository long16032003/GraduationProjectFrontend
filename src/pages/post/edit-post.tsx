import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Typography, Breadcrumb, Space, Row, Col, Select, Upload, Spin, Alert } from 'antd';
import { HomeOutlined, SaveOutlined, EyeOutlined, InboxOutlined, ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useUpdate, useOne, useGo } from '@refinedev/core';
import { Link, useParams } from 'react-router';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import type { Post, Staff } from '@/types';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const EditPost: React.FC = () => {
  const { id } = useParams();
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
  
  const { mutate: updatePost, isLoading: isUpdating } = useUpdate<Post>();
  const { data: postData, isLoading: isLoadingPost, error } = useOne<Post>({
    resource: 'posts',
    id: id || '',
  });
  
  const go = useGo();
  const user = use$(auth$.user) as Staff;
  const post = postData?.data;

  // Kiểm tra quyền chỉnh sửa
  const canEdit = post && (user?.id === post.creator_id || (user as any)?.role === 'admin');

  // Load dữ liệu bài viết vào form
  useEffect(() => {
    if (post) {
      form.setFieldsValue({
        title: post.title,
        summary: post.summary,
        status: post.status || 'published'
      });
      setContent(post.content);
    }
  }, [post, form]);

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

    if (!id) {
      message.error('Không tìm thấy ID bài viết');
      return;
    }

    try {
      await updatePost({
        resource: 'posts',
        id: id,
        values: {
          ...values,
          content: content,
        }
      }, {
        onSuccess: () => {
          message.success('Cập nhật bài viết thành công!');
          go({ to: `/posts/${id}`, type: 'replace' });
        },
        onError: (error) => {
          message.error(error?.message || 'Có lỗi xảy ra khi cập nhật bài viết');
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
        creator: post?.creator || user as Staff,
        created_at: post?.created_at || new Date().toISOString()
      });
      setPreviewVisible(true);
    }).catch(() => {
      message.warning('Vui lòng điền đầy đủ thông tin trước khi xem trước');
    });
  };

  // Xử lý upload ảnh
  const handleImageUpload = {
    name: 'file',
    multiple: false,
    action: '/api/upload',
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
    onChange: (info: { file: { status?: string } }) => {
      if (info.file.status === 'uploading') {
        setUploading(true);
      }
      if (info.file.status === 'done') {
        setUploading(false);
        message.success('Upload ảnh thành công!');
      }
      if (info.file.status === 'error') {
        setUploading(false);
        message.error('Upload ảnh thất bại!');
      }
    },
  };

  // Loading state
  if (isLoadingPost) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Spin size="large" />
            <div className="mt-4 text-gray-500">Đang tải bài viết...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <Alert
            message="Lỗi"
            description="Không tìm thấy bài viết hoặc có lỗi xảy ra"
            type="error"
            showIcon
            action={
              <Link to="/posts">
                <Button size="small">Quay lại danh sách</Button>
              </Link>
            }
          />
        </div>
      </MainLayout>
    );
  }

  // Permission check
  if (!canEdit) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <Alert
            message="Không có quyền truy cập"
            description="Bạn không có quyền chỉnh sửa bài viết này"
            type="warning"
            showIcon
            action={
              <Link to="/posts">
                <Button size="small">Quay lại danh sách</Button>
              </Link>
            }
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
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
                title: <Link to={`/posts/${id}`}>{post.title}</Link>,
              },
              {
                title: <span className="text-orange-500 font-medium">Chỉnh sửa</span>,
              },
            ]}
          />

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link to={`/posts/${id}`}>
                <Button icon={<ArrowLeftOutlined />} className="flex items-center">
                  Quay lại
                </Button>
              </Link>
              <div>
                <Title level={2} className="!mb-1 text-gray-800">
                  <EditOutlined className="mr-2" />
                  Chỉnh sửa bài viết
                </Title>
                <Text type="secondary" className="text-base">
                  Cập nhật nội dung bài viết "{post.title}"
                </Text>
              </div>
            </div>
            
            {/* Post info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <Text type="secondary">Tác giả:</Text>
                  <div className="font-medium">{post.creator?.name}</div>
                </div>
                <div>
                  <Text type="secondary">Ngày tạo:</Text>
                  <div className="font-medium">
                    {new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Trạng thái hiện tại:</Text>
                  <div className="font-medium">
                    {post.status === 'published' ? '✅ Đã xuất bản' : 
                     post.status === 'locked' ? '🔒 Đã khóa' : 
                     '📝 Bản nháp'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Row gutter={24}>
            {/* Form chính */}
            <Col xs={24} lg={16}>
              <Card className="shadow-sm">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
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
                      placeholder="Chỉnh sửa nội dung bài viết..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="status"
                    label={<span className="font-medium">Trạng thái</span>}
                  >
                    <Select size="large">
                      <Select.Option value="published">Xuất bản</Select.Option>
                      <Select.Option value="draft">Lưu nháp</Select.Option>
                      <Select.Option value="locked">Khóa bài viết</Select.Option>
                    </Select>
                  </Form.Item>

                  {/* Action buttons */}
                  <Form.Item className="mb-0">
                    <Space size="middle">
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={isUpdating}
                        icon={<SaveOutlined />}
                        size="large"
                        className="bg-orange-500 hover:bg-orange-600 border-orange-500"
                      >
                        {isUpdating ? 'Đang cập nhật...' : 'Cập nhật bài viết'}
                      </Button>
                      
                      <Button 
                        icon={<EyeOutlined />}
                        onClick={handlePreview}
                        size="large"
                      >
                        Xem trước
                      </Button>
                      
                      <Link to={`/posts/${id}`}>
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
                {/* Lịch sử thay đổi */}
                <Card title="📝 Thông tin bài viết" size="small">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID bài viết:</span>
                      <span className="font-medium">#{post.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày tạo:</span>
                      <span className="font-medium">
                        {new Date(post.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tác giả:</span>
                      <span className="font-medium">{post.creator?.name}</span>
                    </div>
                  </div>
                </Card>

                {/* Tips */}
                <Card title="💡 Mẹo chỉnh sửa bài viết" size="small">
                  <ul className="text-sm text-gray-600 space-y-2 pl-4">
                    <li>• Kiểm tra lại chính tả và ngữ pháp</li>
                    <li>• Cập nhật thông tin mới nhất</li>
                    <li>• Thêm hình ảnh minh họa nếu cần</li>
                    <li>• Xem trước trước khi lưu</li>
                    <li>• Chọn trạng thái phù hợp</li>
                  </ul>
                </Card>

                {/* Upload ảnh */}
                <Card title="📸 Upload ảnh" size="small">
                  <Dragger {...handleImageUpload} className="!border-dashed !border-orange-300 hover:!border-orange-500">
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined className="text-orange-500" />
                    </p>
                    <p className="ant-upload-text">Kéo thả hoặc click để upload</p>
                    <p className="ant-upload-hint text-xs">
                      Hỗ trợ: JPG, PNG, GIF. Tối đa 5MB
                    </p>
                  </Dragger>
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
                Tác giả: {previewData.creator?.name} • {new Date(previewData.created_at).toLocaleDateString('vi-VN')}
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

export default EditPost; 