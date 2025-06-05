import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  DatePicker, 
  TimePicker, 
  InputNumber, 
  message, 
  Typography, 
  Result, 
  Steps,
  Row,
  Col,
  Table,
  Space
} from 'antd';
import { UserOutlined, PhoneOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { TableModel } from '@/types';
import { useList, useCreate, useCustom, useCustomMutation } from '@refinedev/core';

const { Title, Text } = Typography;
const { Step } = Steps;

interface ReservationFormData {
  name: string;
  phone: string;
  table_id: number;
  date: dayjs.Dayjs;
  time: dayjs.Dayjs;
  number_of_guests: number;
  notes?: string;
}

interface SearchValues {
  date: dayjs.Dayjs;
  time: dayjs.Dayjs;
  number_of_guests: number;
}

// Dữ liệu mẫu cho các bàn
const mockTables: TableModel[] = [
  {
    id: 1,
    creator_id: 1,
    name: 'Bàn VIP 1',
    capacity: 8,
    status: 'available',
    area: '1st floor',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  },
  {
    id: 2,
    creator_id: 1,
    name: 'Bàn gia đình 3',
    capacity: 6,
    status: 'available',
    area: '2nd floor',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }
];

const ReservationPage: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTable, setSelectedTable] = useState<TableModel | null>(null);
  const [availableTables, setAvailableTables] = useState<TableModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [searchParams, setSearchParams] = useState({
    date: dayjs(),
    time: dayjs(),
    guests: 1
  });

  const { data: listTables, isLoading: isLoadingTables } = useList<TableModel>({
    resource: 'tables',
  });

  // Step 1: Nhập thông tin cơ bản
  const handleSearchTables = async (values: SearchValues) => {
    try {
      setLoading(true);
      setSearchParams({
        date: values.date,
        time: values.time,
        guests: values.number_of_guests
      });

      // Mô phỏng API call để lấy bàn trống
      setTimeout(() => {
        // Lọc bàn theo số người
        const filteredTables = listTables?.data.filter(
          (table) => table.capacity >= values.number_of_guests
        );
        setAvailableTables(filteredTables || []);
        setCurrentStep(1);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('Có lỗi xảy ra khi tìm bàn trống');
      setLoading(false);
    }
  };

  // Step 2: Chọn bàn
  const handleTableSelect = (table: TableModel) => {
    setSelectedTable(table);
    setCurrentStep(2);
  };

  // Step 3: Xác nhận thông tin và đặt bàn
  const handleSubmitReservation = async (values: ReservationFormData) => {
    try {
      setLoading(true);
      
      // Kết hợp ngày và giờ thành một timestamp
      const combinedDateTime = values.date
        .hour(values.time.hour())
        .minute(values.time.minute())
        .second(0);
      
      // Mô phỏng API call để đặt bàn
      setTimeout(() => {
        setReservationSuccess(true);
        setCurrentStep(3);
        message.success('Đặt bàn thành công!');
        setLoading(false);
      }, 1500);
    } catch (error) {
      message.error('Có lỗi xảy ra khi đặt bàn');
      setLoading(false);
    }
  };

  // Reset form và quay lại bước đầu tiên
  const handleReset = () => {
    form.resetFields();
    setSelectedTable(null);
    setAvailableTables([]);
    setCurrentStep(0);
    setReservationSuccess(false);
  };

  const areas = {
    '1st floor' : 'Tầng 1',
    '2nd floor' : 'Tầng 2', 
    '3rd floor' : 'Tầng 3', 
    'rooftop' : 'Sân thượng'
  };

  const columns = [
    {
      title: 'Tên bàn',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Khu vực',
      dataIndex: 'area',
      key: 'area',
      render: (text: string) => areas[text as keyof typeof areas] || text,
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (text: number) => `${text} người`,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: TableModel) => (
        <Button 
          type="primary" 
          onClick={() => handleTableSelect(record)}
        >
          Chọn bàn
        </Button>
      ),
    },
  ];

  return (
    <div className="py-10 px-4 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Card 
          title={
            <div className="text-center">
              <Title level={2} className="!text-orange-700 mb-2">Đặt bàn</Title>
              <Text className="text-gray-500">Hãy để chúng tôi phục vụ bạn một bữa ăn tuyệt vời</Text>
            </div>
          }
          className="shadow-lg"
        >
          <Steps current={currentStep} className="mb-8">
            <Step title="Thông tin đặt bàn" description="Nhập thông tin cơ bản" />
            <Step title="Chọn bàn" description="Chọn bàn phù hợp" />
            <Step title="Xác nhận" description="Xác nhận thông tin đặt bàn" />
            <Step title="Hoàn tất" description="Đặt bàn thành công" />
          </Steps>

          {currentStep === 0 && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSearchTables}
              initialValues={{
                date: dayjs(),
                time: dayjs(),
                number_of_guests: 1
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="date"
                    label="Ngày đặt bàn"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày đặt bàn' }]}
                  >
                    <DatePicker 
                      className="w-full" 
                      format="DD/MM/YYYY"
                      disabledDate={(current) => {
                        return current && current < dayjs().startOf('day');
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="time"
                    label="Giờ đặt bàn"
                    rules={[{ required: true, message: 'Vui lòng chọn giờ đặt bàn' }]}
                  >
                    <TimePicker 
                      className="w-full" 
                      format="HH:mm"
                      minuteStep={30}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="number_of_guests"
                label="Số người"
                rules={[
                  { required: true, message: 'Vui lòng nhập số người' },
                  { type: 'number', min: 1, message: 'Số người phải lớn hơn 0' }
                ]}
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>

              <Form.Item className="text-center">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  loading={loading}
                >
                  Tìm bàn trống
                </Button>
              </Form.Item>
            </Form>
          )}

          {currentStep === 1 && (
            <div>
              <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                <Title level={5}>Thông tin tìm kiếm:</Title>
                <Text className="block">Ngày: {searchParams.date.format('DD/MM/YYYY')}</Text>
                <Text className="block">Giờ: {searchParams.time.format('HH:mm')}</Text>
                <Text className="block">Số người: {searchParams.guests}</Text>
              </div>

              {availableTables.length > 0 ? (
                <Table 
                  dataSource={availableTables} 
                  columns={columns} 
                  rowKey="id"
                  pagination={false}
                />
              ) : (
                <Result
                  status="warning"
                  title="Không tìm thấy bàn trống"
                  subTitle="Vui lòng thử lại với thời gian khác hoặc số người khác"
                  extra={
                    <Button type="primary" onClick={handleReset}>
                      Thử lại
                    </Button>
                  }
                />
              )}

              <div className="mt-4 text-center">
                <Button onClick={() => setCurrentStep(0)}>
                  Quay lại
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && selectedTable && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitReservation}
              initialValues={{
                date: searchParams.date,
                time: searchParams.time,
                number_of_guests: searchParams.guests
              }}
            >
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <Title level={5}>Thông tin bàn đã chọn:</Title>
                <Text className="block">Bàn: {selectedTable.name}</Text>
                <Text className="block">Khu vực: {areas[selectedTable.area as keyof typeof areas]}</Text>
                <Text className="block">Sức chứa: {selectedTable.capacity} người</Text>
              </div>

              <Form.Item
                name="name"
                label="Họ tên"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ tên' },
                  { max: 100, message: 'Tên không được quá 100 ký tự' }
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập họ tên của bạn" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại của bạn" />
              </Form.Item>

              <Form.Item
                name="notes"
                label="Ghi chú"
                rules={[
                  { max: 500, message: 'Ghi chú không được quá 500 ký tự' }
                ]}
              >
                <Input.TextArea 
                  placeholder="Nhập yêu cầu đặc biệt nếu có (món ăn yêu thích, vị trí bàn,...)" 
                  rows={4} 
                />
              </Form.Item>

              <Form.Item className="text-center">
                <Space>
                  <Button onClick={() => setCurrentStep(1)}>
                    Quay lại
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large"
                    loading={loading}
                  >
                    Xác nhận đặt bàn
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}

          {currentStep === 3 && (
            <Result
              status="success"
              title="Đặt bàn thành công!"
              subTitle="Chúng tôi sẽ liên hệ với bạn để xác nhận đặt bàn trong thời gian sớm nhất"
              extra={[
                <Button 
                  type="primary" 
                  key="home" 
                  onClick={() => window.location.href = '/'}
                >
                  Về trang chủ
                </Button>,
                <Button 
                  key="again" 
                  onClick={handleReset}
                >
                  Đặt bàn khác
                </Button>,
              ]}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReservationPage; 