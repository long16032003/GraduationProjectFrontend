import React, { useRef } from 'react';
import { Button, Card, Carousel, Row, Col, Typography, Space, Divider, Spin, Statistic, Avatar, Rate } from 'antd';
import { PhoneOutlined, EnvironmentOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined, UserOutlined, TrophyOutlined, HeartOutlined, StarOutlined } from '@ant-design/icons';
import { router } from '@/router';
import { Link } from 'react-router';
import { useList } from '@refinedev/core';
import type { Dish } from '@/types';
import type { CarouselRef } from 'antd/es/carousel';
import { Testimonials } from '@/components/home/Testimonials';

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  // Ref for carousel control
  const carouselRef = useRef<CarouselRef>(null);
  
  // Mock data cho các sections
  const bannerImages = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200',
  ];

  const {data: dishes, isLoading: isLoadingDishes} = useList<Dish>({
    resource: 'dishes',
    filters: [
      {
        field: 'is_featured',
        operator: 'eq',
        value: 1
      }
    ],
  });

  return (
    <div className="min-h-screen ">
      {/* Hero Section với Carousel */} 
      <Carousel autoplay effect="fade" className="h-[600px] hero-carousel">
        {bannerImages.map((image, index) => (
          <div key={index}>
            <div 
              className="h-[600px] bg-cover bg-center relative"
              style={{ backgroundImage: `url(${image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-orange-900/30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-8 max-w-4xl mx-auto">
                  <div className="animate-fade-in-up">
                    <Title level={1} className="text-white mb-6 !text-6xl font-bold leading-tight">
                      Nhà Hàng <span className="text-orange-400">Bamboo</span><br/>
                      Sông Chanh
                    </Title>
                    <Text className="text-2xl block mb-4 text-white/95 font-light">
                      Tinh hoa ẩm thực Quảng Yên
                    </Text>
                    <Text className="text-lg block mb-8 text-white/80 max-w-2xl mx-auto leading-relaxed">
                      Khám phá hương vị đặc sắc của vùng đất Quảng Ninh với không gian ấm cúng bên dòng sông thơ mộng
                    </Text>
                    <Space size="large" className="flex justify-center">
                      <Button 
                        type="primary" 
                        size="large"
                        className="bg-orange-600 border-orange-600 hover:bg-orange-700 px-8 py-6 h-auto text-lg font-semibold rounded-full"
                        onClick={() => window.location.href = '/reservation'}
                      >
                        Đặt bàn ngay
                      </Button>
                      <Button 
                        size="large"
                        className="border-white text-orange-600 hover:bg-gray-100 hover:text-orange-600 px-8 py-6 h-auto text-lg font-semibold rounded-full"
                        onClick={() => window.location.href = '/menu'}
                      >
                        Xem thực đơn
                      </Button>
                    </Space>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Thông tin nhà hàng */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Title level={2} className="!text-gray-800 mb-4">
              Thông Tin Liên Hệ
            </Title>
            <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chúng tôi luôn sẵn sàng phục vụ bạn với tất cả sự tận tâm và chuyên nghiệp
            </Text>
          </div>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={8}>
              <Card className="text-center h-full hover:shadow-xl transition-all duration-300 border-0 rounded-2xl group">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <PhoneOutlined className="text-3xl text-white" />
                </div>
                <Title level={4} className="!text-orange-700 mb-3">Hotline</Title>
                <Text className="text-gray-600 text-lg font-medium">033 328 3999</Text>
                <Text className="block text-sm text-gray-500 mt-2">Phục vụ 24/7</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="text-center h-full hover:shadow-xl transition-all duration-300 border-0 rounded-2xl group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <EnvironmentOutlined className="text-3xl text-white" />
                </div>
                <Title level={4} className="!text-blue-700 mb-3">Địa chỉ</Title>
                <Text className="text-gray-600">Bắc Cầu sông Chanh phường Quảng Yên</Text>
                <Text className="block text-sm text-gray-500 mt-2">T.X Quảng Yên, Quảng Ninh</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="text-center h-full hover:shadow-xl transition-all duration-300 border-0 rounded-2xl group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ClockCircleOutlined className="text-3xl text-white" />
                </div>
                <Title level={4} className="!text-green-700 mb-3">Giờ mở cửa</Title>
                <Text className="text-gray-600 text-lg font-medium">10:00 - 22:30</Text>
                <Text className="block text-sm text-gray-500 mt-2">Tất cả các ngày trong tuần</Text>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Món ăn nổi bật */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12 !text-orange-700">
            Món Ăn Nổi Bật
          </Title>
          <div className="relative">
          {isLoadingDishes ? (
            <div className="text-center">
              <Spin size="large" />
            </div>
          ) : (
            <div className="relative">
              {/* Custom Navigation Buttons */}
              <Button
                type="primary"
                shape="circle"
                icon={<LeftOutlined />}
                onClick={() => carouselRef.current?.prev()}
                className="absolute left-[-20px] top-1/2 transform -translate-y-1/2 z-10 bg-orange-600 border-orange-600 hover:bg-orange-700 shadow-lg"
                style={{ width: '40px', height: '40px' }}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<RightOutlined />}
                onClick={() => carouselRef.current?.next()}
                className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 z-10 bg-orange-600 border-orange-600 hover:bg-orange-700 shadow-lg"
                style={{ width: '40px', height: '40px' }}
              />
              
              <Carousel
                ref={carouselRef}
                dots={true}
                arrows={false}
                slidesToShow={3}
                slidesToScroll={1}
                infinite={true}
                speed={500}
                responsive={[
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1,
                    }
                  },
                  {
                    breakpoint: 1024,
                    settings: {
                      slidesToShow: 2,
                      slidesToScroll: 1,
                    }
                  }
                ]}
                className="dish-carousel"
              >
                {dishes?.data?.map((dish: Dish, index: number) => (
                  <div key={dish.id || index} className="px-3">
                    <Card
                      hoverable
                      cover={
                        <div className="h-64 overflow-hidden">
                          <img
                            alt={dish.name}
                            src={dish.image ? `${import.meta.env.VITE_API_URL}/storage/${dish.image.path}` : '/placeholder-dish.jpg'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      }
                      className="h-[420px] hover:shadow-xl transition-all duration-300 flex flex-col"
                      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <div>
                        <Title level={4} className="!text-orange-700 !mb-2 line-clamp-2" style={{ minHeight: '64px' }}>
                          {dish.name}
                        </Title>
                        <Text className="block mb-4 text-gray-600 line-clamp-3" style={{ minHeight: '72px' }}>
                          {dish.description}
                        </Text>
                      </div>
                      <div>
                        <Text strong className="text-orange-600 text-xl">
                          {dish.price.toLocaleString()}đ
                        </Text>
                      </div>
                    </Card>
                  </div>
                ))}
              </Carousel>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Title level={2} className="!text-orange-700 mb-4">
              Tại Sao Chọn Bamboo Sông Chanh?
            </Title>
            <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những điều đặc biệt làm nên thương hiệu của chúng tôi
            </Text>
          </div>
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} md={6}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <HeartOutlined className="text-3xl text-white" />
                </div>
                <Title level={4} className="!text-gray-800 mb-3">Nguyên liệu tươi ngon</Title>
                <Text className="text-gray-600 leading-relaxed">
                  Chọn lọc từ những nguồn cung cấp uy tín, đảm bảo chất lượng tốt nhất
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <TrophyOutlined className="text-3xl text-white" />
                </div>
                <Title level={4} className="!text-gray-800 mb-3">Đầu bếp chuyên nghiệp</Title>
                <Text className="text-gray-600 leading-relaxed">
                  Đội ngũ đầu bếp giàu kinh nghiệm, đam mê với ẩm thực truyền thống
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <EnvironmentOutlined className="text-3xl text-white" />
                </div>
                <Title level={4} className="!text-gray-800 mb-3">View sông tuyệt đẹp</Title>
                <Text className="text-gray-600 leading-relaxed">
                  Không gian ăn uống lý tưởng bên dòng sông Chanh thơ mộng
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <UserOutlined className="text-3xl text-white" />
                </div>
                <Title level={4} className="!text-gray-800 mb-3">Dịch vụ tận tâm</Title>
                <Text className="text-gray-600 leading-relaxed">
                  Phục vụ chuyên nghiệp, chu đáo từ lúc đặt bàn đến khi ra về
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Testimonials */}
             {/* Photo Gallery */}
       <div className="py-20">
         <div className="container mx-auto px-4">
           <div className="text-center mb-16">
             <Title level={2} className="!text-orange-700 mb-4">
               Không Gian & Món Ăn
             </Title>
             <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
               Khám phá không gian ấm cúng và những món ăn đặc sắc tại nhà hàng
             </Text>
           </div>
           <Row gutter={[16, 16]}>
             <Col xs={24} sm={12} md={8}>
               <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
                 <img
                   src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
                   alt="Không gian nhà hàng"
                   className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="absolute bottom-4 left-4 text-white">
                     <Text className="text-white font-semibold">Không gian sang trọng</Text>
                   </div>
                 </div>
               </div>
             </Col>
             <Col xs={24} sm={12} md={8}>
               <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
                 <img
                   src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop"
                   alt="Món ăn đặc sắc"
                   className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="absolute bottom-4 left-4 text-white">
                     <Text className="text-white font-semibold">Hải sản tươi ngon</Text>
                   </div>
                 </div>
               </div>
             </Col>
             <Col xs={24} sm={12} md={8}>
               <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
                 <img
                   src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"
                   alt="View sông Chanh"
                   className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="absolute bottom-4 left-4 text-white">
                     <Text className="text-white font-semibold">View sông thơ mộng</Text>
                   </div>
                 </div>
               </div>
             </Col>
             <Col xs={24} sm={12} md={8}>
               <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
                 <img
                   src="https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop"
                   alt="Món nướng"
                   className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="absolute bottom-4 left-4 text-white">
                     <Text className="text-white font-semibold">Món nướng BBQ</Text>
                   </div>
                 </div>
               </div>
             </Col>
             <Col xs={24} sm={12} md={8}>
               <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
                 <img
                   src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop"
                   alt="Món chính"
                   className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="absolute bottom-4 left-4 text-white">
                     <Text className="text-white font-semibold">Món chính đặc sắc</Text>
                   </div>
                 </div>
               </div>
             </Col>
             <Col xs={24} sm={12} md={8}>
               <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
                 <img
                   src="https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop"
                   alt="Tráng miệng"
                   className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="absolute bottom-4 left-4 text-white">
                     <Text className="text-white font-semibold">Tráng miệng ngọt ngào</Text>
                   </div>
                 </div>
               </div>
             </Col>
           </Row>
           <div className="text-center mt-12">
             <Button 
               type="primary" 
               size="large"
               className="bg-orange-600 border-orange-600 hover:bg-orange-700 px-8 py-6 h-auto text-lg font-semibold rounded-full"
               onClick={() => window.location.href = '/menu'}
             >
               Xem toàn bộ thực đơn
             </Button>
           </div>
         </div>
       </div>

      {/* Giới thiệu */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600"
                  alt="Về chúng tôi"
                  className="rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 w-full"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <div className="text-center text-white">
                    <Text className="block text-2xl font-bold">15+</Text>
                    <Text className="text-sm">Năm kinh nghiệm</Text>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="pl-0 md:pl-8">
                <Title level={2} className="!text-orange-700 mb-6">Câu Chuyện Của Chúng Tôi</Title>
                <Text className="text-lg block mb-6 text-gray-600 leading-relaxed">
                  Nhà hàng Bamboo Sông Chanh được thành lập với tình yêu và đam mê ẩm thực Quảng Ninh. 
                  Chúng tôi tự hào mang đến những món ăn đậm đà bản sắc địa phương, được chế biến từ 
                  những nguyên liệu tươi ngon nhất.
                </Text>
                <Text className="text-lg block mb-8 text-gray-600 leading-relaxed">
                  Với không gian ấm cúng bên dòng sông thơ mộng và đội ngũ nhân viên chuyên nghiệp, 
                  chúng tôi cam kết mang đến cho bạn những trải nghiệm ẩm thực khó quên.
                </Text>
                
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Special Offers */}
      <div className="py-20 bg-gradient-to-br from-orange-600 to-orange-700">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Title level={2} className="text-white mb-4">
              Ưu Đãi Đặc Biệt
            </Title>
            <Text className="text-xl text-white/90 max-w-2xl mx-auto">
              Những chương trình hấp dẫn dành riêng cho bạn
            </Text>
          </div>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card className="h-full border-0 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&h=200&fit=crop"
                    alt="Combo gia đình"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -20%
                  </div>
                </div>
                <div className="p-6">
                  <Title level={4} className="!text-orange-700 mb-3">Combo Gia Đình Cuối Tuần</Title>
                  <Text className="text-gray-600 mb-4 leading-relaxed">
                    Thưởng thức bữa ăn gia đình trọn vẹn với menu đa dạng, phù hợp cho 4-6 người. 
                    Áp dụng thứ 7 & Chủ nhật.
                  </Text>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="line-through text-gray-400 text-lg">2.500.000đ</Text>
                      <Text className="text-orange-600 font-bold text-2xl ml-2">2.000.000đ</Text>
                    </div>
                    <Button 
                      type="primary" 
                      className="bg-orange-600 border-orange-600 hover:bg-orange-700 rounded-full"
                    >
                      Đặt ngay
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="h-full border-0 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&h=200&fit=crop"
                    alt="Buffet hải sản"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    HOT
                  </div>
                </div>
                <div className="p-6">
                  <Title level={4} className="!text-orange-700 mb-3">Buffet Hải Sản Tươi Sống</Title>
                  <Text className="text-gray-600 mb-4 leading-relaxed">
                    Thỏa sức thưởng thức hơn 50 món hải sản tươi ngon được chế biến theo phong cách đặc trưng. 
                    Chỉ có vào tối thứ 6 & thứ 7.
                  </Text>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-orange-600 font-bold text-2xl">899.000đ</Text>
                      <Text className="text-gray-500 text-sm block">/ người</Text>
                    </div>
                    <Button 
                      type="primary" 
                      className="bg-orange-600 border-orange-600 hover:bg-orange-700 rounded-full"
                    >
                      Đặt bàn
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
          <div className="text-center mt-12">
            <Button 
              size="large"
              className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-6 h-auto text-lg font-semibold rounded-full"
              onClick={() => window.location.href = '/promotions'}
            >
              Xem tất cả ưu đãi
            </Button>
          </div>
        </div>
      </div>

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