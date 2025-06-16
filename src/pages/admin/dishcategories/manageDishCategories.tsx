import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Input, Modal, Form, message } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import dayjs from 'dayjs';
import type { DishCategory } from '@/types';

const ManageDishCategories: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DishCategory | null>(null);

  const { data, isLoading: isLoadingList } = useList<DishCategory>({
    resource: 'dish-categories',
  });

  const { mutate: createCategory, isLoading: isCreating } = useCreate<DishCategory>();

  const { mutate: deleteCategory, isLoading: isDeleting } = useDelete<DishCategory>();
  const { mutate: updateCategory, isLoading: isUpdating } = useUpdate<DishCategory>();

  const handleSubmit = async (values: { name: string; description?: string }) => {
    try {
      if (editingCategory) {
        await updateCategory(
          {
            resource: 'dish-categories',
            id: editingCategory.id,
            values: values,
          },
          {
            onSuccess: () => {
              message.success('Cập nhật danh mục thành công');
              setIsModalVisible(false);
              form.resetFields();
            },
            onError: (error) => {
              message.error(error?.message || 'Có lỗi xảy ra khi cập nhật danh mục');
            },
          },
        );
      }else{
        await createCategory(
          {
            resource: 'dish-categories',
            values: values,
          },
          {
            onSuccess: () => {
              message.success('Thêm danh mục thành công');
              setIsModalVisible(false);
              form.resetFields();
            },
            onError: (error) => {
              message.error(error?.message || 'Có lỗi xảy ra khi thêm danh mục');
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
    setEditingCategory(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: DishCategory) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleDelete = (record: DishCategory) => {
    showDeleteConfirm(record);
  };

  const showDeleteConfirm = (record: DishCategory) => {
    Modal.confirm({
      title: 'Xóa danh mục',
      content: `Bạn có chắc chắn muốn xóa danh mục "${record.name}"?`,
      onOk: () => {
        console.log("Delete", record);
        deleteCategory({
          resource: 'dish-categories',
          id: record.id,
        });
      },
    });
  };

  const columns = [
    {
      title: 'Mã danh mục',
      dataIndex: 'id',
      key: 'id',
      width: '15%',
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      sorter: (a: DishCategory, b: DishCategory) => a.name.localeCompare(b.name),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '20%',
      render: (date: string) => dayjs(date).format('HH:mm:ss DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_: any, record: DishCategory) => (
        <Space size='middle'>
          <Button
            type='primary'
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            onClick={() => showDeleteConfirm(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title='Quản lý danh mục món ăn'
      className='m-4'
    >
      <div className='mb-4 flex justify-between items-center'>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Thêm danh mục
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data}
        loading={isLoadingList}
        rowKey='id'
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <Modal
        title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{}}
        >
          <Form.Item
            name='name'
            label='Tên danh mục'
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục' },
              { max: 100, message: 'Tên danh mục không được quá 100 ký tự' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name='description'
            label='Mô tả'
            rules={[{ max: 500, message: 'Mô tả không được quá 500 ký tự' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item className='flex justify-end'>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button
                type='primary'
                htmlType='submit'
                loading={isCreating}
              >
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManageDishCategories;
