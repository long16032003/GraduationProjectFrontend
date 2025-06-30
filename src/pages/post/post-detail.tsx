import React from 'react';
import { useOne, useList } from '@refinedev/core';
import { Typography, Breadcrumb, Spin, Card, Row, Col, Avatar, Button, Tag, Space } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  EditOutlined,
  ReadOutlined,
  FieldTimeOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Link, useParams } from 'react-router';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';
import type { Customer, Post, Staff } from '@/types';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';
import { Result } from 'antd/lib';

const { Title, Text, Paragraph } = Typography;

// Utility function để lấy ảnh đầu tiên từ HTML content
const getFirstImageFromContent = (content: string): string | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const images = doc.querySelectorAll('img');
  
  for (const img of images) {
    if (img.className.toLowerCase().includes('icon')) continue;
    
    const width = parseInt(img.getAttribute('width') || '0');
    const height = parseInt(img.getAttribute('height') || '0');
    if (width > 0 && width < 100) continue;
    if (height > 0 && height < 100) continue;

    if (img.src.toLowerCase().includes('icon')) continue;
    
    return img.src;
  }
  
  return null;
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80';

const PostDetail: React.FC = () => {
  const { id } = useParams();
  const { data, isLoading } = useOne<Post>({
    resource: 'posts',
    id: id || '',
  });

  const { data: relatedData } = useList<Post>({
    resource: 'posts',
    filters: [{ field: 'id', operator: 'ne', value: id }],
    pagination: { pageSize: 4 },
    sorters: [{ field: 'created_at', order: 'desc' }],
  });

  const post = data?.data;
  const relatedPosts = relatedData?.data || [];

  const user = use$(auth$.user) as Staff;

  // Kiểm tra quyền edit của user với post
  const canEdit = user?.id === post?.creator_id || user?.role === 'admin';

  // Tính toán thời gian đọc (ước tính)
  const estimateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-4 text-gray-600">Đang tải bài viết...</div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-center min-h-[70vh]">
            <Result
              status="404"
              title="Không tìm thấy bài viết"
              subTitle="Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
              extra={
                <Link to="/posts">
                  <Button type="primary">
                    Quay lại danh sách
                  </Button>
                </Link>
              }
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  const featuredImage = getFirstImageFromContent(post.content) || DEFAULT_IMAGE;
  const readingTime = estimateReadingTime(post.content);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Back Button & Breadcrumb */}
              <div className="flex items-center space-x-4">
                <Link to="/posts">
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    type="text" 
                    className="flex items-center hover:bg-gray-100"
                  >
                    Quay lại
                  </Button>
                </Link>
                <Breadcrumb 
                  separator="/"
                  items={[
                    {
                      title: <Link to="/" className="text-gray-500 hover:text-orange-500">Trang chủ</Link>,
                    },
                    {
                      title: <Link to="/posts" className="text-gray-500 hover:text-orange-500">Bài viết</Link>,
                    },
                    {
                      title: <span className="text-gray-800">Chi tiết</span>,
                    },
                  ]}
                />
              </div>

              {/* Edit Button (only for authorized users) */}
              {canEdit && (
                <Link to={`/posts/edit/${post.id}`}>
                  <Button type="primary" icon={<EditOutlined />}>
                    Chỉnh sửa
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Row gutter={[32, 32]}>
            {/* Main Content */}
            <Col xs={24} lg={16}>
              {/* Article Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                {/* Featured Image */}
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img 
                    src={featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    {post.status === 'locked' ? (
                      <Tag color="red" className="px-3 py-1">Đã khóa</Tag>
                    ) : (
                      <Tag color="green" className="px-3 py-1">Đã xuất bản</Tag>
                    )}
                  </div>
                </div>

                {/* Article Info */}
                <div className="p-8">
                  <Title level={1} className="!mb-4 !text-3xl lg:!text-4xl !leading-tight">
                    {post.title}
                  </Title>

                  <Paragraph className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {post.summary}
                  </Paragraph>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <Avatar 
                        size={48}
                        icon={<UserOutlined />}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{post.creator?.name}</div>
                        <div className="text-sm text-gray-500">Tác giả</div>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-500">
                      <CalendarOutlined className="mr-2" />
                      <span>{dayjs(post.created_at).format('DD/MM/YYYY')}</span>
                    </div>

                    <div className="flex items-center text-gray-500">
                      <ClockCircleOutlined className="mr-2" />
                      <span>{readingTime} phút đọc</span>
                    </div>

                    <div className="flex items-center text-gray-500">
                      <EyeOutlined className="mr-2" />
                      <span>Bài viết thông tin</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <Card className="rounded-2xl shadow-sm border border-gray-200">
                <div className="prose prose-lg max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    className="prose prose-headings:text-gray-900 prose-headings:font-semibold
                      prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-base
                      prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                      prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto prose-img:my-6
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                      prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                      prose-pre:bg-gray-900 prose-pre:text-white prose-pre:rounded-lg prose-pre:p-4
                      prose-ul:list-disc prose-ol:list-decimal
                      prose-li:text-gray-700 prose-li:leading-relaxed"
                  />
                </div>
              </Card>

              {/* Author Bio */}
              <Card className="mt-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-start space-x-4">
                  <Avatar 
                    size={64}
                    icon={<UserOutlined />}
                    className="flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <Title level={4} className="!mb-2">
                      {post.creator?.name}
                    </Title>
                    <Text className="text-gray-600 block mb-3">
                      Tác giả • Thành viên từ {dayjs(post.created_at).format('YYYY')}
                    </Text>
                    <Paragraph className="text-gray-700 mb-0">
                      Người viết bài chia sẻ thông tin và tin tức về nhà hàng, 
                      mang đến những thông tin hữu ích cho khách hàng.
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Sidebar */}
            <Col xs={24} lg={8}>
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <Card className="rounded-2xl shadow-sm border border-gray-200">
                  <Title level={5} className="!mb-6 flex items-center">
                    <ReadOutlined className="mr-2 text-orange-500" />
                    Bài viết khác
                  </Title>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => {
                      const relatedImage = getFirstImageFromContent(relatedPost.content) || DEFAULT_IMAGE;
                      return (
                        <Link 
                          key={relatedPost.id} 
                          to={`/posts/${relatedPost.id}`}
                          className="block group"
                        >
                          <div className="flex space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={relatedImage}
                                alt={relatedPost.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <Title 
                                level={5} 
                                className="!mb-1 !text-sm line-clamp-2 group-hover:text-orange-600 transition-colors"
                              >
                                {relatedPost.title}
                              </Title>
                              <div className="flex items-center text-xs text-gray-500">
                                <FieldTimeOutlined className="mr-1" />
                                {dayjs(relatedPost.created_at).format('DD/MM/YYYY')}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Link to="/posts">
                      <Button type="primary" block className="rounded-lg">
                        Xem tất cả bài viết
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}

              {/* Restaurant Info */}
              <Card className="mt-6 rounded-2xl shadow-sm border border-gray-200">
                <Title level={5} className="!mb-4">Thông tin nhà hàng</Title>
                <div className="space-y-4">
                  <div className="text-gray-700">
                    <div className="font-medium mb-1">Địa chỉ:</div>
                    <div className="text-sm">123 Đường ABC, Quận XYZ, TP.HCM</div>
                  </div>
                  <div className="text-gray-700">
                    <div className="font-medium mb-1">Giờ mở cửa:</div>
                    <div className="text-sm">10:00 - 22:00 (Hàng ngày)</div>
                  </div>
                  <div className="text-gray-700">
                    <div className="font-medium mb-1">Liên hệ:</div>
                    <div className="text-sm">0123 456 789</div>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <Link to="/reservations">
                      <Button type="primary" block className="bg-orange-500 hover:bg-orange-600">
                        Đặt bàn ngay
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostDetail;
