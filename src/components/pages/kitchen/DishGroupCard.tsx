import React from 'react';
import { Card, List, Space, Tag, Button, Divider, Avatar, Progress, Typography } from 'antd';
import { AppstoreOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { DishGroup } from './types';

const { Text } = Typography;

interface DishGroupCardProps {
  dishGroup: DishGroup;
  onFinishDish: (dishGroup: DishGroup) => void;
  onCancelDishGroup: (dishGroup: DishGroup) => void;
}

const DishGroupCard: React.FC<DishGroupCardProps> = ({
  dishGroup,
  onFinishDish,
  onCancelDishGroup,
}) => {
  const progress = dishGroup.totalQuantity > 0 ? (dishGroup.completedQuantity / dishGroup.totalQuantity) * 100 : 0;
  const isCompleted = dishGroup.remainingQuantity === 0;

  return (
    <Card
      key={dishGroup.dishId}
      size="small"
      style={{
        borderLeft: `4px solid ${isCompleted ? '#52c41a' : '#faad14'}`,
        background: isCompleted 
          ? 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%)' 
          : 'linear-gradient(135deg, #fff8e1 0%, #ffeaa7 100%)',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${isCompleted ? '#52c41a' : '#faad14'}30`,
      }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              icon={<AppstoreOutlined />}
              style={{ backgroundColor: isCompleted ? '#52c41a' : '#faad14', marginRight: 8 }}
              size="small"
            />
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{dishGroup.dishName}</span>
          </div>
          <Space>
            <Tag color={isCompleted ? 'green' : 'orange'}>
              {isCompleted ? '✅ Hoàn thành' : '🔥 Cần làm'}
            </Tag>
          </Space>
        </div>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text>Tiến độ hoàn thành:</Text>
          <Text strong>
            {dishGroup.completedQuantity}/{dishGroup.totalQuantity} phần
          </Text>
        </div>
        <Progress
          percent={Math.round(progress)}
          strokeColor={isCompleted ? '#52c41a' : '#faad14'}
          showInfo={false}
          size="small"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <Text style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
          📋 Các đơn cần làm:
        </Text>
        <List
          size="small"
          dataSource={dishGroup.orderDetails}
          renderItem={(orderDetail) => (
            <List.Item
              style={{
                padding: '6px 0',
                backgroundColor: orderDetail.isCompleted
                  ? 'rgba(82, 196, 26, 0.1)'
                  : 'transparent',
                borderRadius: 4,
                marginBottom: 2,
                paddingLeft: orderDetail.isCompleted ? 8 : 0,
              }}
            >
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Text strong>🍽️ Bàn #{orderDetail.tableNumber}</Text>
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    x{orderDetail.quantity}
                  </Tag>
                  {orderDetail.isCompleted && (
                    <Tag color="green" style={{ marginLeft: 4 }}>
                      ✅ Xong
                    </Tag>
                  )}
                </div>
                <Text type="secondary" style={{ fontSize: '10px' }}>
                  {dayjs(orderDetail.orderTime).fromNow()}
                </Text>
              </div>
              {orderDetail.note && (
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: '10px' }}>
                    💬 {orderDetail.note}
                  </Text>
                </div>
              )}
            </List.Item>
          )}
        />
      </div>

      {!isCompleted && (
        <>
          <Divider style={{ margin: '8px 0' }} />
          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              <Button
                type="primary"
                size="small"
                onClick={() => onFinishDish(dishGroup)}
                style={{ width: '100%', fontWeight: 600 }}
                icon={<CheckOutlined />}
              >
                Hoàn thành {dishGroup.remainingQuantity} phần
              </Button>
              <Button
                danger
                size="small"
                onClick={() => onCancelDishGroup(dishGroup)}
                style={{ width: '100%', fontWeight: 600 }}
                icon={<CloseOutlined />}
              >
                Hủy tất cả món này
              </Button>
            </Space>
          </div>
        </>
      )}
    </Card>
  );
};

export default DishGroupCard; 