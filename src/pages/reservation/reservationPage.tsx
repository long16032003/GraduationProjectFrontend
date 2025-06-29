import React, { useState, useEffect } from 'react';
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
import { 
  UserOutlined, 
  PhoneOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  TeamOutlined, 
  CommentOutlined, 
  HomeOutlined, 
  EnvironmentOutlined, 
  CheckCircleOutlined,
  SearchOutlined,
  RollbackOutlined,
  SaveOutlined,
  TableOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Reservation, TableModel } from '@/types';
import { useCreate, useList } from '@refinedev/core';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';
import { areas } from '@/utils/constant';

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

const ReservationPage: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTable, setSelectedTable] = useState<TableModel | null>(null);
  const [availableTables, setAvailableTables] = useState<TableModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  
  // Function to get default time rounded to nearest half hour
  const getDefaultTime = () => {
    const now = dayjs();
    const minutes = now.minute();
    const roundedTime = now.clone();
    
    if (minutes < 30) {
      // Round to next :30
      return roundedTime.minute(30).second(0);
    } else {
      // Round to next hour :00
      return roundedTime.add(1, 'hour').minute(0).second(0);
    }
  };
  
  const [searchParams, setSearchParams] = useState({
    date: dayjs(),
    time: getDefaultTime(),
    guests: 1
  });

  // API hooks
  const { mutate: createReservation } = useCreate<Reservation>();
  
  // Tạo useState để lưu các tham số filter
  const [tableFilters, setTableFilters] = useState({
    capacity: searchParams.guests,
    capacity_operator: 'gte',
    available: true,
    date: searchParams.date.format('YYYY-MM-DD'),
    time: searchParams.time.format('HH:mm:00')
  });
  
  // Hook useList với tham số meta
  const { data: listTables, isLoading: isLoadingList, refetch: refetchListTables } = useList<TableModel>({
    resource: 'tables',
    meta: tableFilters,
    queryOptions: {
      enabled: false,
    }
  });

  // Dùng useEffect để tự động gọi refetchListTables khi tableFilters thay đổi
  const [shouldRefetch, setShouldRefetch] = useState(false);
  
  useEffect(() => {
    if (shouldRefetch) {
      const fetchData = async () => {
        try {
          const result = await refetchListTables();
          
          // Sử dụng kết quả trực tiếp từ refetch thay vì listTables
          if (result && result.data && result.data.data) {
            setAvailableTables(result.data.data);
          } else {
            setAvailableTables([]);
          }
          setCurrentStep(1);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching tables:", error);
          message.error('Không thể tải danh sách bàn. Vui lòng thử lại.');
          setLoading(false);
        }
      };
      
      fetchData();
      setShouldRefetch(false);
    }
  }, [refetchListTables, shouldRefetch]); // Chỉ phụ thuộc vào shouldRefetch, không phụ thuộc vào tableFilters

  // Step 1: Nhập thông tin cơ bản
  const handleSearchTables = async (values: SearchValues) => {
    try {
      setLoading(true);
      // Combine date and time for comparison
      const selectedDateTime = values.date.clone().hour(values.time.hour()).minute(values.time.minute());
      const currentDateTime = dayjs();
      
      if(selectedDateTime.isBefore(currentDateTime)) {
        message.error('Thời gian đặt bàn phải lớn hơn thời gian hiện tại');
        setLoading(false);
        return;
      }
      
      // Cập nhật searchParams
      setSearchParams({
        date: values.date,
        time: values.time,
        guests: values.number_of_guests
      });
      
      // Cập nhật tableFilters và trigger refetch
      setTableFilters({
        capacity: values.number_of_guests,
        capacity_operator: 'gte',
        available: true,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm:00')
      });
      setShouldRefetch(true);
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
      console.log("Submit reservation", values);
      
      // Cách tạo timestamp đúng cách với múi giờ +7
      const selectedDate = searchParams.date.clone();
      const selectedTime = searchParams.time;
      
      // Đặt giờ và phút từ selectedTime vào selectedDate
      const combinedDate = selectedDate
        .hour(selectedTime.hour())
        .minute(selectedTime.minute())
        .second(0);
      
      console.log("Combined local datetime:", combinedDate.format('YYYY-MM-DD HH:mm:ss'));
      
      // Chuyển đổi thành timestamp (tính bằng giây)
      // Sử dụng unix() của dayjs để tránh vấn đề múi giờ
      const timestamp = combinedDate.unix();
      
      console.log("Timestamp created (seconds):", timestamp);
      console.log("Converted back to datetime:", dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss'));
      
      // Tạo đối tượng dữ liệu để gửi
      const reservationData = {
        name: values.name,
        phone: values.phone,
        table_id: selectedTable?.id,
        number_of_guests: searchParams.guests,
        notes: values.notes,
        reservation_date: timestamp,
        status: 'confirmed',
      };

      console.log("Reservation data:", reservationData);
      
      console.log("Data to be sent:", reservationData);
      
      // Gọi API đặt bàn
      await createReservation({
        resource: "reservations",
        values: reservationData
      });
      
      setTimeout(() => {
        setReservationSuccess(true);
        setCurrentStep(3);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Reservation error:", error);
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
    <MainLayout>
      <div className='py-10 px-4 min-h-screen'>
        <div className='max-w-4xl mx-auto'>
          <Card
            title={
              <div className='text-center p-3'>
                <Title
                  level={2}
                  className='!text-orange-700 mb-2'
                >
                  Đặt bàn
                </Title>
                <Text className='text-gray-500'>
                  Hãy để chúng tôi phục vụ bạn một bữa ăn tuyệt vời
                </Text>
              </div>
            }
            className='shadow-lg p-0'
          >
            <Steps
              current={currentStep}
              className='mb-8'
            >
              <Step
                icon={<CalendarOutlined />}
                title='Thông tin đặt bàn'
                description='Nhập thông tin cơ bản'
              />
              <Step
                icon={<TableOutlined />}
                title='Chọn bàn'
                description='Chọn bàn phù hợp'
              />
              <Step
                icon={<UserOutlined />}
                title='Xác nhận'
                description='Xác nhận thông tin đặt bàn'
              />
              <Step
                icon={<CheckCircleOutlined />}
                title='Hoàn tất'
                description='Đặt bàn thành công'
              />
            </Steps>

            {currentStep === 0 && (
              <Form
                form={form}
                layout='vertical'
                onFinish={handleSearchTables}
                initialValues={{
                  date: dayjs(),
                  time: getDefaultTime(),
                }}
              >
                <Row gutter={16}>
                  <Col
                    xs={24}
                    md={12}
                  >
                    <Form.Item
                      name='date'
                      label={
                        <span>
                          <CalendarOutlined className='mr-1' /> Ngày đặt bàn
                        </span>
                      }
                      rules={[{ required: true, message: 'Vui lòng chọn ngày đặt bàn' }]}
                    >
                      <DatePicker
                        className='w-full'
                        format='DD/MM/YYYY'
                        disabledDate={(current) => {
                          return current && current < dayjs().startOf('day');
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    md={12}
                  >
                    <Form.Item
                      name='time'
                      label={
                        <span>
                          <ClockCircleOutlined className='mr-1' /> Giờ đặt bàn
                        </span>
                      }
                      rules={[{ required: true, message: 'Vui lòng chọn giờ đặt bàn' }]}
                    >
                                              <TimePicker
                         className='w-full'
                         format='HH:mm'
                          minuteStep={30}
                          hideDisabledOptions={true}
                          allowClear={false}
                          autoFocus={false}
                          onSelect={(time) => {
                            form.setFieldsValue({ time });
                            // Close the picker after selection
                            const timePickerInput = document.querySelector('.ant-picker-input input');
                            if (timePickerInput) {
                              (timePickerInput as HTMLElement).blur();
                            }
                          }}
                          disabledTime={() => ({
                           disabledMinutes: () =>
                             Array.from({ length: 60 })
                               .map((_, i) => i)
                               .filter((min) => min % 30 !== 0),
                          })}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name='number_of_guests'
                  label={
                    <span>
                      <TeamOutlined className='mr-1' /> Số người
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Vui lòng nhập số người' },
                    { type: 'number', min: 1, message: 'Số người phải lớn hơn 0' },
                  ]}
                >
                  <InputNumber
                    min={1}
                    className='w-full'
                  />
                </Form.Item>

                <Form.Item className='text-center'>
                  <Button
                    type='primary'
                    htmlType='submit'
                    size='large'
                    loading={loading}
                    icon={<SearchOutlined />}
                  >
                    Tìm bàn trống
                  </Button>
                </Form.Item>
              </Form>
            )}

            {currentStep === 1 && (
              <div>
                <div className='mb-4 bg-blue-50 p-4 rounded-lg'>
                  <Title level={5}>Thông tin tìm kiếm:</Title>
                  <Text className='block'>
                    <CalendarOutlined className='mr-2' /> Ngày:{' '}
                    {searchParams.date.format('DD/MM/YYYY')}
                  </Text>
                  <Text className='block'>
                    <ClockCircleOutlined className='mr-2' /> Giờ:{' '}
                    {searchParams.time.format('HH:mm')}
                  </Text>
                  <Text className='block'>
                    <TeamOutlined className='mr-2' /> Số người: {searchParams.guests}
                  </Text>
                </div>

                {availableTables.length > 0 ? (
                  <Table
                    dataSource={availableTables}
                    columns={columns}
                    rowKey='id'
                    pagination={false}
                  />
                ) : (
                  <Result
                    status='warning'
                    title='Không tìm thấy bàn trống'
                    subTitle='Vui lòng thử lại với thời gian khác hoặc số người khác'
                    extra={
                      <Button
                        type='primary'
                        onClick={handleReset}
                        icon={<RollbackOutlined />}
                      >
                        Thử lại
                      </Button>
                    }
                  />
                )}

                <div className='mt-4 text-center'>
                  <Button
                    onClick={() => setCurrentStep(0)}
                    icon={<RollbackOutlined />}
                  >
                    Quay lại
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && selectedTable && (
              <Form
                form={form}
                layout='vertical'
                onFinish={handleSubmitReservation}
                initialValues={searchParams}
              >
                <div className='mb-6 bg-blue-50 p-4 rounded-lg'>
                  <Title level={5}>Thông tin bàn đã chọn:</Title>
                  <Text className='block'>
                    <CheckCircleOutlined className='mr-2' /> Bàn: {selectedTable.name}
                  </Text>
                  <Text className='block'>
                    <EnvironmentOutlined className='mr-2' /> Khu vực:{' '}
                    {areas[selectedTable.area as keyof typeof areas]}
                  </Text>
                  <Text className='block'>
                    <CalendarOutlined className='mr-2' /> Ngày:{' '}
                    {searchParams.date.format('DD/MM/YYYY')}
                  </Text>
                  <Text className='block'>
                    <ClockCircleOutlined className='mr-2' /> Giờ:{' '}
                    {searchParams.time.format('HH:mm')}
                  </Text>
                  <Text className='block'>
                    <TeamOutlined className='mr-2' /> Số người: {searchParams.guests}
                  </Text>
                </div>

                <Form.Item
                  name='name'
                  label='Họ tên'
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ tên' },
                    { max: 100, message: 'Tên không được quá 100 ký tự' },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder='Nhập họ tên của bạn'
                  />
                </Form.Item>

                <Form.Item
                  name='phone'
                  label='Số điện thoại'
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder='Nhập số điện thoại của bạn'
                  />
                </Form.Item>

                <Form.Item
                  name='notes'
                  label={
                    <span>
                      <CommentOutlined className='mr-1' /> Ghi chú
                    </span>
                  }
                  rules={[{ max: 500, message: 'Ghi chú không được quá 500 ký tự' }]}
                >
                  <Input.TextArea
                    placeholder='Nhập yêu cầu đặc biệt nếu có (món ăn yêu thích, vị trí bàn,...)'
                    rows={4}
                  />
                </Form.Item>

                <Form.Item className='text-center'>
                  <Space>
                    <Button
                      onClick={() => setCurrentStep(1)}
                      icon={<RollbackOutlined />}
                    >
                      Quay lại
                    </Button>
                    <Button
                      type='primary'
                      htmlType='submit'
                      size='large'
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Xác nhận đặt bàn
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            )}

            {currentStep === 3 && (
              <Result
                status='success'
                title='Đặt bàn thành công!'
                subTitle='Chúng tôi sẽ liên hệ với bạn để xác nhận đặt bàn trong thời gian sớm nhất'
                extra={[
                  <Button
                    type='primary'
                    key='home'
                    onClick={() => (window.location.href = '/')}
                    icon={<HomeOutlined />}
                  >
                    Về trang chủ
                  </Button>,
                  <Button
                    key='again'
                    onClick={handleReset}
                    icon={<CalendarOutlined />}
                  >
                    Đặt bàn khác
                  </Button>,
                ]}
              />
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReservationPage; 