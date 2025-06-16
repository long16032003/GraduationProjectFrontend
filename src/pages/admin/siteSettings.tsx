import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Upload,
  Select,
  Switch,
  Space,
  Typography,
  Breadcrumb,
  Tabs,
  Row,
  Col,
  Divider,
  message,
  Tooltip,
  ColorPicker
} from 'antd';
import {
  SaveOutlined,
  UploadOutlined,
  PictureOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  MobileOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { Color } from 'antd/es/color-picker';
import { PageLoader } from '@/components/ui/loader';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

// Interface for site settings
interface SiteSettings {
  // General
  siteName: string;
  siteTagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  openingHours: string;
  
  // Social Media
  facebookUrl: string;
  zaloUrl: string;
  
  // Appearance
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Typography
  headingFont: string;
  bodyFont: string;
  fontSize: string;
  
  // Images
  logo: UploadFile[];
  favicon: UploadFile[];
  bannerImages: UploadFile[];
}

// Font options
const fontOptions = [
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Oswald, sans-serif', label: 'Oswald' },
  { value: 'Merriweather, serif', label: 'Merriweather' },
  { value: 'Dancing Script, cursive', label: 'Dancing Script' },
  { value: 'Pacifico, cursive', label: 'Pacifico' }
];

// Font size options
const fontSizeOptions = [
  { value: 'small', label: 'Nhỏ (14px)' },
  { value: 'medium', label: 'Vừa (16px)' },
  { value: 'large', label: 'Lớn (18px)' }
];

const SiteSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Mock initial data
  const initialSettings: SiteSettings = {
    siteName: 'Nhà hàng Việt Nam',
    siteTagline: 'Hương vị truyền thống - Phục vụ chuyên nghiệp',
    contactEmail: 'contact@restaurant.com',
    contactPhone: '0901234567',
    address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    openingHours: '08:00 - 22:00 (Thứ 2 - Chủ nhật)',
    facebookUrl: 'https://facebook.com/restaurant',
    zaloUrl: 'https://zalo.com/restaurant',
    primaryColor: '#e53935',
    secondaryColor: '#4caf50',
    accentColor: '#ff9800',
    headingFont: 'Montserrat, sans-serif',
    bodyFont: 'Roboto, sans-serif',
    fontSize: 'medium',
    logo: [],
    favicon: [],
    bannerImages: []
  };
  
  // Handle form submit
  const handleSubmit = (values: SiteSettings) => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form values:', values);
      message.success('Lưu thiết lập thành công!');
      setIsSaving(false);
    }, 1500);
  };
  
  // Handle logo upload
  const handleLogoUpload: UploadProps['onChange'] = ({ fileList }) => {
    form.setFieldsValue({ logo: fileList });
  };
  
  // Handle favicon upload
  const handleFaviconUpload: UploadProps['onChange'] = ({ fileList }) => {
    form.setFieldsValue({ favicon: fileList });
  };
  
  // Handle banner images upload
  const handleBannerUpload: UploadProps['onChange'] = ({ fileList }) => {
    form.setFieldsValue({ bannerImages: fileList });
  };
  
  // Preview component for images
  const previewImage = (file: UploadFile): string => {
    if (!file.url && !file.preview) {
      file.preview = URL.createObjectURL(file.originFileObj as Blob);
    }
    return (file.url || file.preview || '') as string;
  };

  // Upload button components
  const uploadButton = (text: string) => (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>{text}</div>
    </div>
  );
  
  return (
    <div className="p-4">
      <Card className="shadow-sm mb-4">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item href="/admin">Dashboard</Breadcrumb.Item>
          <Breadcrumb.Item>Thiết lập trang web</Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="m-0">
            <GlobalOutlined className="mr-2" />
            Thiết lập trang web
          </Title>
          
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={isSaving}
          >
            Lưu thiết lập
          </Button>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={initialSettings}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Thông tin chung" key="general">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="siteName"
                    label="Tên nhà hàng"
                    rules={[{ required: true, message: 'Vui lòng nhập tên nhà hàng' }]}
                  >
                    <Input placeholder="Nhập tên nhà hàng" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    name="siteTagline"
                    label="Khẩu hiệu"
                    tooltip="Khẩu hiệu ngắn gọn mô tả nhà hàng của bạn"
                  >
                    <Input placeholder="Nhập khẩu hiệu" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    name="contactEmail"
                    label="Email liên hệ"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email liên hệ' },
                      { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Nhập email liên hệ" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    name="contactPhone"
                    label="Số điện thoại liên hệ"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại liên hệ' }]}
                  >
                    <Input prefix={<MobileOutlined />} placeholder="Nhập số điện thoại liên hệ" />
                  </Form.Item>
                </Col>
                
                <Col xs={24}>
                  <Form.Item
                    name="address"
                    label="Địa chỉ"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                  >
                    <TextArea
                      // prefix={<EnvironmentOutlined />}
                      placeholder="Nhập địa chỉ nhà hàng"
                      rows={2}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24}>
                  <Form.Item
                    name="openingHours"
                    label="Giờ mở cửa"
                    rules={[{ required: true, message: 'Vui lòng nhập giờ mở cửa' }]}
                  >
                    <Input prefix={<ClockCircleOutlined />} placeholder="Ví dụ: 08:00 - 22:00 (Thứ 2 - Chủ nhật)" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider>Mạng xã hội</Divider>
              
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="facebookUrl"
                    label="Facebook"
                  >
                    <Input prefix={<FacebookOutlined />} placeholder="https://facebook.com/..." />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={8}>
                  <Form.Item
                    name="zaloUrl"
                    label="Zalo"
                  >
                    <Input prefix={<InstagramOutlined />} placeholder="https://zalo.com/..." />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane tab="Giao diện" key="appearance">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="primaryColor"
                    label="Màu chính"
                    tooltip="Màu chủ đạo của trang web"
                  >
                    <ColorPicker
                      format="hex"
                      showText
                      disabledAlpha
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={8}>
                  <Form.Item
                    name="secondaryColor"
                    label="Màu phụ"
                    tooltip="Màu phụ của trang web"
                  >
                    <ColorPicker
                      format="hex"
                      showText
                      disabledAlpha
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={8}>
                  <Form.Item
                    name="accentColor"
                    label="Màu nhấn"
                    tooltip="Màu dùng cho các nút, liên kết"
                  >
                    <ColorPicker
                      format="hex"
                      showText
                      disabledAlpha
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <div className="mt-6 mb-4">
                <Title level={5}>Xem trước bảng màu</Title>
                <div className="flex flex-wrap gap-4 mt-3">
                  <div 
                    className="w-32 h-32 rounded-lg flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: form.getFieldValue('primaryColor') }}
                  >
                    <div className="text-center">
                      <div className="font-bold">Màu chính</div>
                      <div>{form.getFieldValue('primaryColor')}</div>
                    </div>
                  </div>
                  
                  <div 
                    className="w-32 h-32 rounded-lg flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: form.getFieldValue('secondaryColor') }}
                  >
                    <div className="text-center">
                      <div className="font-bold">Màu phụ</div>
                      <div>{form.getFieldValue('secondaryColor')}</div>
                    </div>
                  </div>
                  
                  <div 
                    className="w-32 h-32 rounded-lg flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: form.getFieldValue('accentColor') }}
                  >
                    <div className="text-center">
                      <div className="font-bold">Màu nhấn</div>
                      <div>{form.getFieldValue('accentColor')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPane>
            
            <TabPane tab="Hình ảnh" key="images">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="logo"
                    label="Logo"
                    tooltip="Kích thước khuyến nghị: 200x80px"
                    valuePropName="fileList"
                    getValueFromEvent={e => e?.fileList}
                  >
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={handleLogoUpload}
                    >
                      {form.getFieldValue('logo')?.length ? null : uploadButton('Tải lên logo')}
                    </Upload>
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    name="favicon"
                    label="Favicon"
                    tooltip="Kích thước khuyến nghị: 32x32px"
                    valuePropName="fileList"
                    getValueFromEvent={e => e?.fileList}
                  >
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={handleFaviconUpload}
                    >
                      {form.getFieldValue('favicon')?.length ? null : uploadButton('Tải lên favicon')}
                    </Upload>
                  </Form.Item>
                </Col>
                
                <Col xs={24}>
                  <Form.Item
                    name="bannerImages"
                    label="Ảnh banner"
                    tooltip="Kích thước khuyến nghị: 1920x600px"
                    valuePropName="fileList"
                    getValueFromEvent={e => e?.fileList}
                  >
                    <Upload
                      listType="picture-card"
                      maxCount={5}
                      multiple
                      beforeUpload={() => false}
                      onChange={handleBannerUpload}
                    >
                      {form.getFieldValue('bannerImages')?.length >= 5 ? null : uploadButton('Tải lên ảnh banner')}
                    </Upload>
                  </Form.Item>
                  <Text type="secondary">Bạn có thể tải lên tối đa 5 ảnh banner. Các ảnh sẽ được hiển thị luân phiên trên trang chủ.</Text>
                </Col>
              </Row>
              
              <Divider>Xem trước</Divider>
              
              <div className="border p-4 rounded-lg bg-gray-50">
                <div className="flex items-center mb-4">
                  {form.getFieldValue('logo')?.length ? (
                    <img 
                      src={previewImage(form.getFieldValue('logo')[0])} 
                      alt="Logo preview" 
                      className="h-12 mr-4"
                    />
                  ) : (
                    <div className="h-12 w-32 bg-gray-200 flex items-center justify-center mr-4">
                      <Text type="secondary">Logo</Text>
                    </div>
                  )}
                  
                  <div>
                    <div className="font-bold text-lg" style={{ fontFamily: form.getFieldValue('headingFont') }}>
                      {form.getFieldValue('siteName') || 'Tên nhà hàng'}
                    </div>
                    <div className="text-sm text-gray-500" style={{ fontFamily: form.getFieldValue('bodyFont') }}>
                      {form.getFieldValue('siteTagline') || 'Khẩu hiệu nhà hàng'}
                    </div>
                  </div>
                </div>
                
                <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center">
                  {form.getFieldValue('bannerImages')?.length ? (
                    <img 
                      src={previewImage(form.getFieldValue('bannerImages')[0])} 
                      alt="Banner preview" 
                      className="w-full h-40 object-cover rounded"
                    />
                  ) : (
                    <Text type="secondary">Ảnh banner sẽ hiển thị ở đây</Text>
                  )}
                </div>
              </div>
            </TabPane>
            
            <TabPane tab="Typography" key="typography">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="headingFont"
                    label="Font chữ tiêu đề"
                    tooltip="Font chữ sử dụng cho các tiêu đề"
                  >
                    <Select>
                      {fontOptions.map(font => (
                        <Option key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={8}>
                  <Form.Item
                    name="bodyFont"
                    label="Font chữ nội dung"
                    tooltip="Font chữ sử dụng cho nội dung"
                  >
                    <Select>
                      {fontOptions.map(font => (
                        <Option key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={8}>
                  <Form.Item
                    name="fontSize"
                    label="Kích thước chữ"
                    tooltip="Kích thước chữ cơ bản cho trang web"
                  >
                    <Select>
                      {fontSizeOptions.map(size => (
                        <Option key={size.value} value={size.value}>
                          {size.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider>Xem trước Typography</Divider>
              
              <div className="border p-6 rounded-lg bg-gray-50">
                <div 
                  className="text-3xl font-bold mb-3"
                  style={{ fontFamily: form.getFieldValue('headingFont') }}
                >
                  Tiêu đề lớn (H1)
                </div>
                
                <div 
                  className="text-2xl font-bold mb-3"
                  style={{ fontFamily: form.getFieldValue('headingFont') }}
                >
                  Tiêu đề vừa (H2)
                </div>
                
                <div 
                  className="text-xl font-bold mb-4"
                  style={{ fontFamily: form.getFieldValue('headingFont') }}
                >
                  Tiêu đề nhỏ (H3)
                </div>
                
                <div 
                  className="mb-3"
                  style={{ 
                    fontFamily: form.getFieldValue('bodyFont'),
                    fontSize: form.getFieldValue('fontSize') === 'small' ? '14px' : 
                             form.getFieldValue('fontSize') === 'large' ? '18px' : '16px'
                  }}
                >
                  Đây là đoạn văn mẫu để xem trước font chữ và kích thước chữ. 
                  Việc lựa chọn font chữ phù hợp sẽ giúp trang web của bạn trở nên chuyên nghiệp 
                  và dễ đọc hơn. Bạn nên chọn font chữ phù hợp với phong cách và thương hiệu của nhà hàng.
                </div>
                
                <div 
                  className="text-sm"
                  style={{ fontFamily: form.getFieldValue('bodyFont') }}
                >
                  Đây là chữ nhỏ thường dùng cho chân trang hoặc ghi chú.
                </div>
              </div>
            </TabPane>
          </Tabs>
        </Form>
      </Card>
      
      <Card className="shadow-sm">
        <div className="flex items-center">
          <InfoCircleOutlined className="text-blue-500 mr-2" />
          <Title level={5} className="m-0">Lưu ý khi thiết lập trang web</Title>
        </div>
        <ul className="mt-4 pl-5">
          <li className="mb-2">Logo nên có nền trong suốt và kích thước phù hợp.</li>
          <li className="mb-2">Ảnh banner nên có cùng kích thước và tỷ lệ để hiển thị đồng nhất.</li>
          <li className="mb-2">Chọn bảng màu phù hợp với thương hiệu của nhà hàng.</li>
          <li>Sử dụng font chữ dễ đọc và phù hợp với phong cách nhà hàng.</li>
        </ul>
      </Card>
    </div>
  );
};

export default SiteSettings;
