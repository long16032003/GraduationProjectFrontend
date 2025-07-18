import React, { useState } from 'react';
import { 
  Table, Button, Space, Card, Input, Modal, message, Tag, Tooltip, Row, Col,
  Typography, Badge, DatePicker
} from 'antd';
import { 
  PlusOutlined, ExclamationCircleOutlined, SearchOutlined,
  PhoneOutlined, TableOutlined, CommentOutlined, CheckCircleOutlined,
  CloseCircleOutlined, CalendarOutlined
} from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import type { Key } from 'react';
import dayjs from 'dayjs';
import { useUpdate } from '@refinedev/core';
import type { Reservation } from '@/types';
import { useList } from '@refinedev/core';
import { areas } from '@/utils/constant';
import ReservationModal from '../../../components/modal/ReservationModal';

const { Text, Title } = Typography;

const ManageReservations: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [dateFilter, setDateFilter] = useState<dayjs.Dayjs | null>(null);

  // API hooks
  const { data: listReservations, isLoading: isLoadingList, refetch: refetchReservations } = useList<Reservation>({
    resource: 'reservations',
    sorters: [
      {
        field: 'reservation_date',
        order: 'desc'
      }
    ]
  });

  const { mutate: updateReservation } = useUpdate<Reservation>();

  const statusColors = {
    pending: 'orange',
    confirmed: 'green', 
    cancelled: 'red',
  };

  const statusTexts = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã hủy',
  };

  // Filter reservations
  const filterByDate = (data: Reservation[] | undefined): Reservation[] => {
    if (!data) return [];
    if (!dateFilter) return data;

    return data.filter(record => {
      const recordDate = dayjs(record.reservation_date);
      return recordDate.format('YYYY-MM-DD') === dateFilter.format('YYYY-MM-DD');
    });
  };

  const columns: ColumnType<Reservation>[] = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Reservation, b: Reservation) => a.name.localeCompare(b.name),
      render: (name: string, record: Reservation) => (
        <div>
          <div className="font-medium">{name}</div>
          <Text type="secondary" className="text-xs">
            <PhoneOutlined className="mr-1" />
            {record.phone}
          </Text>
        </div>
      ),
    },
    {
      title: 'Bàn',
      dataIndex: 'table_id',
      key: 'table_id',
      width: 150,
      render: (tableId: number, record: Reservation) => (
        <div>
          <Tag color="blue">{record.table?.name}</Tag>
          <div className="text-xs text-gray-500">{areas[record.table?.area as keyof typeof areas]}</div>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'reservation_date',
      key: 'reservation_date',
      width: 150,
      sorter: (a: Reservation, b: Reservation) => 
        dayjs(a.reservation_date).unix() - dayjs(b.reservation_date).unix(),
      render: (date: string) => (
        <div>
          <div className="font-medium">{dayjs(date).format('DD/MM/YYYY')}</div>
          <div className="text-sm text-gray-600">{dayjs(date).format('HH:mm')}</div>
        </div>
      ),
    },
    {
      title: 'Số khách',
      dataIndex: 'number_of_guests',
      key: 'number_of_guests',
      width: 100,
      render: (guests: number) => <Badge count={guests} color="green" />,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: keyof typeof statusColors) => (
        <Tag color={statusColors[status]}>{statusTexts[status]}</Tag>
      ),
      filters: Object.entries(statusTexts).map(([value, text]) => ({ text, value })),
      onFilter: (value: boolean | Key, record: Reservation) => record.status === value,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      width: 200,
      render: (notes: string) => {
        if (!notes) return <Text type="secondary">-</Text>;
        
        const truncatedNotes = notes.length > 50 ? `${notes.substring(0, 50)}...` : notes;
        
        return (
          <Tooltip title={notes} placement="top">
            <div className="text-sm">
              <CommentOutlined className="mr-1 text-gray-400" />
              {truncatedNotes}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Reservation) => {
        return (
          <Space size="small" wrap>
            {record.status === 'pending' && (
              <Button 
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleConfirm(record)}
              >
                Xác nhận
              </Button>
            )}
            <Button 
              type="default" 
              size="small"
              onClick={() => handleEdit(record)}
              disabled={record.status === 'cancelled'}
            >
              Sửa
            </Button>
            <Button 
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => showCancelConfirm(record)}
              disabled={record.status === 'cancelled'}
            >
              Hủy
            </Button>
          </Space>
        );
      },
    },
  ];

  const handleAdd = () => {
    setEditingReservation(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Reservation) => {
    setEditingReservation(record);
    setIsModalVisible(true);
  };

  const handleConfirm = (record: Reservation) => {
    Modal.confirm({
      title: 'Xác nhận đặt bàn',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xác nhận đặt bàn cho khách hàng ${record.name}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        updateReservation({
          resource: 'reservations',
          id: record.id,
          values: { status: 'confirmed' },
          successNotification:{
            message: "Xác nhân đặt bàn thành công",
            type: "success",
          }
        });
      },
    });
  };

  const showCancelConfirm = (record: Reservation) => {

    Modal.confirm({
      title: 'Xác nhận hủy đặt bàn',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc muốn hủy đặt bàn cho khách hàng <strong>{record.name}</strong>?</p>
          <p className="text-red-500 text-sm">Hành động này không thể hoàn tác.</p>
        </div>
      ),
      okText: 'Xác nhận hủy',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        updateReservation({
          resource: 'reservations',
          id: record.id,
          values: { status: 'cancelled' }
        }, {
          onSuccess: () => {
            message.success('Hủy đặt bàn thành công');
            refetchReservations();
          },
          onError: () => {
            message.error('Có lỗi xảy ra khi hủy đặt bàn');
          }
        });
      },
    });
  };

  

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <Title
            level={3}
            style={{ margin: 0 }}
            className='text-orange-600'
          >
            Quản lý đặt bàn
          </Title>
        </div>
      } 
      className="m-4"
    >
      {/* Header Controls */}
      <div className="mb-4 flex justify-between items-center flex-wrap gap-4">
        <Space wrap>
          <Input.Search
            placeholder="Tìm kiếm theo tên, SĐT hoặc ghi chú..."
            allowClear
            onSearch={value => setSearchText(value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <DatePicker
            placeholder="Chọn ngày"
            format="DD/MM/YYYY"
            value={dateFilter}
            onChange={(date) => setDateFilter(date)}
            allowClear
            suffixIcon={<CalendarOutlined />}
            style={{ width: 200 }}
            showToday={false}
            presets={[
              {
                label: 'Hôm nay',
                value: dayjs(),
              },
              {
                label: 'Ngày mai',
                value: dayjs().add(1, 'day'),
              },
              {
                label: 'Tuần này',
                value: dayjs().startOf('week'),
              },
            ]}
          />
          <Button
            type="default"
            icon={<CalendarOutlined />}
            onClick={() => setDateFilter(dayjs())}
            className={dateFilter && dayjs().isSame(dateFilter, 'day') ? 'bg-blue-50 border-blue-300' : ''}
          >
            Hôm nay
          </Button>
          {dateFilter && (
            <Tag 
              color="blue" 
              closable 
              onClose={() => setDateFilter(null)}
            >
              Ngày: {dateFilter.format('DD/MM/YYYY')}
            </Tag>
          )}
        </Space>
        
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Đặt bàn mới
          </Button>
        </Space>
      </div>

      {/* Summary Stats */}
      <div className="mb-4">
        <Row gutter={16}>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {filterByDate(listReservations?.data)?.filter(r => r.status === 'pending').length || 0}
              </div>
              <div className="text-sm text-gray-500">Chờ xác nhận</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {filterByDate(listReservations?.data)?.filter(r => r.status === 'confirmed').length || 0}
              </div>
              <div className="text-sm text-gray-500">Đã xác nhận</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {filterByDate(listReservations?.data)?.filter(r => r.status === 'cancelled').length || 0}
              </div>
              <div className="text-sm text-gray-500">Đã hủy</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {filterByDate(listReservations?.data)?.length || 0}
              </div>
              <div className="text-sm text-gray-500">{dateFilter ? 'Ngày đã chọn' : 'Tổng cộng'}</div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Table */}
      <Table<Reservation>
        columns={columns}
        dataSource={filterByDate(listReservations?.data)?.filter(r => 
          !searchText || 
          r.name.toLowerCase().includes(searchText.toLowerCase()) ||
          r.phone.includes(searchText) ||
          (r.notes && r.notes.toLowerCase().includes(searchText.toLowerCase()))
        )}
        loading={isLoadingList}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đặt bàn`,
          pageSize: 10,
        }}
        scroll={{ x: 1000 }}
        size="small"
      />

      {/* Reservation Modal */}
      <ReservationModal
        isVisible={isModalVisible}
        editingReservation={editingReservation}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={refetchReservations}
        listReservations={listReservations}
      />


    </Card>
  );
};

export default ManageReservations;