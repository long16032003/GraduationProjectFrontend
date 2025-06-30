import React from 'react';
import { Typography, Spin, Empty, Avatar, Button, Tooltip, Divider, Tag, Dropdown, Modal, message } from 'antd';
import { CalendarOutlined, UserOutlined, EditOutlined, HomeOutlined, ReadOutlined, FieldTimeOutlined, FireOutlined, MoreOutlined, DeleteOutlined, LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useList, useDelete, useUpdate } from '@refinedev/core';
import dayjs from 'dayjs';
import type { Post, Staff } from '@/types';
import { Link } from 'react-router';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';
import { Breadcrumb } from 'antd/lib';
import type { MenuProps } from 'antd';

const { Title, Paragraph } = Typography;

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

// Placeholder image nếu không tìm thấy ảnh trong nội dung
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80';

const PostPage: React.FC = () => {
  const user = use$(auth$.user);
  const guard = use$(auth$.guard);
  console.log("guard: ",guard);
  const { data, isLoading, refetch } = useList<Post>({
    resource: 'posts',
    sorters: [{ field: 'created_at', order: 'desc' }],
  });

  const { mutate: deletePost } = useDelete<Post>();
  const { mutate: updatePost } = useUpdate<Post>();

  const posts = data?.data || [];

  // Kiểm tra quyền edit của user với post
  const canEdit = (post: Post) => {
    return user?.id === post.creator_id || (user as Staff)?.role === 'admin';
  };

  // Xử lý xóa bài viết
  const handleDelete = (post: Post) => {
    Modal.confirm({
      title: 'Xác nhận xóa bài viết',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa bài viết này không?</p>
          <div className="bg-gray-50 p-3 rounded mt-2">
            <strong>{post.title}</strong>
          </div>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        deletePost({
          resource: 'posts',
          id: post.id,
        }, {
          onSuccess: () => {
            message.success('Xóa bài viết thành công');
            refetch();
          },
          onError: (error) => {
            message.error(error?.message || 'Có lỗi xảy ra khi xóa bài viết');
          }
        });
      },
    });
  };

  // Xử lý khóa/mở khóa bài viết
  const handleToggleLock = (post: Post) => {
    const isLocked = post.status === 'locked';
    const action = isLocked ? 'mở khóa' : 'khóa';
    
    Modal.confirm({
      title: `Xác nhận ${action} bài viết`,
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn ${action} bài viết "${post.title}"?`,
      okText: action === 'khóa' ? 'Khóa' : 'Mở khóa',
      cancelText: 'Hủy',
      onOk: () => {
        updatePost({
          resource: 'posts',
          id: post.id,
          values: {
            status: isLocked ? 'published' : 'locked'
          }
        }, {
          onSuccess: () => {
            message.success(`${action === 'khóa' ? 'Khóa' : 'Mở khóa'} bài viết thành công`);
            refetch();
          },
          onError: (error) => {
            message.error(error?.message || `Có lỗi xảy ra khi ${action} bài viết`);
          }
        });
      },
    });
  };

  // Menu dropdown cho quản lý bài viết
  const getManagementMenu = (post: Post): MenuProps => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Cập nhật',
        onClick: () => {
          // Navigate to edit page - will be implemented
          window.location.href = `/posts/edit/${post.id}`;
        }
      },
      {
        key: 'lock',
        icon: <LockOutlined />,
        label: post.status === 'locked' ? 'Mở khóa' : 'Khóa',
        onClick: () => handleToggleLock(post)
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Xóa',
        danger: true,
        onClick: () => handleDelete(post)
      },
    ],
  });

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
        <div className="min-h-[60vh] flex flex-col items-center justify-center py-12">
          <Empty 
            description={
              <span className="text-gray-500 text-lg">Chưa có bài viết nào</span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="mb-6"
          />
          {guard === 'staff' && (
            <Link to="/posts/create">
              <Button type="primary" size="large" className="font-medium">
                Tạo bài viết mới
              </Button>
            </Link>
          )}
        </div>
      </MainLayout>
    );
  }

  const featuredPosts = posts.slice(0, 3);
  const otherPosts = posts.slice(3);
  
  return (
    <MainLayout>
      <div className=" from-orange-50 to-white">
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
                title: <span className="text-orange-500 font-medium">Bài viết</span>,
              },
            ]}
          />

          {/* Hero Section with Top 3 Posts */}
          <div className="mb-12">
            <div className="flex items-center mb-8">
              <div className="flex-grow">
                <Title level={2} className="!mb-0 flex items-center !text-gray-800">
                  <ReadOutlined className="mr-3 text-orange-500" />
                  Bài viết nổi bật
                </Title>
                <div className="h-1 w-20 bg-orange-500 mt-2 rounded-full"></div>
              </div>
              
              {guard === 'staff' && (
                <Link to="/posts/create">
                  <Button type="primary" className="bg-orange-500 hover:bg-orange-600 border-orange-500">
                    Tạo bài viết mới
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Featured Post */}
              {featuredPosts.length > 0 && (
                <div className="lg:col-span-7 xl:col-span-8 relative">
                  <Link to={`/posts/${featuredPosts[0].id}`} className="block group">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg h-full">
                      <div className="aspect-[16/9] lg:aspect-[16/10] relative">
                        <img 
                          src={getFirstImageFromContent(featuredPosts[0].content) || DEFAULT_IMAGE} 
                          alt={featuredPosts[0].title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-start justify-between mb-3">
                          <Tag color="orange">Nổi bật</Tag>
                          {featuredPosts[0].status === 'locked' && (
                            <Tag color="red" icon={<LockOutlined />}>Đã khóa</Tag>
                          )}
                        </div>
                        <Title level={2} className="!text-white !mb-2 group-hover:text-orange-300 transition-colors duration-300 line-clamp-2">
                          {featuredPosts[0].title}
                        </Title>
                        <p className="text-gray-200 mb-4 line-clamp-2">
                          {featuredPosts[0].summary}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar 
                              size="small"
                              icon={<UserOutlined />}
                              className="mr-2 border border-white"
                            />
                            <span className="text-sm text-gray-200 mr-4">{featuredPosts[0].creator?.name}</span>
                            <CalendarOutlined className="text-gray-300 mr-1" />
                            <span className="text-sm text-gray-300">
                              {dayjs(featuredPosts[0].created_at).format('DD/MM/YYYY')}
                            </span>
                          </div>
                          <span className="text-orange-300 text-sm font-medium hidden sm:inline-flex items-center group-hover:text-orange-200">
                            Đọc tiếp
                            <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  {canEdit(featuredPosts[0]) && (
                    <div className="absolute top-4 right-4 z-10">
                      <Dropdown menu={getManagementMenu(featuredPosts[0])} trigger={['click']} placement="bottomRight">
                        <Button 
                          type="primary"
                          className="!bg-white/90 backdrop-blur-sm !text-orange-600 hover:!bg-white !border-none shadow-lg"
                        >
                          Quản lý <MoreOutlined />
                        </Button>
                      </Dropdown>
                    </div>
                  )}
                </div>
              )}

              {/* Secondary Featured Posts */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="grid grid-cols-1 gap-6 h-full">
                  {featuredPosts.slice(1, 3).map((post, index) => (
                    <div key={post.id} className="relative h-full">
                      <Link to={`/posts/${post.id}`} className="block group h-full">
                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow h-full overflow-hidden flex flex-col">
                          <div className="aspect-[16/9] overflow-hidden relative">
                            <img 
                              src={getFirstImageFromContent(post.content) || DEFAULT_IMAGE} 
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-0 right-0 m-3 flex gap-2">
                              <Tag color="orange" className="bg-orange-500/90 backdrop-blur-sm">
                                <FireOutlined className="mr-1" />
                                Đề xuất
                              </Tag>
                              {post.status === 'locked' && (
                                <Tag color="red" icon={<LockOutlined />} className="bg-red-500/90 backdrop-blur-sm">
                                  Khóa
                                </Tag>
                              )}
                            </div>
                          </div>
                          <div className="p-4 flex-grow flex flex-col">
                            <Title 
                              level={4} 
                              className="!mt-0 !mb-2 !text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors"
                            >
                              {post.title}
                            </Title>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-grow">
                              {post.summary}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                              <div className="flex items-center">
                                <Avatar 
                                  size="small"
                                  icon={<UserOutlined />}
                                  className="mr-1"
                                />
                                <span className="mr-3">{post.creator?.name}</span>
                              </div>
                              <div className="flex items-center">
                                <FieldTimeOutlined className="mr-1" />
                                {dayjs(post.created_at).format('DD/MM/YYYY')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {canEdit(post) && (
                        <div className="absolute top-4 left-4 z-10">
                          <Dropdown menu={getManagementMenu(post)} trigger={['click']} placement="bottomLeft">
                            <Button 
                              size="small"
                              className="!bg-white/90 backdrop-blur-sm !text-orange-600 hover:!bg-white !border-orange-300 shadow-md"
                            >
                              Quản lý <MoreOutlined />
                            </Button>
                          </Dropdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Other Posts Section */}
          {otherPosts.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center mb-8">
                <Title level={3} className="!mb-0 flex items-center">
                  <ReadOutlined className="mr-2 text-orange-500" />
                  Bài viết mới nhất
                </Title>
                <div className="h-1 w-16 bg-orange-500 ml-4 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {otherPosts.map(post => {
                  const thumbnailImage = getFirstImageFromContent(post.content) || DEFAULT_IMAGE;
                  return (
                    <div key={post.id} className="relative group">
                      <Link 
                        to={`/posts/${post.id}`}
                        className="block h-full"
                      >
                        <div className="bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 h-full flex flex-col transform group-hover:-translate-y-1">
                          <div className="aspect-[16/10] overflow-hidden rounded-t-lg relative">
                            <img 
                              src={thumbnailImage} 
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                                                         {post.status === 'locked' && (
                               <div className="absolute top-2 right-2">
                                 <Tag color="red" icon={<LockOutlined />} className="text-xs">
                                   Khóa
                                 </Tag>
                               </div>
                             )}
                          </div>
                          <div className="p-4 flex-grow flex flex-col">
                            <Title 
                              level={5} 
                              className="!mt-0 !mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors"
                            >
                              {post.title}
                            </Title>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                              {post.summary}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
                              <div className="flex items-center">
                                <Avatar 
                                  size="small"
                                  icon={<UserOutlined />}
                                  className="mr-1"
                                />
                                <span>{post.creator?.name}</span>
                              </div>
                              <div className="flex items-center">
                                <CalendarOutlined className="mr-1" />
                                {dayjs(post.created_at).format('DD/MM/YYYY')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {canEdit(post) && (
                        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Dropdown menu={getManagementMenu(post)} trigger={['click']} placement="bottomRight">
                            <Button 
                              size="small"
                              className="!bg-white/90 backdrop-blur-sm !text-orange-600 hover:!bg-white !border-orange-300 shadow-md"
                            >
                              Quản lý <MoreOutlined />
                            </Button>
                          </Dropdown>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PostPage;