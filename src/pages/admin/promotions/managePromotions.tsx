import React, { useState } from 'react';
import { Button, Space, Card, Input, Modal, Form, message, InputNumber, DatePicker, Table, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

interface Promotion {
  id: number;
  creator_id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  discount_percentage: number;
  required_points: number;
  limit_per_user_count: number;
  created_at: string;
  updated_at: string;
}

interface PromotionFormData {
  name: string;
  description?: string;
  start_date: Dayjs;
  end_date: Dayjs;
  discount_percentage: number;
  required_points: number;
  limit_per_user_count: number;
}

const ManagePromotions: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const { data, isLoading } = useList<Promotion>({
    resource: 'promotions',
  });

  const { mutate: createPromotion, isLoading: isCreating } = useCreate();
  const { mutate: updatePromotion, isLoading: isUpdating } = useUpdate();
  const { mutate: deletePromotion, isLoading: isDeleting } = useDelete();

  const columns = [
    {
      title: 'Tên ưu đãi',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <GiftOutlined className="text-primary text-lg" />
          <span className="font-medium text-gray-800">{text}</span>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
      render: (text: string) => (
        <div className="text-gray-600 line-clamp-2">{text}</div>
      ),
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount_percentage',
      key: 'discount_percentage',
      width: '12%',
      render: (value: number) => (
        <Tag color="red" className="text-sm px-3 py-1">
          {value}%
        </Tag>
      ),
    },
    {
      title: 'Điểm & Giới hạn',
      key: 'points',
      width: '15%',
      render: (_: any, record: Promotion) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-600">
            <UserOutlined className="text-sm" />
            <span>{record.required_points} điểm</span>
          </div>
          <div className="text-gray-500 text-sm">
            Giới hạn: {record.limit_per_user_count} người
          </div>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      key: 'dates',
      width: '18%',
      render: (_: any, record: Promotion) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-600">
            <CalendarOutlined className="text-sm" />
            <span>{dayjs(record.start_date).format('DD/MM/YYYY')}</span>
          </div>
          <div className="text-gray-500 text-sm">
            đến {dayjs(record.end_date).format('DD/MM/YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '10%',
      render: (_: any, record: Promotion) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-blue-500 hover:text-blue-600"
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
          />
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values: PromotionFormData) => {
    try {
      const submitData = {
        ...values,
        start_date: values.start_date.format('YYYY-MM-DD'),
        end_date: values.end_date.format('YYYY-MM-DD'),
      };

      if (editingPromotion) {
        await updatePromotion({
          resource: 'promotions',
          id: editingPromotion.id,
          values: submitData,
        });
        message.success('Cập nhật ưu đãi thành công');
      } else {
        await createPromotion({
          resource: 'promotions',
          values: submitData,
        });
        message.success('Thêm ưu đãi thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại');
    }
  };

  const handleEdit = (record: Promotion) => {
    setEditingPromotion(record);
    form.setFieldsValue({
      ...record,
      start_date: dayjs(record.start_date),
      end_date: dayjs(record.end_date),
    });
    setIsModalVisible(true);
  };

  const showDeleteConfirm = (record: Promotion) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa ưu đãi "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deletePromotion({
            resource: 'promotions',
            id: record.id,
          });
          message.success('Xóa ưu đãi thành công');
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa ưu đãi');
        }
      },
    });
  };

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <GiftOutlined className="text-primary text-xl" />
          <span className="text-lg font-semibold">Quản lý ưu đãi</span>
        </div>
      }
      className="m-4 shadow-md"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingPromotion(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Thêm ưu đãi
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={data?.data}
        rowKey="id"
        loading={isLoading || isCreating || isUpdating || isDeleting}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng số ${total} ưu đãi`,
        }}
        className="bg-white rounded-lg shadow-sm"
      />

      <Modal
        title={
          <div className="flex items-center gap-2">
            <GiftOutlined className="text-primary text-lg" />
            <span>{editingPromotion ? 'Sửa ưu đãi' : 'Thêm ưu đãi mới'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
        className="top-8"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Tên ưu đãi"
            rules={[{ required: true, message: 'Vui lòng nhập tên ưu đãi' }]}
          >
            <Input className="rounded-md" placeholder="Nhập tên ưu đãi..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="discount_percentage"
            label="Phần trăm giảm giá"
            rules={[
              { required: true, message: 'Vui lòng nhập phần trăm giảm giá' },
              { type: 'number', min: 0, max: 100, message: 'Giảm giá phải từ 0-100%' }
            ]}
          >
            <InputNumber
              min={0}
              max={100}
              formatter={value => value ? `${value}%` : ''}
              parser={value => value!.replace('%', '')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="required_points"
            label="Điểm yêu cầu"
            rules={[
              { required: true, message: 'Vui lòng nhập điểm yêu cầu' },
              { type: 'number', min: 0, message: 'Điểm yêu cầu không được âm' }
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="limit_per_user_count"
            label="Giới hạn số lượng sử dụng"
            rules={[
              { type: 'number', min: 0, message: 'Giới hạn không được âm' }
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="Ngày kết thúc"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày kết thúc' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('start_date') <= value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                },
              }),
            ]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item className="flex justify-end mb-0">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreating || isUpdating}
              >
                {editingPromotion ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManagePromotions;