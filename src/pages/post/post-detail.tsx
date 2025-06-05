import React from 'react';
import { useOne, useList } from '@refinedev/core';
import { Typography, Breadcrumb, Space, Spin, Card, Row, Col, Avatar, List, Layout, Button, Tooltip } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { theme } from '@/config/theme';
import dayjs from 'dayjs';
import { Link, useParams } from 'react-router';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';
import type { Post } from '@/types';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';
import { Result } from 'antd/lib';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { token } = theme;

const PostDetail: React.FC = () => {
  const { id } = useParams();
  const { data, isLoading } = useOne<Post>({
    resource: 'posts',
    id: id || '',
  });

  const { data: relatedData } = useList<Post>({
    resource: 'posts',
    filters: [{ field: 'id', operator: 'ne', value: id }],
    pagination: { pageSize: 3 },
    sorters: [{ field: 'created_at', order: 'desc' }],
  });

  const post = data?.data;
  const relatedPosts = relatedData?.data || [];

  const user = use$(auth$.user);

  // Kiểm tra quyền edit của user với post
  const canEdit = user?.id === post?.creator_id || user?.role === 'admin';

  if (isLoading) {
    return (
        <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Spin size="large" />
            <div className="mt-4 text-gray-500">Đang tải bài viết...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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
              title: <Link to="/posts">Tin tức</Link>,
            },
            {
              title: post.title,
            },
          ]}
        />

        <div className="max-w-6xl mx-auto">
          {/* Post Header with Edit Button */}
          <div className="mb-8 relative">
            <Title level={1} className="!mb-4 text-gray-800 pr-32">
              {post.title}
            </Title>

            {/* Edit Button */}
            {canEdit && (
              <div className="absolute top-0 right-0">
                <Tooltip title="Chỉnh sửa bài viết">
                  <Link to={`/posts/edit/${post.id}`}>
                    <Button 
                      type="primary"
                      icon={<EditOutlined />}
                      className="bg-orange-600 hover:bg-orange-700 border-none"
                    >
                      Chỉnh sửa
                    </Button>
                  </Link>
                </Tooltip>
              </div>
            )}
            
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-500">
              <Space>
                <CalendarOutlined />
                <span>{dayjs(post.created_at).format('DD/MM/YYYY')}</span>
              </Space>
              <Space>
                <Avatar 
                  size="small"
                  icon={<UserOutlined />}
                  src={post.creator?.avatar}
                  className="bg-orange-500"
                />
                <span>{post.creator?.name}</span>
              </Space>
            </div>
          </div>

          {/* Summary */}
          <Card className="mb-8 bg-orange-50/50 border-orange-100">
            <Paragraph className="text-lg text-gray-600 italic m-0">
              {post.summary}
            </Paragraph>
          </Card>

          {/* Main Content */}
          <Card className="!border-none shadow-sm">
            <div className="prose prose-lg max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="prose prose-headings:text-gray-800 
                  prose-p:text-gray-600 
                  prose-a:text-orange-600 prose-a:no-underline hover:prose-a:text-orange-700
                  prose-img:rounded-lg prose-img:mx-auto
                  prose-strong:text-gray-800"
              />
            </div>
          </Card>

          {/* Author Card */}
          <Card className="mt-8 bg-gray-50 border-none shadow-sm">
            <div className="flex items-center gap-4">
              <Avatar 
                size={64}
                icon={<UserOutlined />}
                src={post.creator?.avatar}
                className="bg-orange-500"
              />
              <div>
                <div className="text-lg font-medium">
                  {post.creator?.name}
                </div>
                <div className="text-gray-500">
                  Tác giả
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostDetail;
