import React, { useState, useEffect } from 'react';
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
  ColorPicker,
  Spin
} from 'antd';
import { CanAccess, useCreate, useList, useUpdate } from '@refinedev/core';
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
import type { UploadFile, UploadProps, RcFile } from 'antd/es/upload/interface';
import type { Color } from 'antd/es/color-picker';

// Interface for uploaded media

import { PageLoader } from '@/components/ui/loader';
import { NoPermission } from '@/components/NoPermission';
import type { Media } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;
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
  
  // Images - logo và favicon lưu trực tiếp path, banner lưu array paths
  logo: string;
  favicon: string;
  bannerImages: Media[];
}

// Interface for API setting item
interface SettingItem {
  key: string;
  value: string;
}

// Interface for API response data
interface ApiSettingsResponse {
  site_name?: string;
  site_tagline?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  opening_hours?: string;
  facebook_url?: string;
  zalo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  heading_font?: string;
  body_font?: string;
  font_size?: string;
  logo?: string;
  favicon?: string;
  banner_images?: string;
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
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Fetch settings from API
  const { data: settingsData, isLoading: settingsLoading, error: settingsError } = useList({
    resource: 'site-settings',
    pagination: { mode: 'off' },
  });

  // Debug API response
  useEffect(() => {
    if (settingsData) {
      console.log('Settings API Response:', settingsData);
      console.log('Settings data type:', typeof settingsData.data);
      console.log('Is array:', Array.isArray(settingsData.data));
      console.log('Data length:', settingsData.data?.length);
    }
    if (settingsError) {
      console.error('Settings API Error:', settingsError);
    }
  }, [settingsData, settingsError]);

  // Update settings mutation
  const { mutate: updateSettings } = useUpdate();

  // Process settings data from API
  useEffect(() => {
    console.log('Processing settings data...', { settingsData, isLoading: settingsLoading });
    
    if (settingsData?.data && typeof settingsData.data === 'object' && !Array.isArray(settingsData.data)) {
      console.log('Settings data is object, processing...');
      const apiData = settingsData.data as ApiSettingsResponse;
      console.log('API data object:', apiData);

      // Parse banner images from API - now they are paths array
      let parsedBannerImages: Media[] = [];
      try {
        if (apiData.banner_images) {
          const parsed = JSON.parse(apiData.banner_images);
          if (Array.isArray(parsed)) {
            // Convert paths to Media objects for display
            parsedBannerImages = parsed.map((path: string, index: number) => ({
              id: index + 1,  // Temporary ID for display
              path: path,
              title: `Banner ${index + 1}`,
              type: 'image/jpeg',  // Default type
              size: 0,  // Unknown size
              created_at: '',
              updated_at: ''
            } as Media));
          }
        }
      } catch (error) {
        console.error('Error parsing banner images:', error);
        parsedBannerImages = [];
      }

      // Map API response directly to form fields (since it's already an object)
      const formData: SiteSettings = {
        siteName: apiData.site_name || '',
        siteTagline: apiData.site_tagline || '',
        contactEmail: apiData.contact_email || '',
        contactPhone: apiData.contact_phone || '',
        address: apiData.address || '',
        openingHours: apiData.opening_hours || '',
        facebookUrl: apiData.facebook_url || '',
        zaloUrl: apiData.zalo_url || '',
        primaryColor: apiData.primary_color || '#e53935',
        secondaryColor: apiData.secondary_color || '#4caf50',
        accentColor: apiData.accent_color || '#ff9800',
        headingFont: apiData.heading_font || 'Montserrat, sans-serif',
        bodyFont: apiData.body_font || 'Roboto, sans-serif',
        fontSize: apiData.font_size || 'medium',
        logo: apiData.logo ? (() => {
          try { 
            const parsed = JSON.parse(apiData.logo);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed[0].path : '';
          } 
          catch { return ''; }
        })() : '',
        favicon: apiData.favicon ? (() => {
          try { 
            const parsed = JSON.parse(apiData.favicon);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed[0].path : '';
          } 
          catch { return ''; }
        })() : '',
        bannerImages: parsedBannerImages,
      };

      console.log('Form data created:', formData);
      
      // Set banner files state
      setBannerFiles(parsedBannerImages);
      
      // Set logo and favicon files from paths
      if (formData.logo) {
        setLogoFile({
          id: 1,
          path: formData.logo,
          title: 'Logo',
          type: 'image',
          size: 0,
          created_at: '',
          updated_at: ''
        });
      }
      
      if (formData.favicon) {
        setFaviconFile({
          id: 1,
          path: formData.favicon,
          title: 'Favicon',
          type: 'image',
          size: 0,
          created_at: '',
          updated_at: ''
        });
      }
      
      setSettings(formData);
      
      // Force update form fields
      setTimeout(() => {
        form.resetFields();
        form.setFieldsValue(formData);
        console.log('Form values after reset and set:', form.getFieldsValue());
      }, 100);
    } else if (!settingsLoading) {
      // No data from API, use empty form
      console.log('No settings data found or unexpected format, using empty form');
      const emptySettings: SiteSettings = {
        siteName: '',
        siteTagline: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        openingHours: '',
        facebookUrl: '',
        zaloUrl: '',
        primaryColor: '#e53935',
        secondaryColor: '#4caf50',
        accentColor: '#ff9800',
        headingFont: 'Montserrat, sans-serif',
        bodyFont: 'Roboto, sans-serif',
        fontSize: 'medium',
        logo: '',
        favicon: '',
        bannerImages: [],
      };
      setSettings(emptySettings);
      setBannerFiles([]);
      setLogoFile(null);
      setFaviconFile(null);
      form.setFieldsValue(emptySettings);
    }
  }, [settingsData, settingsLoading, form]);
  
  // Helper function to convert Color object to hex string
  const getColorString = (color: string | Color | undefined | { hex: string }): string => {
    if (typeof color === 'string') {
      return color;
    }
    if (color && typeof color === 'object') {
      if ('toHexString' in color) {
        return color.toHexString();
      }
      if ('hex' in color) {
        return color.hex;
      }
    }
    return color || '#000000';
  };

  // Handle form submit
  const handleSubmit = (values: SiteSettings) => {
    setIsSaving(true);
    
    console.log('Form submit values:', values);
    
    // Helper function to extract paths from images
    const getImagePaths = (images: Media[]): string => {
      if (!images || !Array.isArray(images)) return '[]';
      return JSON.stringify(images.map(img => img.path).filter(Boolean));
    };

    // Convert form values to API format
    const settingsToUpdate = {
      site_name: values.siteName,
      site_tagline: values.siteTagline,
      contact_email: values.contactEmail,
      contact_phone: values.contactPhone,
      address: values.address,
      opening_hours: values.openingHours,
      facebook_url: values.facebookUrl,
      zalo_url: values.zaloUrl,
      primary_color: getColorString(values.primaryColor),
      secondary_color: getColorString(values.secondaryColor),
      accent_color: getColorString(values.accentColor),
      heading_font: values.headingFont,
      body_font: values.bodyFont,
      font_size: values.fontSize,
      logo: logoFile ? logoFile.path : '',
      favicon: faviconFile ? faviconFile.path : '',
      banner_images: getImagePaths(bannerFiles),
    };
    
    console.log('Settings to update:', settingsToUpdate);

    updateSettings(
      {
        resource: 'site-settings',
        id: '1', // Using a dummy id since we're updating all settings
        values: { settings: settingsToUpdate },
      },
      {
        onSuccess: () => {
          message.success('Lưu thiết lập thành công!');
          setIsSaving(false);
        },
        onError: (error) => {
          console.error('Error updating settings:', error);
          message.error('Có lỗi xảy ra khi lưu thiết lập!');
          setIsSaving(false);
        },
      }
    );
  };
  
  // Upload states
  const [logoFile, setLogoFile] = useState<Media | null>(null);
  const [faviconFile, setFaviconFile] = useState<Media | null>(null);
  const [bannerFiles, setBannerFiles] = useState<Media[]>([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Upload mutation
  const { mutate: uploadImage } = useCreate();

  // API URL
  const API_URL = import.meta.env.VITE_API_URL;

  // Handle logo upload
  const handleLogoUpload = async (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < 2;

    console.log(file);

    if (!isJpgOrPng) {
      message.error('Chỉ chấp nhận JPG/PNG!');
      return false;
    }

    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
      return false;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'logos');

      uploadImage(
        {
          resource: 'upload-image',
          values: formData,
        },
        {
          onSuccess: (response) => {
            console.log('Logo upload success:', response);
            if (response?.data) {
              setLogoFile(response.data as Media);
              form.setFieldsValue({ logo: [response.data] });
              message.success('Tải logo thành công');
            }
            setUploadingLogo(false);
          },
          onError: (error) => {
            console.error('Logo upload error:', error);
            message.error('Lỗi khi upload logo');
            setUploadingLogo(false);
          },
        }
      );
    } catch (error) {
      message.error('Lỗi khi upload logo');
      setUploadingLogo(false);
    }

    return false;
  };

  // Handle favicon upload
  const handleFaviconUpload = async (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/x-icon';
    const isLt1M = file.size / 1024 / 1024 < 1;

    if (!isJpgOrPng) {
      message.error('Chỉ chấp nhận JPG/PNG/ICO!');
      return false;
    }

    if (!isLt1M) {
      message.error('Favicon phải nhỏ hơn 1MB!');
      return false;
    }

    try {
      setUploadingFavicon(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'favicons');

      uploadImage(
        {
          resource: 'upload-image',
          values: formData,
        },
        {
          onSuccess: (response) => {
            console.log('Favicon upload success:', response);
            if (response?.data) {
              setFaviconFile(response.data as Media);
              form.setFieldsValue({ favicon: [response.data] });
              message.success('Tải favicon thành công');
            }
            setUploadingFavicon(false);
          },
          onError: (error) => {
            console.error('Favicon upload error:', error);
            message.error('Lỗi khi upload favicon');
            setUploadingFavicon(false);
          },
        }
      );
    } catch (error) {
      message.error('Lỗi khi upload favicon');
      setUploadingFavicon(false);
    }

    return false;
  };

  // Handle banner images upload
  const handleBannerUpload = async (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt5M = file.size / 1024 / 1024 < 5;

    console.log("banner", file.type, isJpgOrPng, isLt5M);

    if (!isJpgOrPng) {
      message.error('Chỉ chấp nhận JPG/PNG!');
      return false;
    }

    if (!isLt5M) {
      message.error('Ảnh banner phải nhỏ hơn 5MB!');
      return false;
    }

    try {
      setUploadingBanner(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'banners');

      uploadImage(
        {
          resource: 'upload-image',
          values: formData,
        },
        {
          onSuccess: (response) => {
            console.log('Banner upload success:', response);
            if (response?.data) {
              const newMediaFile = response.data as Media;
              const newBannerFiles = [...bannerFiles, newMediaFile];
              setBannerFiles(newBannerFiles);
              
              // Update form values
              form.setFieldsValue({ bannerImages: newBannerFiles });
              
              // Update settings state
              setSettings(prev => prev ? { ...prev, bannerImages: newBannerFiles } : null);
              
              message.success('Tải ảnh banner thành công');
            }
            setUploadingBanner(false);
          },
          onError: (error) => {
            console.error('Banner upload error:', error);
            message.error('Lỗi khi upload ảnh banner');
            setUploadingBanner(false);
          },
        }
      );
    } catch (error) {
      message.error('Lỗi khi upload ảnh banner');
      setUploadingBanner(false);
    }

    return false;
  };

  // Handle remove banner image
  const handleRemoveBanner = (index: number) => {
    const newBannerFiles = bannerFiles.filter((_, i) => i !== index);
    setBannerFiles(newBannerFiles);
    form.setFieldsValue({ bannerImages: newBannerFiles });
  };

  // Handle color picker changes
  const handleColorChange = (field: string) => (color: Color) => {
    form.setFieldsValue({ [field]: getColorString(color) });
  };
  
  // Preview component for images
  const previewImage = (file: UploadFile | Media): string => {
    // If it's a Media object
    if ('path' in file) {
      return `${API_URL}/storage/${file.path}`;
    }
    
    // If it's an UploadFile
    const uploadFile = file as UploadFile;
    if (!uploadFile.url && !uploadFile.preview) {
      uploadFile.preview = URL.createObjectURL(uploadFile.originFileObj as Blob);
    }
    return (uploadFile.url || uploadFile.preview || '') as string;
  };

  // Upload button components
  const uploadButton = (text: string) => (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>{text}</div>
    </div>
  );

  // Tab items configuration (moved inside component to ensure form context)
  const tabItems = [
    {
      key: 'general',
      label: 'Thông tin chung',
      children: (
        <>
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
        </>
      ),
    },
    {
      key: 'appearance',
      label: 'Giao diện',
      children: (
        <>
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
                  value={settings?.primaryColor}
                  onChange={handleColorChange('primaryColor')}
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
                  value={settings?.secondaryColor}
                  onChange={handleColorChange('secondaryColor')}
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
                  value={settings?.accentColor}
                  onChange={handleColorChange('accentColor')}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <div className="mt-6 mb-4">
            <Title level={5}>Xem trước bảng màu</Title>
            <div className="flex flex-wrap gap-4 mt-3">
              <div 
                className="w-32 h-32 rounded-lg flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: settings?.primaryColor || '#e53935' }}
              >
                <div className="text-center">
                  <div className="font-bold">Màu chính</div>
                  <div>{settings?.primaryColor || '#e53935'}</div>
                </div>
              </div>
              
              <div 
                className="w-32 h-32 rounded-lg flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: settings?.secondaryColor || '#4caf50' }}
              >
                <div className="text-center">
                  <div className="font-bold">Màu phụ</div>
                  <div>{settings?.secondaryColor || '#4caf50'}</div>
                </div>
              </div>
              
              <div 
                className="w-32 h-32 rounded-lg flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: settings?.accentColor || '#ff9800' }}
              >
                <div className="text-center">
                  <div className="font-bold">Màu nhấn</div>
                  <div>{settings?.accentColor || '#ff9800'}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      key: 'images',
      label: 'Hình ảnh',
      children: (
        <>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Logo"
                tooltip="Kích thước khuyến nghị: 200x80px"
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={handleLogoUpload}
                  showUploadList={false}
                  fileList={[]}
                >
                  {logoFile ? (
                    <img 
                      src={`${API_URL}/storage/${logoFile.path}`} 
                      alt="Logo preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    uploadButton('Tải lên logo')
                  )}
                </Upload>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                label="Favicon"
                tooltip="Kích thước khuyến nghị: 32x32px"
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={handleFaviconUpload}
                  showUploadList={false}
                  fileList={[]}
                >
                  {faviconFile ? (
                    <img 
                      src={`${API_URL}/storage/${faviconFile.path}`} 
                      alt="Favicon preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    uploadButton('Tải lên favicon')
                  )}
                </Upload>
              </Form.Item>
            </Col>
            
            <Col xs={24}>
              <Form.Item
                label="Ảnh banner"
                tooltip="Kích thước khuyến nghị: 1920x600px"
              >
                <Upload
                  listType="picture-card"
                  maxCount={5}
                  multiple
                  beforeUpload={handleBannerUpload}
                  fileList={bannerFiles.map((media, index) => ({
                    uid: String(media.id || index),
                    name: media.title || `banner-${index + 1}`,
                    status: 'done' as const,
                    url: `${API_URL}/storage/${media.path}`,
                  }))}
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                    showDownloadIcon: false,
                  }}
                  onRemove={(file) => {
                    // Handle remove banner image
                    const index = bannerFiles.findIndex(img => String(img.id) === file.uid);
                    if (index > -1) {
                      const newBannerFiles = bannerFiles.filter((_, i) => i !== index);
                      setBannerFiles(newBannerFiles);
                      form.setFieldsValue({ bannerImages: newBannerFiles });
                      setSettings(prev => prev ? { ...prev, bannerImages: newBannerFiles } : null);
                    }
                  }}
                >
                  {bannerFiles.length >= 5 ? null : uploadButton('Tải lên ảnh banner')}
                </Upload>
              </Form.Item>
              <Text type="secondary">Bạn có thể tải lên tối đa 5 ảnh banner. Các ảnh sẽ được hiển thị luân phiên trên trang chủ.</Text>
            </Col>
          </Row>
          
          <Divider>Xem trước</Divider>
          
          <div className="border p-4 rounded-lg bg-gray-50">
            <div className="flex items-center mb-4">
              {settings?.logo ? (
                <img 
                  src={`${API_URL}/storage/${settings.logo}`} 
                  alt="Logo preview" 
                  className="h-12 mr-4"
                />
              ) : (
                <div className="h-12 w-32 bg-gray-200 flex items-center justify-center mr-4">
                  <Text type="secondary">Logo</Text>
                </div>
              )}
              
              <div>
                <div className="font-bold text-lg" style={{ fontFamily: settings?.headingFont || 'Montserrat, sans-serif' }}>
                  {settings?.siteName || 'Tên nhà hàng'}
                </div>
                <div className="text-sm text-gray-500" style={{ fontFamily: settings?.bodyFont || 'Roboto, sans-serif' }}>
                  {settings?.siteTagline || 'Khẩu hiệu nhà hàng'}
                </div>
              </div>
            </div>
            
            <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center">
              {settings?.bannerImages?.length ? (
                <img 
                  src={`${API_URL}/storage/${settings.bannerImages[0].path}`} 
                  alt="Banner preview" 
                  className="w-full h-40 object-cover rounded"
                />
              ) : (
                <Text type="secondary">Ảnh banner sẽ hiển thị ở đây</Text>
              )}
            </div>
          </div>
        </>
      ),
    }
    // {
    //   key: 'typography',
    //   label: 'Typography',
    //   children: (
    //     <>
    //       <Row gutter={16}>
    //         <Col xs={24} md={8}>
    //           <Form.Item
    //             name="headingFont"
    //             label="Font chữ tiêu đề"
    //             tooltip="Font chữ sử dụng cho các tiêu đề"
    //           >
    //             <Select>
    //               {fontOptions.map(font => (
    //                 <Option key={font.value} value={font.value}>
    //                   <span style={{ fontFamily: font.value }}>{font.label}</span>
    //                 </Option>
    //               ))}
    //             </Select>
    //           </Form.Item>
    //         </Col>
            
    //         <Col xs={24} md={8}>
    //           <Form.Item
    //             name="bodyFont"
    //             label="Font chữ nội dung"
    //             tooltip="Font chữ sử dụng cho nội dung"
    //           >
    //             <Select>
    //               {fontOptions.map(font => (
    //                 <Option key={font.value} value={font.value}>
    //                   <span style={{ fontFamily: font.value }}>{font.label}</span>
    //                 </Option>
    //               ))}
    //             </Select>
    //           </Form.Item>
    //         </Col>
            
    //         <Col xs={24} md={8}>
    //           <Form.Item
    //             name="fontSize"
    //             label="Kích thước chữ"
    //             tooltip="Kích thước chữ cơ bản cho trang web"
    //           >
    //             <Select>
    //               {fontSizeOptions.map(size => (
    //                 <Option key={size.value} value={size.value}>
    //                   {size.label}
    //                 </Option>
    //               ))}
    //             </Select>
    //           </Form.Item>
    //         </Col>
    //       </Row>
          
    //       <Divider>Xem trước Typography</Divider>
          
    //       <div className="border p-6 rounded-lg bg-gray-50">
    //         <div 
    //           className="text-3xl font-bold mb-3"
    //           style={{ fontFamily: settings?.headingFont || 'Montserrat, sans-serif' }}
    //         >
    //           Tiêu đề lớn (H1)
    //         </div>
            
    //         <div 
    //           className="text-2xl font-bold mb-3"
    //           style={{ fontFamily: settings?.headingFont || 'Montserrat, sans-serif' }}
    //         >
    //           Tiêu đề vừa (H2)
    //         </div>
            
    //         <div 
    //           className="text-xl font-bold mb-4"
    //           style={{ fontFamily: settings?.headingFont || 'Montserrat, sans-serif' }}
    //         >
    //           Tiêu đề nhỏ (H3)
    //         </div>
            
    //         <div 
    //           className="mb-3"
    //           style={{ 
    //             fontFamily: settings?.bodyFont || 'Roboto, sans-serif',
    //             fontSize: settings?.fontSize === 'small' ? '14px' : 
    //                      settings?.fontSize === 'large' ? '18px' : '16px'
    //           }}
    //         >
    //           Đây là đoạn văn mẫu để xem trước font chữ và kích thước chữ. 
    //           Việc lựa chọn font chữ phù hợp sẽ giúp trang web của bạn trở nên chuyên nghiệp 
    //           và dễ đọc hơn. Bạn nên chọn font chữ phù hợp với phong cách và thương hiệu của nhà hàng.
    //         </div>
            
    //         <div 
    //           className="text-sm"
    //           style={{ fontFamily: settings?.bodyFont || 'Roboto, sans-serif' }}
    //         >
    //           Đây là chữ nhỏ thường dùng cho chân trang hoặc ghi chú.
    //         </div>
    //       </div>
    //     </>
    //   ),
    // },
  ];
  
  if (settingsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large">
          <div className="p-8">
            <div className="text-center text-gray-500">Đang tải thiết lập...</div>
          </div>
        </Spin>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="p-4">
        <Card>
          <div className="text-center py-8">
            <Title level={4} type="danger">Lỗi tải dữ liệu thiết lập</Title>
            <Text>Không thể kết nối với API. Vui lòng kiểm tra console để xem chi tiết.</Text>
            <br />
            <Button 
              type="primary" 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Thử lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <CanAccess resource='site-settings' action='create' fallback={<NoPermission />}>
      <div className="p-4">
      <Card className="shadow-sm mb-4">
        <Breadcrumb 
          className="mb-4"
          items={[
            {
              title: <a href="/admin">Dashboard</a>,
            },
            {
              title: 'Thiết lập trang web',
            },
          ]}
        />
        
        <div className="flex justify-between items-center mb-4">
          <Title level={3} className="m-0">
            <GlobalOutlined className="mr-2" />
            Thiết lập trang web
          </Title>
          
          <Space>
            <Button
              type="default"
              onClick={() => {
                console.log('Current settings:', settings);
                console.log('Current form values:', form.getFieldsValue());
                console.log('API data:', settingsData);
              }}
            >
              Debug Info
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={isSaving}
            >
              Lưu thiết lập
            </Button>
          </Space>
        </div>
        
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            key={JSON.stringify(settings)}
          >
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
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
    </CanAccess>
  );
};

export default SiteSettings;
