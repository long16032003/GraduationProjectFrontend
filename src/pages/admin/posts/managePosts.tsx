import React, { useState } from 'react';
import { 
  Button, 
  Space, 
  Card, 
  Input, 
  Modal, 
  Form, 
  message, 
  Table, 
  Typography,
  Tag,
  Tooltip,
  Row,
  Col,
  Statistic,
  Select,
  Tabs,
  Avatar,
  Divider,
  Spin,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  EyeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  FilterOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { CanAccess, useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import dayjs from 'dayjs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import type { Post } from '@/types';
import { NoPermission } from '@/components/NoPermission';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

// Custom CSS for card layout
const cardStyles = `
  .blog-card {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 1px solid #f0f0f0;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  }
  
  .blog-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: #1890ff;
  }
  
  .card-image {
    transition: transform 0.5s ease;
    position: relative;
    overflow: hidden;
  }
  
  .blog-card:hover .card-image img {
    transform: scale(1.1);
  }
`;

const ManagePosts: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: listPosts, isLoading: isLoadingList } = useList<Post>({
    resource: 'posts',
  });

  const { mutate: createPost, isLoading: isCreating } = useCreate<Post>();
  const { mutate: deletePost, isLoading: isDeleting } = useDelete<Post>();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdate<Post>();

  // Filter posts based on search text
  const filteredPosts = listPosts?.data?.filter(post => {
    const matchesSearch = searchText === '' || 
      post.title.toLowerCase().includes(searchText.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesSearch;
  }) || [];

  // Statistics
  const totalPosts = listPosts?.data?.length || 0;
  const recentPosts = listPosts?.data?.filter(post => 
    dayjs().diff(dayjs(post.created_at), 'day') <= 7
  ).length || 0;

  const handleSubmit = async (values: { title: string; summary: string; content: string }) => {
    try {
      if (editingPost) {
        await updatePost(
          {
            resource: 'posts',
            id: editingPost.id,
            values: values,
          },
          {
            onSuccess: () => {
              message.success('Cập nhật bài viết thành công');
              setIsModalVisible(false);
              form.resetFields();
            },
            onError: (error) => {
              message.error(error?.message || 'Có lỗi xảy ra khi cập nhật bài viết');
            },
          },
        );
      } else {
        console.log(values);
        await createPost(
          {
            resource: 'posts',
            values: values,
          },
          {
            onSuccess: () => {
              message.success('Thêm bài viết thành công');
              setIsModalVisible(false);
              form.resetFields();
            },
            onError: (error) => {
              message.error(error?.message || 'Có lỗi xảy ra khi thêm bài viết');
            },
          },
        );
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại';
      message.error(errorMessage);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingPost(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Post) => {
    setEditingPost(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingPost(null);
    form.resetFields();
  };

  const showDeleteConfirm = (record: Post) => {
    Modal.confirm({
      title: 'Xóa bài viết',
      content: `Bạn có chắc chắn muốn xóa bài viết "${record.title}"?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => {
        deletePost({
          resource: 'posts',
          id: record.id,
        });
      },
    });
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Helper function to strip HTML tags
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Helper function to extract first image from HTML content
  const extractImageFromContent = (html: string): string | null => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.src : null;
  };

  // Helper function to get random placeholder image
  const getPlaceholderImage = (id: number): string => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    ];
    const gradient = gradients[id % gradients.length];
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><defs><linearGradient id="grad${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23${gradient.slice(7, 13)};stop-opacity:1" /><stop offset="100%" style="stop-color:%23${gradient.slice(-7, -1)};stop-opacity:1" /></linearGradient></defs><rect width="400" height="240" fill="url(%23grad${id})"/><text x="200" y="120" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">Blog Post ${id}</text></svg>`;
  };

  // Table columns
  const columns: ColumnsType<Post> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (title: string) => (
        <div className="flex items-center space-x-2">
          <FileTextOutlined className="text-blue-500" />
          <span className="font-medium">{truncateText(title, 50)}</span>
        </div>
      ),
    },
    {
      title: 'Tóm tắt',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      width: 200,
      render: (summary: string) => (
        <Text type="secondary">{truncateText(summary, 80)}</Text>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: 200,
      ellipsis: true,
      render: (content: string) => (
        <Text type="secondary">{truncateText(stripHtml(content), 60)}</Text>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      render: (date: string) => (
        <div className="flex items-center space-x-1">
          <CalendarOutlined className="text-gray-400" />
          <span>{dayjs(date).format('DD/MM/YYYY')}</span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      render: () => (
        <Tag color="green">Hoạt động</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                Modal.info({
                  title: record.title,
                  content: (
                    <div className="mt-4">
                      <p><strong>Tóm tắt:</strong></p>
                      <p className="mb-4">{record.summary}</p>
                      <p><strong>Nội dung:</strong></p>
                      <div 
                        className="max-h-64 overflow-y-auto border rounded p-3"
                        dangerouslySetInnerHTML={{ __html: record.content }}
                      />
                    </div>
                  ),
                  width: 800,
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'color',
    'background',
    'align',
    'link',
    'image',
  ];

  return (
    <CanAccess
      resource='post'
      action='create'
      fallback={<NoPermission />}
    >
      <style>{cardStyles}</style>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} style={{ color: '#ea580c' }}>
                Quản lý bài viết
              </Title>
              <Text type="secondary" className="text-lg">
                Tạo, chỉnh sửa và quản lý các bài viết trên website một cách chuyên nghiệp
              </Text>
            </div>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className="shadow-lg transition-shadow duration-300 h-12 px-8 rounded-xl"
            >
              Thêm bài viết mới
            </Button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={10}>
              <div className="relative">
                <Input.Search
                  placeholder="🔍 Tìm kiếm bài viết..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={setSearchText}
                  allowClear
                  size="large"
                  className="rounded-xl"
                />
              </div>
            </Col>
            {/* <Col xs={24} md={5}>
              <Select
                placeholder="📂 Trạng thái"
                value={selectedStatus}
                onChange={setSelectedStatus}
                className="w-full"
                size="large"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">🔍 Tất cả</Option>
                <Option value="active">✅ Hoạt động</Option>
                <Option value="inactive">❌ Ẩn</Option>
              </Select>
            </Col> */}
            <Col xs={24} md={4}>
              <Select
                placeholder="📊 Sắp xếp"
                defaultValue="newest"
                className="w-full"
                size="large"
              >
                <Option value="newest">🕒 Mới nhất</Option>
                <Option value="oldest">⏰ Cũ nhất</Option>
                <Option value="title">🔤 Tên A-Z</Option>
              </Select>
            </Col>
            <Col xs={24} md={10}>
              <div className="flex justify-end">
                <Button.Group size="large">
                  <Button
                    type={viewMode === 'table' ? 'primary' : 'default'}
                    icon={<BarsOutlined />}
                    onClick={() => setViewMode('table')}
                    className="rounded-l-xl"
                  >
                    Bảng
                  </Button>
                  <Button
                    type={viewMode === 'card' ? 'primary' : 'default'}
                    icon={<AppstoreOutlined />}
                    onClick={() => setViewMode('card')}
                    className="rounded-r-xl"
                  >
                    Thẻ
                  </Button>
                </Button.Group>
              </div>
            </Col>
          </Row>
        </div>

        {/* Main Content */}
        <div className="min-h-[500px]">
          {/* Content */}
          <Spin spinning={isLoadingList}>
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12">
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <h3 className="text-lg font-medium text-gray-500 mb-2">
                        Không tìm thấy bài viết nào
                      </h3>
                      <p className="text-gray-400">
                        Hãy thử thay đổi từ khóa tìm kiếm hoặc tạo bài viết mới
                      </p>
                    </div>
                  }
                />
              </div>
            ) : viewMode === 'table' ? (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <Table
                  columns={columns}
                  dataSource={filteredPosts}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} của ${total} bài viết`,
                  }}
                  className="border-0"
                  scroll={{ x: 1200 }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPosts.map((post: Post) => {
                  const imageUrl = extractImageFromContent(post.content) || getPlaceholderImage(Number(post.id));
                  return (
                    <div
                      key={post.id}
                      className="blog-card bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
                    >
                      {/* Image Section */}
                      <div className="card-image relative h-48 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getPlaceholderImage(Number(post.id));
                          }}
                        />
                        {/* <div className="absolute top-3 right-3">
                          <Tag color="green" className="font-medium shadow-sm">
                            ✅ Hoạt động
                          </Tag>
                        </div> */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <div className="flex items-center space-x-2">
                            <CalendarOutlined />
                            <span>{dayjs(post.created_at).format('DD/MM/YYYY')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <UserOutlined />
                            <span>{post.creator?.name}</span>
                          </div>
                        </div>
                        
                        {/* Reading Time & ID */}
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                          <div className="flex items-center space-x-1">
                            <FileTextOutlined />
                            <span>#{post.id}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                          {post.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {post.summary}
                        </p>

                        {/* Content Preview */}
                        <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">
                          {truncateText(stripHtml(post.content), 120)}
                        </p>
                        
                        {/* Status Bar */}
                        <div className="flex items-center justify-between text-xs mb-4">
                          {/* <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Đã xuất bản
                            </span>
                          </div> */}
                          <div className="text-gray-400">
                            {Math.floor(Math.random() * 100) + 20} lượt xem
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-2">
                          <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 flex-1"
                            onClick={() => {
                              Modal.info({
                                title: (
                                  <div className="flex items-center space-x-2">
                                    <FileTextOutlined className="text-blue-500" />
                                    <span>{post.title}</span>
                                  </div>
                                ),
                                content: (
                                  <div className="mt-4">
                                    {imageUrl && (
                                      <img
                                        src={imageUrl}
                                        alt={post.title}
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                      />
                                    )}
                                    <div className="mb-4">
                                      <h4 className="font-semibold mb-2">Tóm tắt:</h4>
                                      <p className="text-gray-600">{post.summary}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Nội dung:</h4>
                                      <div 
                                        className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50"
                                        dangerouslySetInnerHTML={{ __html: post.content }}
                                      />
                                    </div>
                                  </div>
                                ),
                                width: 900,
                                centered: true,
                              });
                            }}
                          >
                            Xem
                          </Button>
                          
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex-1"
                            onClick={() => handleEdit(post)}
                          >
                            Sửa
                          </Button>
                          
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            className="hover:bg-red-50 flex-1"
                            onClick={() => showDeleteConfirm(post)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Spin>
        </div>

        {/* Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <FileTextOutlined className="mr-2" />
              {editingPost ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={1200}
          className="top-4"
        >
          <Divider />
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{}}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="title"
                  label="Tiêu đề bài viết"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tiêu đề' },
                    { max: 200, message: 'Tiêu đề không được quá 200 ký tự' },
                  ]}
                >
                  <Input 
                    placeholder="Nhập tiêu đề bài viết"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="summary"
                  label="Tóm tắt bài viết"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tóm tắt' },
                    { max: 500, message: 'Tóm tắt không được quá 500 ký tự' },
                  ]}
                >
                  <Input.TextArea 
                    rows={4} 
                    placeholder="Nhập tóm tắt ngắn gọn về bài viết"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="content"
              label="Nội dung bài viết"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
            >
              <ReactQuill
                theme="snow"
                modules={modules}
                formats={formats}
                style={{ height: '400px', marginBottom: '60px' }}
                placeholder="Nhập nội dung chi tiết bài viết..."
              />
            </Form.Item>

            <Form.Item className="mb-0 pt-4">
              <div className="flex justify-end space-x-3">
                <Button size="large" onClick={handleCancel}>
                  Hủy bỏ
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={isCreating || isUpdating}
                  icon={editingPost ? <EditOutlined /> : <PlusOutlined />}
                >
                  {editingPost ? 'Cập nhật bài viết' : 'Thêm bài viết mới'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </CanAccess>
  );
};

export default ManagePosts;
