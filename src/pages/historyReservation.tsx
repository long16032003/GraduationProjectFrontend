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
  Tabs
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
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PageLoader } from '@/components/ui/loader';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Step } = Steps;

// Interface definitions
interface Reservation {
  id: number;
  reservation_code: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  party_size: number;
  special_request: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  table_number: string;
  created_at: string;
}

// Mock data for demonstration
const generateMockReservations = (): Reservation[] => {
  return [
    {
      id: 1001,
      reservation_code: 'RES10012023',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@example.com',
      date: '2023-07-10',
      time: '18:00',
      party_size: 4,
      special_request: 'Bàn gần cửa sổ',
      status: 'completed',
      table_number: 'T05',
      created_at: '2023-07-05T14:30:00'
    },
    {
      id: 1002,
      reservation_code: 'RES10022023',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@example.com',
      date: '2023-07-15',
      time: '19:30',
      party_size: 2,
      special_request: 'Sinh nhật',
      status: 'confirmed',
      table_number: 'T08',
      created_at: '2023-07-10T09:45:00'
    },
    {
      id: 1003,
      reservation_code: 'RES10032023',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@example.com',
      date: '2023-07-20',
      time: '12:00',
      party_size: 6,
      special_request: '',
      status: 'pending',
      table_number: '',
      created_at: '2023-07-18T16:20:00'
    },
    {
      id: 1004,
      reservation_code: 'RES10042023',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@example.com',
      date: '2023-06-28',
      time: '18:30',
      party_size: 3,
      special_request: 'Vị trí yên tĩnh',
      status: 'cancelled',
      table_number: '',
      created_at: '2023-06-25T11:15:00'
    },
    {
      id: 1005,
      reservation_code: 'RES10052023',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@example.com',
      date: '2023-08-05',
      time: '20:00',
      party_size: 8,
      special_request: 'Đặt bàn cho tiệc gia đình',
      status: 'confirmed',
      table_number: 'T12',
      created_at: '2023-07-30T13:40:00'
    }
  ];
};

const HistoryReservation: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [reservations] = useState<Reservation[]>(generateMockReservations());
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filter reservations based on search text, date range and status
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.reservation_code.toLowerCase().includes(searchText.toLowerCase()) ||
      reservation.table_number.toLowerCase().includes(searchText.toLowerCase()) ||
      reservation.special_request.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesDateRange = !dateRange || (
      dayjs(reservation.date).isAfter(dateRange[0], 'day') && 
      dayjs(reservation.date).isBefore(dateRange[1], 'day')
    );
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'upcoming' && (reservation.status === 'confirmed' || reservation.status === 'pending')) ||
      (activeTab === 'completed' && reservation.status === 'completed') || 
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
  const handleViewDetails = (reservation: Reservation) => {
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
    
    if (status === 'completed') {
      return 'finish';
    }
    
    return 'wait';
  };

  // Reservation table columns
  const columns: ColumnsType<Reservation> = [
    {
      title: 'Mã đặt bàn',
      dataIndex: 'reservation_code',
      key: 'reservation_code',
      render: (code) => <span className="font-medium">{code}</span>,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <span>
          <CalendarOutlined className="mr-1" />
          {dayjs(date).format('DD/MM/YYYY')}
        </span>
      ),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Giờ',
      dataIndex: 'time',
      key: 'time',
      render: (time) => (
        <span>
          <ClockCircleOutlined className="mr-1" />
          {time}
        </span>
      ),
    },
    {
      title: 'Số người',
      dataIndex: 'party_size',
      key: 'party_size',
      render: (size) => (
        <span>
          <TeamOutlined className="mr-1" />
          {size} người
        </span>
      ),
    },
    {
      title: 'Bàn',
      dataIndex: 'table_number',
      key: 'table_number',
      render: (table) => (
        table ? (
          <Tag color="blue">{table}</Tag>
        ) : (
          <Text type="secondary">Chưa xác định</Text>
        )
      ),
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
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          
          {(record.status === 'confirmed' || record.status === 'pending') && (
            <Button
              danger
              size="small"
              onClick={() => console.log('Cancel reservation', record.id)}
            >
              Hủy đặt bàn
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return <PageLoader text="Đang tải dữ liệu..." />;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
        <Breadcrumb.Item href="/profile">Tài khoản</Breadcrumb.Item>
        <Breadcrumb.Item>Lịch sử đặt bàn</Breadcrumb.Item>
      </Breadcrumb>
      
      <Title level={2} className="mb-6">Lịch sử đặt bàn</Title>
      
      <Card className="mb-6 shadow-sm">
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-4">
          <TabPane tab="Tất cả" key="all" />
          <TabPane tab="Sắp tới" key="upcoming" />
          <TabPane tab="Đã hoàn thành" key="completed" />
          <TabPane tab="Đã hủy" key="cancelled" />
        </Tabs>
        
        <Row gutter={16} className="mb-4">
          <Col xs={24} md={12}>
            <Input
              placeholder="Tìm kiếm theo mã đặt bàn, số bàn, ghi chú..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
        </Row>
        
        {filteredReservations.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredReservations}
            rowKey="id"
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
            <Button type="primary" href="/reservation">Đặt bàn ngay</Button>
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
          selectedReservation && (selectedReservation.status === 'confirmed' || selectedReservation.status === 'pending') && (
            <Button
              key="cancel"
              danger
              onClick={() => console.log('Cancel reservation', selectedReservation?.id)}
            >
              Hủy đặt bàn
            </Button>
          ),
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedReservation && (
          <>
            <Steps
              current={
                selectedReservation.status === 'pending' ? 1 :
                selectedReservation.status === 'confirmed' ? 2 :
                selectedReservation.status === 'completed' ? 3 : 0
              }
              status={selectedReservation.status === 'cancelled' ? 'error' : 'process'}
              className="mb-6"
              size="small"
            >
              <Step 
                title="Đặt bàn" 
                status={getReservationStepStatus(selectedReservation.status, 0)}
                description={dayjs(selectedReservation.created_at).format('DD/MM/YYYY HH:mm')} 
              />
              <Step 
                title="Chờ xác nhận" 
                status={getReservationStepStatus(selectedReservation.status, 1)}
              />
              <Step 
                title="Đã xác nhận" 
                status={getReservationStepStatus(selectedReservation.status, 2)}
                description={selectedReservation.status === 'cancelled' ? 'Đã hủy' : ''}
              />
              <Step 
                title="Hoàn thành" 
                status={getReservationStepStatus(selectedReservation.status, 3)}
              />
            </Steps>
            
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Mã đặt bàn">
                {selectedReservation.reservation_code}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(selectedReservation.created_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Họ tên">
                {selectedReservation.name}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedReservation.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedReservation.email}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt bàn">
                {dayjs(selectedReservation.date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Giờ đặt bàn">
                {selectedReservation.time}
              </Descriptions.Item>
              <Descriptions.Item label="Số người">
                {selectedReservation.party_size} người
              </Descriptions.Item>
              {selectedReservation.table_number && (
                <Descriptions.Item label="Số bàn">
                  {selectedReservation.table_number}
                </Descriptions.Item>
              )}
              {selectedReservation.special_request && (
                <Descriptions.Item label="Yêu cầu đặc biệt" span={2}>
                  {selectedReservation.special_request}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            <div className="mt-6">
              <Title level={5}>Lưu ý:</Title>
              <ul className="pl-5">
                <li>Vui lòng đến đúng giờ đã đặt.</li>
                <li>Nếu muốn hủy đặt bàn, vui lòng hủy trước ít nhất 2 giờ.</li>
                <li>Nếu đến trễ quá 15 phút so với giờ đặt, chúng tôi có thể nhường bàn cho khách khác.</li>
                <li>Nếu có thay đổi về số lượng người hoặc giờ đặt, vui lòng liên hệ trực tiếp với nhà hàng.</li>
              </ul>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default HistoryReservation;