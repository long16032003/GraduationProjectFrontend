import React, { useState } from 'react';
import { Table, Button, Space, Card, Input, Tag, Modal, Form, InputNumber, Select, message } from 'antd';
import { PlusOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

interface TableData {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  area: string;
}

interface TableFormData {
  name: string;
  capacity: number;
  area: string;
}

const TableManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);

  // Mock data - sẽ được thay thế bằng API call
  const data: TableData[] = [
    {
      id: '1',
      name: 'Bàn 1',
      capacity: 4,
      status: 'available',
      area: 'Tầng 1',
    },
    // ... thêm data mẫu
  ];

  const areas = ['Tầng 1', 'Tầng 2', 'Khu VIP', 'Sân thượng'];

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
      sorter: (a: TableData, b: TableData) => a.name.localeCompare(b.name),
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      sorter: (a: TableData, b: TableData) => a.capacity - b.capacity,
    },
    {
      title: 'Khu vực',
      dataIndex: 'area',
      key: 'area',
      filters: areas.map(area => ({ text: area, value: area })),
      onFilter: (value: string, record: TableData) => record.area === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          available: { color: 'green', text: 'Trống' },
          occupied: { color: 'red', text: 'Đang sử dụng' },
          reserved: { color: 'orange', text: 'Đã đặt trước' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: TableData) => (
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
  const handleEdit = (record: TableData) => {
    setEditingTable(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // Xử lý xóa bàn
  const showDeleteConfirm = (record: TableData) => {
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
        // await updateTable(editingTable.id, values);
        message.success('Cập nhật thành công');
      } else {
        // API call để thêm bàn mới
        // await createTable(values);
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

  return (
    <Card title="Quản lý bàn" className="m-4">
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
        dataSource={data}
        loading={loading}
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
              {areas.map(area => (
                <Select.Option key={area} value={area}>
                  {area}
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