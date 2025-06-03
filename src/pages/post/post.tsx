import React from 'react';
import { Card, Row, Col, Typography, Space, Divider, Spin, Empty, Button } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { theme } from '@/config/theme';
import { useList } from '@refinedev/core';
import dayjs from 'dayjs';
import type { Post } from '@/types';
import { Link } from 'react-router';

const { Title, Text, Paragraph } = Typography;
const { token } = theme;

const PostPage: React.FC = () => {
  const { data, isLoading } = useList<Post>({
    resource: 'posts',
    sorters: [
      {
        field: 'created_at',
        order: 'desc',
      },
    ],
  });

  const posts = data?.data || [];
  console.log("posts:", posts);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!posts.length) {
    return <Empty description="Chưa có bài viết nào" />;
  }

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div style={{ 
      fontFamily: token?.fontFamily,
      backgroundColor: token?.colorBgLayout,
      minHeight: '100vh',
      padding: `${token?.paddingLG}px 0`
    }}>
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto',
        padding: `0 ${token?.padding}px`
      }}>
        <Title 
          level={1}
          style={{ 
            color: token?.colorPrimary,
            textAlign: 'center',
            marginBottom: token?.marginLG
          }}
        >
          Tin tức & Sự kiện
        </Title>

        {/* Featured Post */}
        <Card
          hoverable
          style={{
            borderRadius: token?.borderRadiusLG,
            border: 'none',
            boxShadow: token?.boxShadow,
            marginBottom: token?.marginLG
          }}
        >
          <Title level={2} style={{ 
            color: token?.colorTextBase,
            marginBottom: token?.marginSM 
          }}>
            {featuredPost.title}
          </Title>
          <Space style={{ marginBottom: token?.marginLG }}>
            <Text type="secondary">
              <CalendarOutlined /> {dayjs(featuredPost.created_at).format('DD/MM/YYYY')}
            </Text>
          </Space>
          <Paragraph 
            style={{ 
              color: token?.colorTextSecondary,
              fontSize: token?.fontSizeLG,
              marginBottom: token?.marginLG 
            }}
          >
            {featuredPost.summary}
          </Paragraph>
          <Link to={`/posts/${featuredPost.id}`}>
            <Button 
              type="primary"
              style={{
                backgroundColor: token?.colorPrimary,
                borderColor: token?.colorPrimary
              }}
            >
              Đọc thêm
            </Button>
          </Link>
        </Card>

        {/* Other Posts */}
        <Row gutter={[32, 32]}>
          {otherPosts.map(post => (
            <Col xs={24} sm={12} lg={8} key={post.id}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderRadius: token?.borderRadiusLG,
                  border: 'none',
                  boxShadow: token?.boxShadow
                }}
              >
                <Title level={4} style={{ 
                  color: token?.colorTextBase,
                  marginBottom: token?.marginSM 
                }}>
                  {post.title}
                </Title>
                <Space style={{ marginBottom: token?.marginSM }}>
                  <Text type="secondary">
                    <CalendarOutlined /> {dayjs(post.created_at).format('DD/MM/YYYY')}
                  </Text>
                </Space>
                <Paragraph 
                  ellipsis={{ rows: 3 }}
                  style={{ 
                    color: token?.colorTextSecondary,
                    marginBottom: token?.marginLG 
                  }}
                >
                  {post.summary}
                </Paragraph>
                <Link to={`/posts/${post.id}`}>
                  <Button 
                    type="link"
                    style={{
                      color: token?.colorPrimary,
                      paddingLeft: 0
                    }}
                  >
                    Đọc thêm
                  </Button>
                </Link>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ 
          textAlign: 'center',
          marginTop: token?.marginLG 
        }}>
          <Button 
            type="primary"
            size="large"
            style={{
              backgroundColor: token?.colorPrimary,
              borderColor: token?.colorPrimary
            }}
          >
            Xem thêm tin tức
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
