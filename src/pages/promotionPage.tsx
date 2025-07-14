import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Tag, 
  Modal, 
  message, 
  Image, 
  Tabs,
  Empty,
  Spin,
  Space,
  Tooltip,
  Badge
} from 'antd';
import { 
  GiftOutlined, 
  ClockCircleOutlined, 
  StarOutlined,
  TagOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';
import type { Promotion, Customer, PromotionCode, Staff } from '@/types';
import { useList, useCreate, useUpdate, useCustom } from '@refinedev/core';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';

const { Title, Text, Paragraph } = Typography;

const PromotionPage: React.FC = () => {
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isExchangeModalVisible, setIsExchangeModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get current user from auth store
  const currentUser = use$(auth$.user);
  const isAuthenticated = use$(auth$.isAuthenticated);
  const guard = use$(auth$.guard);
  
  // Type guard to check if user is a customer
  const isCustomer = (user: Customer | Staff | null): user is Customer => {
    return !!user && guard === 'customer' && 'point' in user;
  };
  
  const currentCustomer = isCustomer(currentUser) ? currentUser : null;
  console.log("currentCustomer: ", currentCustomer)

  // Fetch promotions
  const { data: promotionsData, isLoading, refetch: refetchPromotions } = useList<Promotion>({
    resource: 'promotions',
    meta: {
      populate: ['image', 'promotion_codes', 'creator']
    },
    sorters: [
      {
        field: 'created_at',
        order: 'desc'
      }
    ]
  });

  // const { data: customerData, isLoading: isLoadingCustomer } = useOne<Customer>({
  //   resource: 'customers',
  //   id: currentCustomer?.id
  // });

  // Fetch customer's promotion codes
  const { data: myCodesData, isLoading: isLoadingMyCodes, refetch: refetchMyCodes } = useList<PromotionCode>({
    resource: 'promotion_codes',
    filters: [
      {
        field: 'customer_id',
        operator: 'eq',
        value: currentCustomer?.id
      }
    ],
    meta: {
      populate: ['promotion']
    },
    queryOptions: {
      enabled: !!currentCustomer?.point
    }
  });

  const { mutate: updateCustomer, isLoading: isLoadingCustomer } = useUpdate();

  const { mutate: exchangePromotion, isLoading: isExchanging } = useCreate();

  const API_URL = import.meta.env.VITE_API_URL;

  const promotions = promotionsData?.data || [];
  const myCodes = myCodesData?.data || [];
  const customerWithPoints = currentCustomer;
  console.log("customerWithPoints: ", customerWithPoints)

  // Filter promotions by status
  const activePromotions = promotions.filter(promo => {
    const now = dayjs();
    const start = dayjs(promo.start_date);
    const end = dayjs(promo.end_date);
    
    // Kiểm tra thời gian hiệu lực
    const isTimeValid = now.isAfter(start) && now.isBefore(end);
    
    // Kiểm tra số lượng còn lại (chỉ nếu có giới hạn)
    const totalCodes = promo.promotion_codes?.length || 0;
    const hasLimit = promo.limit && promo.limit > 0;
    const isQuantityAvailable = hasLimit ? totalCodes < promo.limit : true;
    
    return isTimeValid && isQuantityAvailable;
  });

  const upcomingPromotions = promotions.filter(promo => {
    const now = dayjs();
    const start = dayjs(promo.start_date);
    const end = dayjs(promo.end_date);
    
    // Chỉ hiển thị promotion sắp diễn ra và chưa đạt giới hạn
    const isUpcoming = now.isBefore(start);
    const totalCodes = promo.promotion_codes?.length || 0;
    const hasLimit = promo.limit && promo.limit > 0;
    const isQuantityAvailable = hasLimit ? totalCodes < promo.limit : true;
    const isNotExpired = now.isBefore(end);
    
    return isUpcoming && isQuantityAvailable && isNotExpired;
  });

     const getPromotionsByTab = (): Promotion[] => {
     switch (activeTab) {
       case '1': return activePromotions;
       case '2': return upcomingPromotions;
       case '3': return []; // Mã của tôi sẽ được render riêng
       default: return activePromotions;
     }
   };

     const handleExchange = (promotion: Promotion) => {
     if (!customerWithPoints) {
       message.warning('Vui lòng đăng nhập để đổi ưu đãi');
       return;
     }

     if ((customerWithPoints.point || 0) < promotion.required_points) {
       message.error(`Bạn cần ${promotion.required_points} điểm để đổi ưu đãi này. Điểm hiện tại: ${customerWithPoints.point || 0}`);
       return;
     }

    setSelectedPromotion(promotion);
    setIsExchangeModalVisible(true);
  };

    const confirmExchange = async () => {
     if (!selectedPromotion || !customerWithPoints?.id) return;

     // Kiểm tra lại số lượng trước khi đổi (chỉ nếu có giới hạn)
     const totalCodes = selectedPromotion.promotion_codes?.length || 0;
     const hasLimit = selectedPromotion.limit && selectedPromotion.limit > 0;
     if (hasLimit && totalCodes >= selectedPromotion.limit) {
       message.error('Ưu đãi này đã hết số lượng!');
       setIsExchangeModalVisible(false);
       return;
     }

     // Kiểm tra điểm khách hàng
     if ((customerWithPoints.point || 0) < selectedPromotion.required_points) {
       message.error(`Không đủ điểm để đổi ưu đãi này!`);
       setIsExchangeModalVisible(false);
       return;
     }

          try {
       setIsRefreshing(true);
       
       // Tạo promotion code mới cho khách hàng
       await exchangePromotion({
         resource: 'promotion_codes',
         values: {
           promotion_id: selectedPromotion.id,
           points_used: selectedPromotion.required_points,
           code: `PROMO${selectedPromotion.id}${Date.now()}`, // Tạo mã ngẫu nhiên
           // Backend sẽ tự động trừ điểm khách hàng theo required_points
         },
         successNotification:{
          message:"Đổi ưu đãi thành công! Mã ưu đãi đã được thêm vào tài khoản của bạn.",
          type: "success"
        },
        errorNotification:{
          message: "Có lỗi xảy ra khi đổi ưu đãi. Vui lòng thử lại.",
          type: "error"
         }
       });

       // Cập nhật điểm của khách hàng ngay lập tức trong auth store
       const newPoints = Math.max(0, (customerWithPoints.point || 0) - selectedPromotion.required_points);
       auth$.user.set({
         ...customerWithPoints,
         point: newPoints
       });

       // Refetch data để cập nhật số lượng promotion codes và mã của tôi
       await Promise.all([
         refetchPromotions(),
         refetchMyCodes()
       ]);

       setIsExchangeModalVisible(false);
       setSelectedPromotion(null);
    } catch (error) {
      console.error('Exchange error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

     const renderPromotionCard = (promotion: Promotion) => {
     const isActive = dayjs().isAfter(dayjs(promotion.start_date)) && dayjs().isBefore(dayjs(promotion.end_date));
     const canExchange = customerWithPoints && (customerWithPoints.point || 0) >= promotion.required_points;
     
     // Tính toán số lượng còn lại
     const totalCodes = promotion.promotion_codes?.length || 0;
     const limitCodes = promotion.limit || 0;
     const hasLimit = limitCodes > 0;
     const remainingCodes = hasLimit ? Math.max(0, limitCodes - totalCodes) : Infinity;
     const isAvailable = hasLimit ? remainingCodes > 0 : true;

    return (
      <Card 
        key={promotion.id}
        hoverable 
        className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-0"
        cover={
          <div className="h-48 overflow-hidden relative bg-gradient-to-br from-purple-400 to-pink-400">
            {promotion.image ? (
              <img 
                alt={promotion.name}
                src={`${API_URL}/storage/${promotion.image.path}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <GiftOutlined className="text-6xl text-white opacity-50" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Tag 
                color={promotion.discount_type === 'percentage' ? 'red' : 'green'} 
                className="text-sm font-bold px-3 py-1 rounded-full"
              >
                {promotion.discount_type === 'percentage' 
                  ? `Giảm ${promotion.discount_percentage}%` 
                  : `Giảm ${Number(promotion.discount_amount)?.toLocaleString()}đ`}
              </Tag>
            </div>
            {!isActive && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Tag color="orange" className="text-lg px-4 py-2">
                  Sắp diễn ra
                </Tag>
              </div>
            )}
          </div>
        }
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <Title level={4} className="mb-0 text-gray-800 line-clamp-2 flex-1">
              {promotion.name}
            </Title>
            <Badge 
              count={hasLimit ? remainingCodes : '∞'} 
              showZero 
              style={{ backgroundColor: isAvailable ? '#52c41a' : '#ff4d4f' }}
              className="ml-2"
            />
          </div>
          
          <Paragraph className="text-gray-600 mb-4 line-clamp-2">
            {promotion.description}
          </Paragraph>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Điểm yêu cầu:</span>
              <div className="flex items-center gap-1">
                <StarOutlined className="text-yellow-500" />
                <span className="font-semibold text-orange-600">
                  {promotion.required_points.toLocaleString()}
                </span>
              </div>
            </div>

            {promotion.min_order_amount && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Đơn tối thiểu:</span>
                <span className="font-semibold">
                  {Number(promotion.min_order_amount).toLocaleString('vi-VN')}đ
                </span>
              </div>
            )}

            {promotion.max_discount_amount && promotion.discount_type === 'percentage' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Giảm tối đa:</span>
                <span className="font-semibold">
                  {Number(promotion.max_discount_amount).toLocaleString('vi-VN')}đ
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Số lượng:</span>
              <span className="font-semibold">
                {hasLimit ? `${remainingCodes}/${limitCodes} còn lại` : 'Không giới hạn'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Hết hạn:</span>
              <div className="flex items-center gap-1">
                <ClockCircleOutlined className="text-blue-500" />
                <span className="font-semibold">
                  {dayjs(promotion.end_date).format('DD/MM/YYYY')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isActive && isCustomer(currentUser) ? (
              <Button
                type="primary"
                size="large"
                className="flex-1 bg-gradient-to-r border-0 rounded-lg font-semibold"
                icon={<GiftOutlined />}
                onClick={() => handleExchange(promotion)}
                disabled={!canExchange || !isAvailable}
                loading={isExchanging && selectedPromotion?.id === promotion.id}
              >
                                 {!customerWithPoints ? 'Đăng nhập để đổi' : 
                  !canExchange ? 'Không đủ điểm' : 
                  !isAvailable ? 'Hết mã' : 'Đổi ngay'}
              </Button>
            ) : (!isActive &&
              <Button
                size="large"
                className="flex-1 rounded-lg"
                disabled
              >
                Sắp diễn ra
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderMyCodeCard = (code: PromotionCode) => {
    const isUsed = !!code.used_at;
    const promotion = code.promotion;
    
    if (!promotion || isUsed) return null;

    return (
      <Card 
        className={`rounded-lg shadow-md border-0 h-full ${isUsed ? 'opacity-60' : ''}`}
        size="small"
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-md flex items-center justify-center flex-shrink-0">
                {isUsed ? (
                  <CheckCircleOutlined className="text-sm text-white" />
                ) : (
                  <TagOutlined className="text-sm text-white" />
                )}
              </div>
              <Title level={5} className="mb-0 text-gray-800 line-clamp-1">
                {promotion.name}
              </Title>
            </div>
            <Tag 
              color={isUsed ? 'default' : 'success'}
              className="font-semibold text-xs"
            >
              {isUsed ? 'Đã dùng' : 'Có thể dùng'}
            </Tag>
          </div>
          
          {/* Code */}
          <div className="bg-gray-50 rounded-md p-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Mã:</span>
              <Text 
                copyable={!isUsed} 
                className="font-mono text-sm font-bold text-blue-600"
              >
                {code.code}
              </Text>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {promotion.discount_type === 'percentage' 
                ? `Giảm ${promotion.discount_percentage}%` 
                : `Giảm ${promotion.discount_amount?.toLocaleString()}đ`}
            </span>
            <span>
              {isUsed 
                ? dayjs(code.used_at).format('DD/MM/YY')
                : `HSD: ${dayjs(promotion.end_date).format('DD/MM/YY')}`
              }
            </span>
          </div>
        </div>
      </Card>
    );
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-2">
          <GiftOutlined />
          Ưu đãi đang có ({activePromotions.length})
        </span>
      ),
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-2">
          <ClockCircleOutlined />
          Sắp diễn ra ({upcomingPromotions.length})
        </span>
      ),
    },
    {
      key: '3',
      label: (
        <span className="flex items-center gap-2">
          <TagOutlined />
          Mã của tôi ({myCodes.filter(code => !code.used_at).length})
        </span>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
              <GiftOutlined className="text-3xl text-white" />
            </div>
            <Title level={2} className="mb-2 text-orange-500">
              Ưu đãi đặc biệt
            </Title>
            <Text className="text-lg text-gray-600">
              Sử dụng điểm tích lũy để đổi lấy các ưu đãi hấp dẫn
            </Text>
              {customerWithPoints && (
               <div className="mt-4 inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg">
                 <UserOutlined className="text-blue-500" />
                 <span className="text-gray-600">Điểm của bạn:</span>
                 <span className="font-bold text-xl text-orange-600">
                   {customerWithPoints.point?.toLocaleString() || '0'}
                 </span>
                 <StarOutlined className="text-yellow-500" />
               </div>
             )}
          </div>

          {/* Tabs */}
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={tabItems}
            className="mb-6"
            size="large"
          />

          {/* Content */}
                     <Spin spinning={isLoading || isRefreshing}>
            {activeTab === '3' && currentCustomer?.point ? (
              // My Codes Tab
              <div>
                {myCodes.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {myCodes.map(code => (
                      <Col xs={24} sm={12} key={code.id}>
                        {renderMyCodeCard(code)}
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Bạn chưa có mã ưu đãi nào"
                  >
                    <Button 
                      type="primary" 
                      onClick={() => setActiveTab('1')}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 border-0"
                    >
                      Khám phá ưu đãi
                    </Button>
                  </Empty>
                )}
              </div>
            ) : (
              // Promotions Grid
              <Row gutter={[24, 24]}>
                {getPromotionsByTab().map(promotion => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={promotion.id}>
                    {renderPromotionCard(promotion)}
                  </Col>
                ))}
                
                {getPromotionsByTab().length === 0 && (
                  <Col span={24}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        activeTab === '1' 
                          ? "Hiện tại chưa có ưu đãi nào đang diễn ra"
                          : "Chưa có ưu đãi sắp diễn ra"
                      }
                    />
                  </Col>
                )}
              </Row>
            )}
          </Spin>
        </div>

        {/* Exchange Confirmation Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <ExclamationCircleOutlined className="text-orange-500 text-xl" />
              <span>Xác nhận đổi ưu đãi</span>
            </div>
          }
          open={isExchangeModalVisible}
          onOk={confirmExchange}
          onCancel={() => {
            setIsExchangeModalVisible(false);
            setSelectedPromotion(null);
          }}
          confirmLoading={isExchanging || isRefreshing}
          okText="Xác nhận đổi"
          cancelText="Hủy"
          okButtonProps={{
            className: "bg-gradient-to-r from-purple-500 to-pink-500 border-0"
          }}
        >
          {selectedPromotion && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <Title level={5} className="mb-2">{selectedPromotion.name}</Title>
                <Text className="text-gray-600">{selectedPromotion.description}</Text>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Điểm cần sử dụng:</span>
                  <span className="font-bold text-orange-600">
                    {selectedPromotion.required_points.toLocaleString()} điểm
                  </span>
                </div>
                
                  <div className="flex justify-between items-center">
                   <span>Điểm hiện tại:</span>
                   <span className="font-bold">
                     {customerWithPoints?.point?.toLocaleString() || '0'} điểm
                   </span>
                 </div>
                 
                 <div className="flex justify-between items-center border-t pt-3">
                   <span>Điểm còn lại:</span>
                   <span className="font-bold text-green-600">
                     {Math.max(0, (customerWithPoints?.point || 0) - selectedPromotion.required_points).toLocaleString()} điểm
                   </span>
                 </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <Text className="text-blue-700 text-sm">
                  💡 Mã ưu đãi sẽ được thêm vào tài khoản của bạn và có thể sử dụng ngay lập tức.
                </Text>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default PromotionPage;
