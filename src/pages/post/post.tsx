import React from 'react';
import { Typography, Spin, Empty, Avatar, Button, Tooltip } from 'antd';
import { CalendarOutlined, UserOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons';
import { useList } from '@refinedev/core';
import dayjs from 'dayjs';
import type { Post } from '@/types';
import { Link } from 'react-router';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';
import { Breadcrumb } from 'antd/lib';

const { Title } = Typography;

// Utility function để lấy ảnh đầu tiên từ HTML content (không phải icon)
const getFirstImageFromContent = (content: string): string | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const images = doc.querySelectorAll('img');
  
  // Lọc qua tất cả ảnh để tìm ảnh phù hợp
  for (const img of images) {
    // Bỏ qua ảnh có class chứa từ khóa icon
    if (img.className.toLowerCase().includes('icon')) continue;
    
    // Bỏ qua ảnh quá nhỏ (có thể là icon)
    const width = parseInt(img.getAttribute('width') || '0');
    const height = parseInt(img.getAttribute('height') || '0');
    if (width > 0 && width < 100) continue;
    if (height > 0 && height < 100) continue;

    // Bỏ qua ảnh có đường dẫn chứa từ khóa icon
    if (img.src.toLowerCase().includes('icon')) continue;
    
    return img.src;
  }
  
  return null;
};

const PostPage: React.FC = () => {
  const user = use$(auth$.user);
  const { data, isLoading } = useList<Post>({
    resource: 'posts',
    sorters: [{ field: 'created_at', order: 'desc' }],
  });

  const posts = data?.data || [];

  // Kiểm tra quyền edit của user với post
  const canEdit = (post: Post) => {
    return user?.id === post.creator_id || user?.role === 'admin';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!posts.length) {
    return (
      <MainLayout>
        <Empty description="Chưa có bài viết nào" />
      </MainLayout>
    );
  }

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);
  
  const featuredImage = getFirstImageFromContent(featuredPost.content);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
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
          ]}
        />

        {/* Featured Post */}
        <div className="relative mb-12">
          <Link to={`/posts/${featuredPost.id}`} className="block group">
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {featuredImage && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img 
                    src={featuredImage} 
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar 
                    size="large"
                    icon={<UserOutlined />}
                    src={featuredPost.creator?.avatar}
                    className="bg-orange-500"
                  />
                  <div>
                    <div className="font-medium text-gray-800">
                      {featuredPost.creator?.name}
                    </div>
                    <div className="text-gray-500 text-sm flex items-center gap-2">
                      <CalendarOutlined />
                      {dayjs(featuredPost.created_at).format('DD/MM/YYYY')}
                    </div>
                  </div>
                </div>
                
                <Title level={2} className="!text-2xl md:!text-3xl !mb-4 group-hover:text-orange-600 transition-colors">
                  {featuredPost.title}
                </Title>
                
                <p className="text-gray-600 text-lg mb-4 line-clamp-3">
                  {featuredPost.summary}
                </p>

                <span className="text-orange-600 font-medium inline-flex items-center group-hover:text-orange-700">
                  Đọc tiếp
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
          
          {/* Edit Button for Featured Post */}
          {canEdit(featuredPost) && (
            <Tooltip title="Chỉnh sửa bài viết">
              <Link 
                to={`/posts/edit/${featuredPost.id}`}
                className="absolute top-4 right-4 z-10"
              >
                <Button 
                  type="primary"
                  icon={<EditOutlined />}
                  className="!bg-white !text-orange-600 hover:!bg-orange-50"
                >
                  Chỉnh sửa
                </Button>
              </Link>
            </Tooltip>
          )}
        </div>

        {/* Other Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherPosts.map(post => {
            const thumbnailImage = getFirstImageFromContent(post.content);
            return (
              <div key={post.id} className="relative">
                <Link 
                  to={`/posts/${post.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow h-full overflow-hidden">
                    {thumbnailImage && (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img 
                          src={thumbnailImage} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar 
                          size="small"
                          icon={<UserOutlined />}
                          src={post.creator?.avatar}
                          className="bg-orange-500"
                        />
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <CalendarOutlined />
                          {dayjs(post.created_at).format('DD/MM/YYYY')}
                        </div>
                      </div>

                      <Title 
                        level={4} 
                        className="!mb-3 !text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors"
                      >
                        {post.title}
                      </Title>

                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {post.summary}
                      </p>

                      <span className="text-orange-600 text-sm font-medium inline-flex items-center group-hover:text-orange-700">
                        Đọc tiếp
                        <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Edit Button for Other Posts */}
                {canEdit(post) && (
                  <Tooltip title="Chỉnh sửa bài viết">
                    <Link 
                      to={`/posts/edit/${post.id}`}
                      className="absolute top-4 right-4 z-10"
                    >
                      <Button 
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        className="!bg-white !text-orange-600 hover:!bg-orange-50"
                      >
                        Chỉnh sửa
                      </Button>
                    </Link>
                  </Tooltip>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default PostPage;