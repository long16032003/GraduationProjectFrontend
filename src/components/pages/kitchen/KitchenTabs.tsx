import React from 'react';
import { Tabs, Badge, Row, Col, Empty, Typography } from 'antd';
import {
  ClockCircleOutlined,
  FireOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  CloseOutlined,
  BellOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { Order, OrderDish, DishGroup, OrderCounts, KitchenViewMode } from './types';
import OrderCard from './OrderCard';
import DishGroupCard from './DishGroupCard';

const { Text } = Typography;

interface KitchenTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  kitchenViewMode: KitchenViewMode;
  orderCounts: OrderCounts;
  filteredOrders: Order[];
  dishGroups: DishGroup[];
  onStartCooking: (order: Order) => void;
  onFinishCooking: (order: Order) => void;
  onCancelOrder: (order: Order) => void;
  onCancelDish: (order: Order, dish: OrderDish) => void;
  onFinishDish: (dishGroup: DishGroup) => void;
  onCancelDishGroup: (dishGroup: DishGroup) => void;
  onServiceConfirm: (order: Order) => void;
}

const KitchenTabs: React.FC<KitchenTabsProps> = ({
  activeTab,
  setActiveTab,
  kitchenViewMode,
  orderCounts,
  filteredOrders,
  dishGroups,
  onStartCooking,
  onFinishCooking,
  onCancelOrder,
  onCancelDish,
  onFinishDish,
  onCancelDishGroup,
  onServiceConfirm,
}) => {
  const renderOrders = () => {
    if (filteredOrders.length === 0) {
      return (
        <div className='text-center py-8'>
          <Text type='secondary'>Không có đơn hàng nào</Text>
        </div>
      );
    }

    return (
      <Row gutter={[8, 8]}>
        {filteredOrders.map((order) => (
          <Col
            xs={24}
            sm={12}
            md={12}
            lg={12}
            xl={12}
            key={order.id}
          >
            <OrderCard
              order={order}
              kitchenViewMode={kitchenViewMode}
              onStartCooking={onStartCooking}
              onFinishCooking={onFinishCooking}
              onCancelOrder={onCancelOrder}
              onCancelDish={onCancelDish}
              onServiceConfirm={onServiceConfirm}
            />
          </Col>
        ))}
      </Row>
    );
  };

  const renderDishGroups = () => {
    return (
      <div style={{ padding: '8px 0' }}>
        <Row gutter={[16, 16]}>
          {dishGroups.map((dishGroup) => (
            <Col key={dishGroup.dishId} xs={24} sm={12} md={8} lg={6}>
              <DishGroupCard
                dishGroup={dishGroup}
                onFinishDish={onFinishDish}
                onCancelDishGroup={onCancelDishGroup}
              />
            </Col>
          ))}
        </Row>
        {dishGroups.length === 0 && (
          <Empty
            description="Không có món nào cần chế biến"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    );
  };

  return (
    <Tabs
      activeKey={kitchenViewMode === 'by-dish' ? 'all-dishes' : activeTab}
      onChange={(key) => {
        if (kitchenViewMode === 'by-dish') {
          // Không thay đổi tab khi ở chế độ by-dish
          return;
        }
        setActiveTab(key);
      }}
      size='middle'
      tabBarStyle={{ marginBottom: '8px' }}
      tabBarExtraContent={
        <Badge
          count={orderCounts.pending}
          offset={[-10, 0]}
          style={{
            display: orderCounts.pending > 0 ? 'block' : 'none',
          }}
        >
          <BellOutlined style={{ fontSize: 18, color: '#1890ff' }} />
        </Badge>
      }
      items={
        kitchenViewMode === 'by-order'
          ? [
              {
                key: 'pending',
                label: (
                  <span>
                    <ClockCircleOutlined /> Chờ làm ({orderCounts.pending})
                  </span>
                ),
                children: renderOrders(),
              },
              {
                key: 'cooking',
                label: (
                  <span>
                    <FireOutlined /> Đang làm ({orderCounts.cooking})
                  </span>
                ),
                children: renderOrders(),
              },
              {
                key: 'ready',
                label: (
                  <span>
                    <CheckOutlined /> Chờ phục vụ ({orderCounts.ready})
                  </span>
                ),
                children: renderOrders(),
              },
              {
                key: 'done',
                label: (
                  <span>
                    <CheckCircleOutlined /> Hoàn thành ({orderCounts.done})
                  </span>
                ),
                children: renderOrders(),
              },
              {
                key: 'all',
                label: (
                  <span>
                    <HistoryOutlined /> Tất cả ({orderCounts.all})
                  </span>
                ),
                children: renderOrders(),
              },
              {
                key: 'cancelled',
                label: (
                  <span>
                    <CloseOutlined /> Đã hủy ({orderCounts.cancelled})
                  </span>
                ),
                children: renderOrders(),
              },
            ]
          : [
              {
                key: 'all-dishes',
                label: (
                  <span>
                    <AppstoreOutlined /> Tất cả món ({dishGroups.length})
                  </span>
                ),
                children: renderDishGroups(),
              },
            ]
      }
    />
  );
};

export default KitchenTabs; 