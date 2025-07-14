import React, { useState } from 'react';
import {
  Table,
  Tag,
  Button,
  Card,
  Typography,
  Space,
  Breadcrumb,
  Input,
  DatePicker,
  Row,
  Col,
  Modal,
  Descriptions,
  Steps,
  Empty,
  Tabs,
} from 'antd';
import {
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');
import { PageLoader } from '@/components/ui/loader';
import { useList, useUpdate } from '@refinedev/core';
import type { Reservation } from '@/types';
import auth$ from '@/stores/auth';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Step } = Steps;

// UI interface for reservations
interface UIReservation {
  id: number;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  party_size: number;
  special_request: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  table_number: string;
  created_at: string;
}

// Helper function to map API reservation to UI format
const mapReservationToUI = (reservation: Reservation): UIReservation => {
  console.log('Mapping reservation:', reservation);
  return {
    id: reservation.id,
    name: reservation.name || reservation.customer?.name || 'N/A',
    phone: reservation.phone,
    email: reservation.customer?.email || '',
    date: dayjs(reservation.reservation_date).format('YYYY-MM-DD'),
    time: dayjs(reservation.reservation_date).format('HH:mm'),
    party_size: reservation.number_of_guests,
    special_request: reservation.notes || '',
    status: reservation.status || 'pending',
    table_number: reservation.table?.name || '',
    created_at: reservation.created_at,
  };
};

const HistoryReservation: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<UIReservation | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Get current user
  const user = auth$.user.get();
  console.log('Current user:', user);

  // Check if user is a customer (has 'point' property)
  const isCustomer = user && 'point' in user;
  console.log('Is customer:', isCustomer);

  // Create filters based on user info
  const getReservationFilters = () => {
    if (!user) return [];

    const filters = [];

    // If user is a customer with customer_id, filter by customer_id
    if (isCustomer && user.id) {
      filters.push({
        field: 'customer_id',
        operator: 'eq' as const,
        value: user.id,
      });
    }

    // If user has phone number, also filter by phone (using OR logic)
    if (user.phone) {
      filters.push({
        field: 'phone',
        operator: 'eq' as const,
        value: user.phone,
      });
    }

    return filters;
  };

  // API hooks
  const {
    data: reservationsData,
    isLoading,
    refetch,
    error,
  } = useList<Reservation>({
    resource: 'reservations',
    filters: getReservationFilters(),
    queryOptions: {
      enabled: !!user && (isCustomer || !!user.phone), // Only enabled if user has ID or phone
    },
  });

  console.log('Reservations data:', reservationsData);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);
  console.log('Filters applied:', getReservationFilters());

  const { mutate: updateReservation } = useUpdate();

  // Map API data to UI format
  const reservations = reservationsData?.data
    ? (reservationsData.data as Reservation[]).map(mapReservationToUI)
    : [];

  // Check user authentication and access
  if (!user) {
    return (
      <div className='container mx-auto p-4 max-w-6xl'>
        <Card className='text-center'>
          <Title level={3}>Vui lòng đăng nhập để xem lịch sử đặt bàn</Title>
          <Button
            type='primary'
            href='/login-customer'
          >
            Đăng nhập
          </Button>
        </Card>
      </div>
    );
  }

  if (!isCustomer && !user.phone) {
    return (
      <div className='container mx-auto p-4 max-w-6xl'>
        <Card className='text-center'>
          <Title level={3}>Không thể xem lịch sử đặt bàn</Title>
          <Text>Tài khoản của bạn chưa có thông tin khách hàng hoặc số điện thoại</Text>
          <br />
          <Button
            type='primary'
            href='/'
            style={{ marginTop: 16 }}
          >
            Về trang chủ
          </Button>
        </Card>
      </div>
    );
  }

  // Helper function to check if reservation is upcoming (future time)
  const isUpcoming = (reservation: UIReservation) => {
    const reservationDateTime = dayjs(`${reservation.date} ${reservation.time}`);
    const now = dayjs();
    return (
      reservationDateTime.isAfter(now) &&
      (reservation.status === 'confirmed' || reservation.status === 'pending')
    );
  };

  // Helper function to check if reservation can be cancelled
  const canBeCancelled = (reservation: UIReservation) => {
    return isUpcoming(reservation);
  };

  // Filter reservations based on search text, date range and status
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.id.toString().includes(searchText) ||
      reservation.table_number.toLowerCase().includes(searchText.toLowerCase()) ||
      reservation.special_request.toLowerCase().includes(searchText.toLowerCase());

    const matchesDateRange =
      !dateRange ||
      (dayjs(reservation.date).isAfter(dateRange[0], 'day') &&
        dayjs(reservation.date).isBefore(dateRange[1], 'day'));

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'upcoming' && isUpcoming(reservation)) ||
      (activeTab === 'completed' &&
        reservation.status === 'confirmed' &&
        dayjs(`${reservation.date} ${reservation.time}`).isBefore(dayjs())) ||
      (activeTab === 'cancelled' && reservation.status === 'cancelled');

    return matchesSearch && matchesDateRange && matchesTab;
  });

  // Get status tag color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'gold';
      case 'completed':
        return 'blue';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Đang chờ xác nhận';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleOutlined />;
      case 'pending':
        return <ExclamationCircleOutlined />;
      case 'completed':
        return <CheckCircleOutlined />;
      case 'cancelled':
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  // Handle view reservation details
  const handleViewDetails = (reservation: UIReservation) => {
    setSelectedReservation(reservation);
    setIsDetailModalVisible(true);
  };

  // Get reservation step status
  const getReservationStepStatus = (status: string, stepIndex: number) => {
    if (status === 'cancelled') {
      return stepIndex === 0 ? 'finish' : stepIndex === 3 ? 'finish' : 'error';
    }

    if (status === 'pending') {
      return stepIndex === 0 ? 'finish' : stepIndex === 1 ? 'process' : 'wait';
    }

    if (status === 'confirmed') {
      return stepIndex <= 1 ? 'finish' : stepIndex === 2 ? 'process' : 'wait';
    }

    return 'wait';
  };

  // Handle cancel reservation
  const handleCancelReservation = (reservationId: number) => {
    Modal.confirm({
      title: 'Xác nhận hủy đặt bàn',
      content: 'Bạn có chắc chắn muốn hủy đặt bàn này? Hành động này không thể hoàn tác.',
      okText: 'Xác nhận hủy',
      cancelText: 'Không hủy',
      okType: 'danger',
      onOk() {
        updateReservation(
          {
            resource: 'reservations',
            id: reservationId,
            values: { status: 'cancelled' },
          },
          {
            onSuccess: () => {
              refetch();
              setIsDetailModalVisible(false);
            },
          },
        );
      },
    });
  };
  // Reservation table columns
  const columns: ColumnsType<UIReservation> = [
    {
      title: 'Mã đặt bàn',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span className='font-medium'>{id}</span>,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <span>
          <CalendarOutlined className='mr-1' />
          {dayjs(date).format('DD/MM/YYYY')}
        </span>
      ),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Giờ',
      dataIndex: 'time',
      key: 'time',
      render: (time, record) => {
        const reservationDateTime = dayjs(`${record.date} ${time}`);
        const now = dayjs();
        const isUpcomingTime = reservationDateTime.isAfter(now);

        return (
          <div>
            <div>
              <ClockCircleOutlined className='mr-1' />
              {time}
            </div>
            {record.status !== 'cancelled' && (
              <div className='text-xs'>
                {isUpcomingTime ? (
                  <div>
                    <Text type='success'>Sắp tới</Text>
                    <br />
                    <Text
                      type='secondary'
                      className='text-xs'
                    >
                      Còn{' '}
                      {(() => {
                        const diff = reservationDateTime.diff(now, 'minute');
                        if (diff < 60) return `${diff} phút`;
                        if (diff < 1440) return `${Math.floor(diff / 60)} giờ`;
                        return `${Math.floor(diff / 1440)} ngày`;
                      })()}{' '}
                      nữa
                    </Text>
                  </div>
                ) : (
                  <Text type='secondary'>Đã qua</Text>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Số người',
      dataIndex: 'party_size',
      key: 'party_size',
      render: (size) => (
        <span>
          <TeamOutlined className='mr-1' />
          {size} người
        </span>
      ),
    },
    {
      title: 'Bàn',
      dataIndex: 'table_number',
      key: 'table_number',
      render: (table) =>
        table ? <Tag color='blue'>{table}</Tag> : <Text type='secondary'>Chưa xác định</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          icon={getStatusIcon(status)}
          color={getStatusColor(status)}
        >
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Đã xác nhận', value: 'confirmed' },
        { text: 'Đang chờ xác nhận', value: 'pending' },
        { text: 'Đã hoàn thành', value: 'completed' },
        { text: 'Đã hủy', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type='primary'
            size='small'
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>

          {canBeCancelled(record) && (
            <Button
              danger
              size='small'
              onClick={() => handleCancelReservation(record.id)}
            >
              Hủy đặt bàn
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return <PageLoader text='Đang tải dữ liệu...' />;
  }

  return (
    <MainLayout>
      <div className='container mx-auto p-4 max-w-6xl'>
        <Title
          level={3}
          className='mb-6'
        >
          Lịch sử đặt bàn
        </Title>

        <Card className='mb-6 shadow-sm'>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className='mb-4'
            items={[
              {
                label: `Tất cả (${reservations.length})`,
                key: 'all',
              },
              {
                label: `Sắp tới (${reservations.filter((r) => isUpcoming(r)).length})`,
                key: 'upcoming',
              },
              {
                label: `Đã hoàn thành (${
                  reservations.filter(
                    (r) =>
                      r.status === 'confirmed' && dayjs(`${r.date} ${r.time}`).isBefore(dayjs()),
                  ).length
                })`,
                key: 'completed',
              },
              {
                label: `Đã hủy (${reservations.filter((r) => r.status === 'cancelled').length})`,
                key: 'cancelled',
              },
            ]}
          />

          <Row
            gutter={16}
            className='mb-4'
          >
            <Col
              xs={24}
              md={12}
            >
              <Input
                placeholder='Tìm kiếm theo mã đặt bàn, số bàn, ghi chú...'
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col
              xs={24}
              md={12}
            >
              <RangePicker
                style={{ width: '100%' }}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                format='DD/MM/YYYY'
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Col>
          </Row>

          {filteredReservations.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredReservations}
              rowKey='id'
              pagination={{ pageSize: 5 }}
              bordered
            />
          ) : (
            <Empty
              description={
                <span>
                  Không có lịch sử đặt bàn nào
                  {searchText && ` phù hợp với từ khóa "${searchText}"`}
                </span>
              }
            >
              <Button
                type='primary'
                href='/reservation'
              >
                Đặt bàn ngay
              </Button>
            </Empty>
          )}
        </Card>

        {/* Reservation Detail Modal */}
        <Modal
          title={
            <span>
              Chi tiết đặt bàn{' '}
              <Tag
                icon={selectedReservation ? getStatusIcon(selectedReservation.status) : null}
                color={selectedReservation ? getStatusColor(selectedReservation.status) : 'default'}
              >
                {selectedReservation ? getStatusText(selectedReservation.status) : ''}
              </Tag>
            </span>
          }
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            selectedReservation && canBeCancelled(selectedReservation) && (
              <Button
                key='cancel'
                danger
                onClick={() => handleCancelReservation(selectedReservation.id)}
              >
                Hủy đặt bàn
              </Button>
            ),
            <Button
              key='close'
              onClick={() => setIsDetailModalVisible(false)}
            >
              Đóng
            </Button>,
          ]}
          width={700}
        >
          {selectedReservation && (
            <>
              <Steps
                current={
                  selectedReservation.status === 'pending'
                    ? 1
                    : selectedReservation.status === 'confirmed'
                      ? 2
                      : 0
                }
                status={selectedReservation.status === 'cancelled' ? 'error' : 'process'}
                className='mb-6'
                size='small'
              >
                <Step
                  title='Đặt bàn'
                  status={getReservationStepStatus(selectedReservation.status, 0)}
                  description={dayjs(selectedReservation.created_at).format('DD/MM/YYYY HH:mm')}
                />
                <Step
                  title='Chờ xác nhận'
                  status={getReservationStepStatus(selectedReservation.status, 1)}
                />
                <Step
                  title='Đã xác nhận'
                  status={getReservationStepStatus(selectedReservation.status, 2)}
                  description={selectedReservation.status === 'cancelled' ? 'Đã hủy' : ''}
                />
                {/* <Step 
                title="Hoàn thành" 
                status={getReservationStepStatus(selectedReservation.status, 3)}
              /> */}
              </Steps>

              <Descriptions
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
              >
                <Descriptions.Item label='Mã đặt bàn'>{selectedReservation.id}</Descriptions.Item>
                <Descriptions.Item label='Ngày tạo'>
                  {dayjs(selectedReservation.created_at).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label='Họ tên'>{selectedReservation.name}</Descriptions.Item>
                <Descriptions.Item label='Số điện thoại'>
                  {selectedReservation.phone}
                </Descriptions.Item>
                <Descriptions.Item label='Email'>{selectedReservation.email}</Descriptions.Item>
                <Descriptions.Item label='Ngày đặt bàn'>
                  {dayjs(selectedReservation.date).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label='Giờ đặt bàn'>
                  {selectedReservation.time}
                </Descriptions.Item>
                <Descriptions.Item label='Số người'>
                  {selectedReservation.party_size} người
                </Descriptions.Item>
                {selectedReservation.table_number && (
                  <Descriptions.Item label='Số bàn'>
                    {selectedReservation.table_number}
                  </Descriptions.Item>
                )}
                {selectedReservation.special_request && (
                  <Descriptions.Item
                    label='Yêu cầu đặc biệt'
                    span={2}
                  >
                    {selectedReservation.special_request}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <div className='mt-6'>
                <Title level={5}>Lưu ý:</Title>
                <ul className='pl-5'>
                  <li>Vui lòng đến đúng giờ đã đặt.</li>
                  {canBeCancelled(selectedReservation) ? (
                    <li className='text-orange-600'>
                      <strong>Bạn có thể hủy đặt bàn này</strong> vì thời gian đặt bàn chưa đến.
                      Khuyến nghị hủy trước ít nhất 2 giờ.
                    </li>
                  ) : (
                    <li className='text-gray-500'>
                      Không thể hủy đặt bàn này vì thời gian đặt bàn đã qua hoặc đã bị hủy.
                    </li>
                  )}
                  <li>
                    Nếu đến trễ quá 15 phút so với giờ đặt, chúng tôi có thể nhường bàn cho khách
                    khác.
                  </li>
                  <li>
                    Nếu có thay đổi về số lượng người hoặc giờ đặt, vui lòng liên hệ trực tiếp với
                    nhà hàng.
                  </li>
                </ul>
              </div>
            </>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default HistoryReservation;
