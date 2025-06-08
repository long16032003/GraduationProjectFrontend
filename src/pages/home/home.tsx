import React from 'react';
import { Button, Card, Carousel, Row, Col, Typography, Space, Divider } from 'antd';
import { PhoneOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { router } from '@/router';
import { Link } from 'react-router';

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  // Mock data cho các sections
  const bannerImages = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200',
  ];

  const featuredDishes = [
    {
      name: 'Bò Wellington',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300',
      description: 'Thịt bò thượng hạng bọc trong lớp vỏ bánh ngàn lớp',
      price: '850.000đ'
    },
    {
      name: 'Cá Hồi Áp Chảo',
      image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=300',
      description: 'Cá hồi Na Uy kèm sốt chanh dây',
      price: '450.000đ'
    },
    {
      name: 'Risotto Nấm Truffle',
      image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300',
      description: 'Cơm Ý với nấm truffle đen',
      price: '380.000đ'
    },
  ];

  return (
    <div className="min-h-screen ">
      {/* Hero Section với Carousel */} 
      <Carousel autoplay effect="fade" className="h-[600px]">
        {bannerImages.map((image, index) => (
          <div key={index}>
            <div 
              className="h-[600px] bg-cover bg-center relative"
              style={{ backgroundImage: `url(${image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <Title level={1} className="text-white mb-6 !text-5xl font-bold">
                    Nhà Hàng Bamboo Sông Chanh
                  </Title>
                  <Text className="text-xl block mb-8 text-white/90">
                    Tinh hoa ẩm thực Quảng Yên
                  </Text>
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => window.location.href = '/reservation'}
                  >
                    Đặt bàn ngay
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Thông tin nhà hàng */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={8}>
              <Card className="text-center h-full hover:shadow-lg transition-all duration-300">
                <PhoneOutlined className="text-4xl text-orange-600 mb-4" />
                <Title level={4} className="!text-orange-700">Liên hệ</Title>
                <Text className="text-gray-600">033 328 3999</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="text-center h-full hover:shadow-lg transition-all duration-300">
                <EnvironmentOutlined className="text-4xl text-orange-600 mb-4" />
                <Title level={4} className="!text-orange-700">Địa chỉ</Title>
                <Text className="text-gray-600">Bắc Cầu sông Chanh phường Quảng Yên, T.X Quảng Yên, Tỉnh Quảng Ninh, Vietnam</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="text-center h-full hover:shadow-lg transition-all duration-300">
                <ClockCircleOutlined className="text-4xl text-orange-600 mb-4" />
                <Title level={4} className="!text-orange-700">Giờ mở cửa</Title>
                <Text className="text-gray-600">10:00 - 22:30</Text>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Món ăn nổi bật */}
      <div className="bg-orange-50 py-16">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12 !text-orange-700">
            Món Ăn Nổi Bật
          </Title>
          <Row gutter={[32, 32]}>
            {featuredDishes.map((dish, index) => (
              <Col xs={24} sm={8} key={index}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={dish.name}
                      src={dish.image}
                      className="h-64 object-cover"
                    />
                  }
                  className="h-full hover:shadow-xl transition-all duration-300"
                >
                  <Title level={4} className="!text-orange-700">{dish.name}</Title>
                  <Text className="block mb-4 text-gray-600">{dish.description}</Text>
                  <Text strong className="text-orange-600 text-lg">
                    {dish.price}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Giới thiệu */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <Row gutter={32} align="middle">
            <Col xs={24} md={12}>
              <img
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600"
                alt="Về chúng tôi"
                className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              />
            </Col>
            <Col xs={24} md={12}>
              <Title level={2} className="!text-orange-700">Về Chúng Tôi</Title>
              <Text className="text-lg block mb-6 text-gray-600">
                Nhà hàng Bamboo Sông Chanh tự hào là điểm đến ẩm thực hàng đầu tại Thị xã Quảng Yên, 
                mang đến cho thực khách những trải nghiệm ẩm thực độc đáo với các món ăn được chế biến 
                từ nguyên liệu tươi ngon nhất.
              </Text>
              <Button 
                type="primary" 
                size="large"
              >
                Xem thêm
              </Button>
            </Col>
          </Row>
        </div>
      </div>

      {/* Đặt bàn CTA */}
      <div 
        className="bg-cover bg-center py-24 relative"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200)'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center text-white">
            <Title level={2} className="text-white mb-6">
              Đặt Bàn Ngay
            </Title>
            <Text className="text-lg block mb-8 text-white/90">
              Hãy để chúng tôi phục vụ bạn một bữa ăn tuyệt vời
            </Text>
            <Button 
              type="primary" 
              size="large"
              onClick={() => window.location.href = '/reservation'}
            >
              Đặt bàn
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <Row gutter={32}>
            <Col xs={24} sm={8}>
              <Title level={4} className="!text-white">
                Nhà Hàng Bamboo Sông Chanh
              </Title>
              <Text className="text-gray-400 block">
                Tinh hoa ẩm thực Quảng Yên
              </Text>
            </Col>
            <Col xs={24} sm={8}>
              <Title level={4} className="!text-white">
                Liên Hệ
              </Title>
              <Space direction="vertical" className="text-gray-400">
                <Text className="text-gray-400">- Điện thoại: 033 328 3999</Text>
                <Text className="text-gray-400">- Email: nhahangbamboo@gmail.com</Text>
                <Text className="text-gray-400">- Địa chỉ: Bắc Cầu sông Chanh phường Quảng Yên, T.X Quảng Yên, Tỉnh Quảng Ninh, Vietnam</Text>
              </Space>
            </Col>
            <Col xs={24} sm={8}>
              <Title level={4} className="!text-white">
                Giờ Mở Cửa
              </Title>
              <Space direction="vertical" className="text-gray-400">
                <Text className="text-gray-400">Thứ 2 - Thứ 6: 10:00 - 22:30</Text>
                <Text className="text-gray-400">Thứ 7 - Chủ nhật: 09:00 - 23:00</Text>
              </Space>
            </Col>
          </Row>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;