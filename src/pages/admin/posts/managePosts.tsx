import React, { useState } from 'react';
import { Button, Space, Card, Input, Modal, Form, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import dayjs from 'dayjs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import type { Post } from '@/types';

const ManagePosts: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const { data: listPosts, isLoading: isLoadingList } = useList<Post>({
    resource: 'posts',
  });

  const { mutate: createPost, isLoading: isCreating } = useCreate<Post>();
  const { mutate: deletePost, isLoading: isDeleting } = useDelete<Post>();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdate<Post>();

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
    } catch (error: any) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại');
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
      onOk: () => {
        deletePost({
          resource: 'posts',
          id: record.id,
        });
      },
    });
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'align',
    'link', 'image'
  ];

  return (
    <Card
      title='Quản lý bài viết'
      className='m-4'
    >
      <div className='mb-4 flex justify-between items-center'>
        <Input.Search
          placeholder='Tìm kiếm bài viết...'
          className='max-w-md'
          allowClear
        />
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Thêm bài viết
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {listPosts?.data?.map((post: Post) => (
          <div 
            key={post.id}
            className='bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow'
          >
            <div className='flex justify-between items-start mb-2'>
              <h3 className='text-lg font-semibold truncate flex-1'>{post.title}</h3>
              <Space>
                <Button
                  type='text'
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(post)}
                />
                <Button
                  type='text'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => showDeleteConfirm(post)}
                />
              </Space>
            </div>
            
            <p className='text-gray-500 text-sm mb-2'>
              {dayjs(post.created_at).format('HH:mm:ss DD/MM/YYYY')}
            </p>
            
            <div className='text-gray-600 mb-3 line-clamp-2'>
              {post.summary}
            </div>
            
            <div 
              className='text-gray-700 line-clamp-3 text-sm'
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        ))}
      </div>

      <Modal
        title={editingPost ? 'Sửa bài viết' : 'Thêm bài viết mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={1000}
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{}}
        >
          <Form.Item
            name='title'
            label='Tiêu đề'
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề' },
              { max: 200, message: 'Tiêu đề không được quá 200 ký tự' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name='summary'
            label='Tóm tắt'
            rules={[
              { required: true, message: 'Vui lòng nhập tóm tắt' },
              { max: 500, message: 'Tóm tắt không được quá 500 ký tự' },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name='content'
            label='Nội dung'
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung' },
            ]}
          >
            <ReactQuill
              theme="snow"
              modules={modules}
              formats={formats}
              style={{ height: '300px', marginBottom: '50px' }}
            />
          </Form.Item>

          <Form.Item className='flex justify-end mt-8'>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button
                type='primary'
                htmlType='submit'
                loading={isCreating || isUpdating}
              >
                {editingPost ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManagePosts;