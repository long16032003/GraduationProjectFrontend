import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Image, Tag, Tabs, Divider, Rate, Button } from 'antd';
import { ShoppingCartOutlined, FireOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';
import type { Dish, DishCategory } from '@/types';
import { useList, useUpdate } from '@refinedev/core';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const API_URL = import.meta.env.VITE_API_URL;

const ItemDish = ({dish}: {dish: Dish}) => {
  return (
    <Col
      xs={24}
      sm={12}
      md={8}
      lg={6}
      key={dish.id}
    >
      <Card
        hoverable
        cover={
          <div className='relative h-64 overflow-hidden'>
            {dish.image?.path ? <Image
              src={`${API_URL}/storage/${dish.image?.path}`}
              alt={dish.name}
              className='w-full h-full object-cover'
              preview={false} /> : <Image
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200" 
                alt={dish.name}
                className="w-full h-full object-cover"
                preview={false}
              />}
            {dish?.is_featured && (
              <Tag
                color='red'
                className='absolute top-2 right-2'
              >
                Nổi bật
              </Tag>
            )}
          </div>
        }
        className='h-full'
      >
        <div className='flex justify-between items-start'>
          <div>
            <Title
              level={5}
              className='!mb-1'
            >
              {dish.name}
            </Title>
            <Text
              type='secondary'
              className='block mb-2'
            >
              {dish.dish_categories?.name}
            </Text>
          </div>
          {/* <Button
            type="text"
            icon={favorites.includes(dish.id) ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
            onClick={() => handleFavoriteClick(dish.id)}
            /> */}
        </div>
        <Paragraph
          ellipsis={{ rows: 2 }}
          className='text-gray-600 mb-3'
        >
          {dish.description}
        </Paragraph>
        <div className='flex justify-between items-center'>
          <Text
            strong
            className='text-lg text-red-600'
          >
            {new Intl.NumberFormat('vi-VN', { 
              style: 'decimal',
              maximumFractionDigits: 0
            }).format(dish.price)}đ
          </Text>
          {/* <Button
            type='primary'
            icon={<ShoppingCartOutlined />}
            size='small'
          >
            Đặt món
          </Button> */}
        </div>
      </Card>
    </Col>
  );
}

const MenuPage: React.FC = () => {
//   const [dishes, setDishes] = useState<Dish[]>([]);
//   const [categories, setCategories] = useState<DishCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<number[]>([]);

  const { data: listDishCategories, isLoading: isLoadingListDishCategories } = useList<DishCategory>({
    resource: 'dish-categories',
  });

  const { data: listDishes, isLoading: isLoadingList } = useList<Dish>({
    resource: 'dishes',
  });

  const { mutate: updateDish, isLoading: isUpdating } = useUpdate<Dish>();

  const handleFavoriteClick = (dishId: number) => {
    if (favorites.includes(dishId)) {
      setFavorites(favorites.filter(id => id !== dishId));
    } else {
      setFavorites([...favorites, dishId]);
    }
  };

  const filteredDishes = activeCategory === 'all'
    ? listDishes?.data
    : listDishes?.data?.filter(dish => 
        // activeCategory === 'featured' 
        //   ? (dish.is_featured || false)
        //   : 
          dish.category_id === parseInt(activeCategory));

  // Nhóm món ăn theo danh mục
  const dishesByCategory = listDishCategories?.data?.reduce((acc, category) => {
    acc[category.id] = listDishes?.data?.filter(dish => dish.category_id === category.id) || [];
    return acc;
  }, {} as Record<number, Dish[]>) || {};

  return (
    <MainLayout>
      <div className="min-h-screen  py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Banner */}
          <div className="relative rounded-xl overflow-hidden mb-8 h-64">
            <Image
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200"
              alt="Restaurant Menu Banner"
              preview={false}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center p-6">
              <Title level={1} className="text-white mb-2">Thực đơn nhà hàng</Title>
              <Text className="text-white text-lg">Khám phá các món ăn đặc sắc của chúng tôi</Text>
            </div>
          </div>

          {/* Featured dishes */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <Title level={2} className="!mb-0">
                <FireOutlined className="text-red-500 mr-2" /> Món ăn nổi bật
              </Title>
            </div>
            <Row gutter={[16, 16]}>
              {listDishes?.data?.filter(dish => dish.is_featured).slice(0, 4).map(dish => (
                <Col xs={24} sm={12} md={8} lg={6} key={dish.id}>
                  <Card
                    hoverable
                    cover={
                      <div className="relative h-48 overflow-hidden">
                        {dish.image?.path ? <Image 
                          src={`${API_URL}/storage/${dish.image?.path}`} 
                          alt={dish.name}
                          className="w-full h-full object-cover"
                          preview={false}
                        /> : <Image 
                          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200" 
                          alt={dish.name}
                          className="w-full h-full object-cover"
                          preview={false}
                        />}
                        {dish.is_featured && (
                          <Tag color="red" className="absolute top-2 right-2">
                            Nổi bật
                          </Tag>
                        )}
                      </div>
                    }
                    className="h-full"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <Title level={5} className="!mb-1">{dish.name}</Title>
                        <Text type="secondary" className="block mb-2">{dish.dish_categories?.name}</Text>
                      </div>
                      <Button
                        type="text"
                        icon={favorites.includes(dish.id) ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                        onClick={() => handleFavoriteClick(dish.id)}
                      />
                    </div>
                    <Paragraph ellipsis={{ rows: 2 }} className="text-gray-600 mb-3">
                      {dish.description}
                    </Paragraph>
                    <div className="flex justify-between items-center">
                      <Text strong className="text-lg text-red-600">
                        {dish.price.toLocaleString('vi-VN')}đ
                      </Text>
                      {/* <Rate disabled defaultValue={dish.rating} className="text-sm" /> */}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Menu tabs */}
          <Title level={2} className="mb-6">Thực đơn đầy đủ</Title>
          <Tabs 
            defaultActiveKey="all" 
            onChange={setActiveCategory}
            tabPosition="top"
            className="menu-tabs"
          >
            <TabPane tab="Tất cả" key="all">
              <Row gutter={[16, 16]}>
                {filteredDishes?.map(dish => (
                  <ItemDish dish={dish} key={dish.id} />
                ))}
              </Row>
            </TabPane>

            {/* <TabPane tab="Món nổi bật" key="featured">
              <Row gutter={[16, 16]}>
                {filteredDishes?.map(dish => (
                  <ItemDish dish={dish} key={dish.id} />
                ))}
              </Row>
            </TabPane> */}

            {/* Category tabs */}
            {listDishCategories?.data.map(category => (
              <TabPane tab={`${category.name}`} key={category.id.toString()}>
                <Row gutter={[16, 16]}>
                  {dishesByCategory?.[category.id]?.map(dish => (
                    <ItemDish dish={dish} key={dish.id} />
                  ))}
                </Row>
              </TabPane>
            ))}
          </Tabs>
          
          {/* Nội dung khác có thể thêm vào đây */}
          <Divider />
          <div className="text-center py-4">
            <Text type="secondary">© {new Date().getFullYear()} Nhà hàng Bamboo Sông Chanh. Rất hân hạnh được đón tiếp.</Text>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MenuPage;