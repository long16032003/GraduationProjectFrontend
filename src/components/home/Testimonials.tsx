import { Typography, Row, Col, Card, Avatar, Rate } from 'antd';

const { Title, Text } = Typography;

export const Testimonials = () => {
    return (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Title level={2} className="!text-orange-700 mb-4">
              Khách Hàng Nói Gì Về Chúng Tôi
            </Title>
            <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những phản hồi chân thực từ khách hàng là động lực để chúng tôi không ngừng cải thiện
            </Text>
          </div>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card className="h-full border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-4">
                  <Avatar size={64} src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" className="mb-4" />
                  <Title level={5} className="mb-1">Anh Minh Tuấn</Title>
                  <Text className="text-gray-500">Khách hàng thân thiết</Text>
                </div>
                <Rate disabled defaultValue={5} className="mb-4 flex justify-center" />
                <Text className="text-gray-600 italic text-center block">
                  "Món ăn tại Bamboo luôn tươi ngon, đậm đà hương vị. Không gian nhà hàng rất ấm cúng, 
                  nhân viên phục vụ nhiệt tình. Tôi và gia đình thường xuyên đến đây."
                </Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="h-full border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-4">
                  <Avatar size={64} src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150" className="mb-4" />
                  <Title level={5} className="mb-1">Chị Lan Anh</Title>
                  <Text className="text-gray-500">Food Blogger</Text>
                </div>
                <Rate disabled defaultValue={5} className="mb-4 flex justify-center" />
                <Text className="text-gray-600 italic text-center block">
                  "Đây là nhà hàng có view đẹp nhất Quảng Yên! Các món hải sản tươi sống, 
                  được chế biến rất tinh tế. Đặc biệt là món cua rang me, tuyệt vời!"
                </Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="h-full border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-4">
                  <Avatar size={64} src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" className="mb-4" />
                  <Title level={5} className="mb-1">Anh Đức Thành</Title>
                  <Text className="text-gray-500">Doanh nhân</Text>
                </div>
                <Rate disabled defaultValue={5} className="mb-4 flex justify-center" />
                <Text className="text-gray-600 italic text-center block">
                  "Tôi đã tổ chức nhiều bữa tiệc công ty tại đây. Chất lượng món ăn và dịch vụ 
                  luôn đảm bảo. Nhà hàng là lựa chọn hàng đầu cho các sự kiện quan trọng."
                </Text>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
}