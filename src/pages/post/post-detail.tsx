import React from 'react';
import { useOne, useList } from '@refinedev/core';
import { Typography, Breadcrumb, Space, Spin, Card, Row, Col, Avatar, List, Layout } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { theme } from '@/config/theme';
import dayjs from 'dayjs';
import { Link, useParams } from 'react-router';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { token } = theme;

interface Post {
  id: string;
  title: string;
  summary: string;
  content: string;
  created_at: string;
}

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

  if (isLoading) {
    return (
      <Row
        justify='center'
        align='middle'
        style={{ minHeight: '100vh' }}
      >
        <Spin size='large' />
      </Row>
    );
  }

  if (!post) {
    return (
      <Row
        justify='center'
        style={{ padding: token?.paddingLG }}
      >
        <Col>
          <Title level={3}>Không tìm thấy bài viết</Title>
          <Link to='/posts'>Quay lại danh sách</Link>
        </Col>
      </Row>
    );
  }

  return (
    <MainLayout>
      <Layout
        style={{
          background: `linear-gradient(to bottom, ${token?.colorBgSpotlight}, ${token?.menuItemHoverBg})`,
          minHeight: '100vh',
        }}
      >
        {/* Header Area */}
        <div
          style={{
            backgroundColor: token?.colorBgContainer + 'B3',
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${token?.colorBorderSecondary}`,
            padding: `${token?.paddingMD}px 0`,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Row justify='center'>
            <Col
              xs={23}
              sm={23}
              md={22}
              lg={20}
              xl={18}
            >
              <Breadcrumb
                items={[
                  { title: <Link to='/'>Trang chủ</Link> },
                  { title: <Link to='/posts'>Bài viết</Link> },
                  { title: <Text ellipsis>{post.title}</Text> },
                ]}
              />
            </Col>
          </Row>
        </div>

        <Content style={{ padding: `${token?.paddingLG}px 0` }}>
          <Row justify='center'>
            <Col
              xs={23}
              sm={23}
              md={22}
              lg={20}
              xl={18}
            >
              <Row gutter={[24, 24]}>
                {/* Main Content */}
                <Col
                  xs={24}
                  lg={16}
                >
                  <Card
                    bordered={false}
                    style={{
                      boxShadow: token?.boxShadow,
                      borderRadius: token?.borderRadiusLG,
                    }}
                  >
                    <Title
                      level={1}
                      style={{
                        fontSize: { xs: '1.75rem', sm: '2.5rem' },
                        marginBottom: token?.marginMD,
                      }}
                    >
                      {post.title}
                    </Title>

                    <Space
                      wrap
                      size={[16, 8]}
                      style={{ marginBottom: token?.marginLG }}
                    >
                      <Space>
                        <Avatar
                          icon={<UserOutlined />}
                          style={{ backgroundColor: token?.colorPrimary }}
                        />
                        <Text type='secondary'>Admin</Text>
                      </Space>
                      <Text type='secondary'>
                        <CalendarOutlined /> {dayjs(post.created_at).format('DD/MM/YYYY')}
                      </Text>
                      <Text type='secondary'>
                        <ClockCircleOutlined /> {dayjs(post.created_at).format('HH:mm')}
                      </Text>
                      <Text type='secondary'>
                        <EyeOutlined /> 123 lượt xem
                      </Text>
                    </Space>

                    <Card
                      bordered={false}
                      style={{
                        backgroundColor: token?.colorPrimaryBg,
                        marginBottom: token?.marginLG,
                      }}
                    >
                      <Paragraph
                        style={{
                          fontSize: token?.fontSizeLG,
                          color: token?.colorTextSecondary,
                          fontStyle: 'italic',
                          margin: 0,
                        }}
                      >
                        {post.summary}
                      </Paragraph>
                    </Card>

                    <div
                      dangerouslySetInnerHTML={{ __html: post.content }}
                      style={{
                        fontSize: token?.fontSize,
                        lineHeight: 1.8,
                        '& h2': {
                          fontSize: '1.5rem',
                          fontWeight: 600,
                          color: token?.colorPrimary,
                          margin: `${token?.marginLG}px 0 ${token?.marginMD}px`,
                        },
                        '& p': {
                          marginBottom: token?.marginMD,
                        },
                        '& img': {
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: token?.borderRadius,
                          marginBottom: token?.marginMD,
                        },
                        '& blockquote': {
                          borderLeft: `4px solid ${token?.colorPrimary}`,
                          margin: `${token?.marginLG}px 0`,
                          padding: token?.paddingMD,
                          backgroundColor: token?.colorBgLayout,
                          borderRadius: `0 ${token?.borderRadius}px ${token?.borderRadius}px 0`,
                        },
                      }}
                    />
                  </Card>
                </Col>

                {/* Sidebar */}
                <Col
                  xs={24}
                  lg={8}
                >
                  <Card
                    title={
                      <Title
                        level={4}
                        style={{ margin: 0, color: token?.colorPrimary }}
                      >
                        Bài viết mới nhất
                      </Title>
                    }
                    bordered={false}
                    style={{
                      boxShadow: token?.boxShadow,
                      borderRadius: token?.borderRadiusLG,
                    }}
                  >
                    <List
                      itemLayout='vertical'
                      dataSource={relatedPosts}
                      split={false}
                      renderItem={(item) => (
                        <List.Item
                          style={{
                            padding: token?.padding,
                            borderRadius: token?.borderRadius,
                            transition: 'all 0.3s',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: token?.colorBgLayout,
                            },
                          }}
                        >
                          <List.Item.Meta
                            title={
                              <Link
                                to={`/posts/${item.id}`}
                                style={{
                                  color: token?.colorTextBase,
                                  fontSize: token?.fontSizeLG,
                                  fontWeight: 500,
                                }}
                              >
                                {item.title}
                              </Link>
                            }
                            description={
                              <Space
                                direction='vertical'
                                size={4}
                              >
                                <Text
                                  type='secondary'
                                  ellipsis={{ rows: 2 }}
                                >
                                  {item.summary}
                                </Text>
                                <Space size='small'>
                                  <CalendarOutlined />
                                  <Text type='secondary'>
                                    {dayjs(item.created_at).format('DD/MM/YYYY')}
                                  </Text>
                                </Space>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Content>
      </Layout>
    </MainLayout>
  );
};

export default PostDetail;
