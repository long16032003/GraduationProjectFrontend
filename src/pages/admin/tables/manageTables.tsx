import React, { useState } from 'react';
import { Table, Button, Space, Card, Input, Tag, Modal, Form, InputNumber, Select, message } from 'antd';
import { PlusOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { Post, TableModel, User } from '@/types';
import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import { areas } from '@/utils/constant';

interface TableFormData {
  name: string;
  capacity: number;
  area: '1st floor' | '2nd floor' | '3rd floor' | 'rooftop';
  status: 'occupied' | 'maintenance';
}

const TableManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<TableModel | null>(null);

  //API call
  const { data: listTables, isLoading: isLoadingList } = useList<TableModel>({
    resource: 'tables',
  });

  const { mutate: createTable, isLoading: isCreating } = useCreate<TableModel>();
  const { mutate: deleteTable, isLoading: isDeleting } = useDelete<TableModel>();
  const { mutate: updateTable, isLoading: isUpdating } = useUpdate<TableModel>();

  const statuses = {
    'occupied' : 'Đang sử dụng',
    'maintenance' : 'Bảo trì'
  };

  const columns = [
    {
      title: 'Mã bàn',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên bàn',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: TableModel, b: TableModel) => a.name.localeCompare(b.name),
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      sorter: (a: TableModel, b: TableModel) => a.capacity - b.capacity,
    },
    {
      title: 'Khu vực',
      dataIndex: 'area',
      key: 'area',
      filters: Object.entries(areas).map(([key, value]) => ({ text: value, value: key })),
      onFilter: (value: string, record: TableModel) => record.area === value,
      render: (area: string) => areas[area as keyof typeof areas],
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      onFilter: (value: string, record: TableModel) => record.status === value,
      render: (status: string) => {
        const statusConfig = {
          occupied: { color: 'green', text: 'Đang sử dụng' },
          maintenance: { color: 'red', text: 'Bảo trì' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: TableModel) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button danger onClick={() => showDeleteConfirm(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Xử lý thêm bàn mới
  const handleAdd = () => {
    setEditingTable(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Xử lý sửa bàn
  const handleEdit = (record: TableModel) => {
    setEditingTable(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // Xử lý xóa bàn
  const showDeleteConfirm = (record: TableModel) => {
    if (record.status !== 'available') {
      message.error('Không thể xóa bàn vì đang được sử dụng hoặc đã đặt trước');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa ${record.name}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          // API call để xóa bàn
          // await deleteTable(record.id);
          message.success('Xóa bàn thành công');
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa bàn');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Xử lý submit form
  const handleSubmit = async (values: TableFormData) => {
    try {
      setLoading(true);
      if (editingTable) {
        // API call để cập nhật bàn
        await updateTable({
          resource: 'tables',
          id: editingTable.id,
          values: values,
        });
        message.success('Cập nhật thành công');
      } else {
        // API call để thêm bàn mới
        await createTable({
          resource: 'tables',
          values: values,
        });
        message.success('Thêm bàn thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Lọc dữ liệu dựa trên searchText
  const filteredData = listTables?.data?.filter((table) => {
    if (!searchText) return true;
    return (
      table.name.toLowerCase().includes(searchText.toLowerCase()) ||
      table.capacity.toString().includes(searchText)
    );
  });

  return (
    <Card title={
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">Quản lý bàn</span>
      </div>
    } className="m-4">
      <div className="mb-4 flex justify-between items-center">
        <Input.Search
          placeholder="Tìm kiếm bàn..."
          allowClear
          onSearch={value => setSearchText(value)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Thêm bàn mới
        </Button>
      </div>

      <Table
        columns={columns as any}
        dataSource={filteredData}
        loading={loading || isLoadingList}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng số ${total} bàn`,
        }}
      />

      <Modal
        title={editingTable ? "Sửa thông tin bàn" : "Thêm bàn mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên bàn"
            rules={[
              { required: true, message: 'Vui lòng nhập tên bàn' },
              { max: 50, message: 'Tên bàn không được quá 50 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Sức chứa"
            rules={[
              { required: true, message: 'Vui lòng nhập sức chứa' },
              { type: 'number', min: 1, message: 'Sức chứa phải lớn hơn 0' }
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="area"
            label="Khu vực"
            rules={[{ required: true, message: 'Vui lòng chọn khu vực' }]}
          >
            <Select>
              {Object.entries(areas).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue="occupied"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              {Object.entries(statuses).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="flex justify-end">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTable ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TableManagement;