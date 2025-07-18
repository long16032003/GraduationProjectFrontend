import React from 'react';
import { Card, List, Space, Tag, Button, Divider, Avatar, Progress, Typography, Badge } from 'antd';
import { AppstoreOutlined, CheckOutlined, CloseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { DishGroup } from './types';
import { getStatusColor } from './utils';

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
  const isHighPriority = dishGroup.remainingQuantity > 0;
  const hasActiveItems = dishGroup.orderDetails.some(detail => !detail.isCompleted && !detail.isCancelled);

  // Get status color - completed dishes use 'done' status, pending use 'processing'
  const statusColor = isCompleted ? getStatusColor('done') : getStatusColor('processing');

  return (
    <Card
      className='mb-0'
      size="small"
      style={{
        borderLeft: `4px solid ${statusColor}`,
        background: isHighPriority && !isCompleted
          ? 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)'
          : isCompleted 
            ? 'linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        height: '100%',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${statusColor}20`,
      }}
      title={
        <div className='flex justify-between items-center' style={{ padding: '0' }}>
          <div className='flex items-center'>
            <Avatar
              icon={<AppstoreOutlined />}
              style={{ backgroundColor: statusColor, marginRight: 8 }}
              size="small"
            />
            <span className='font-bold mr-2' style={{ fontSize: '16px' }}>
              {dishGroup.dishName}
            </span>
            {isHighPriority && !isCompleted && (
              <Badge
                count='!'
                style={{ backgroundColor: '#faad14' }}
              />
            )}
          </div>
          <Space size={4}>
            <Tag
              color={isCompleted ? 'green' : 'orange'}
              style={{ margin: 0, padding: '0 4px', fontSize: '14px' }}
            >
              {isCompleted ? <CheckOutlined /> : <ClockCircleOutlined />}
              {isCompleted ? ' Hoàn thành' : ' Cần làm'}
            </Tag>
          </Space>
        </div>
      }
      styles={{ body: { padding: '8px' } }}
    >
      <div style={{ marginBottom: 12 }}>
        <div className='flex justify-between items-center' style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: '13px' }}>Tiến độ hoàn thành:</Text>
          <Text strong style={{ fontSize: '14px' }}>
            {dishGroup.completedQuantity}/{dishGroup.totalQuantity} phần
          </Text>
        </div>
        <Progress
          percent={Math.round(progress)}
          strokeColor={statusColor}
          showInfo={false}
          size="small"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <Text style={{ fontWeight: 600, marginBottom: 8, display: 'block', fontSize: '13px' }}>
          📋 Các đơn cần làm:
        </Text>
        <List
          size="small"
          dataSource={dishGroup.orderDetails}
          renderItem={(orderDetail) => (
            <List.Item style={{ 
              padding: '2px 0',
              backgroundColor: orderDetail.isCancelled 
                ? 'rgba(255, 77, 79, 0.1)' 
                : orderDetail.isCompleted 
                  ? 'rgba(82, 196, 26, 0.1)' 
                  : 'transparent',
              borderRadius: 4,
              marginBottom: 2,
              paddingLeft: (orderDetail.isCompleted || orderDetail.isCancelled) ? 8 : 0,
            }}>
              <div className='w-full flex justify-between items-center'>
                <div className='flex items-center flex-1'>
                  <div className='flex-1'>
                    <div className='flex items-center'>
                      <Text
                        strong
                        className='mr-1'
                        style={{ 
                          fontSize: '14px',
                          color: orderDetail.isCancelled ? '#8c8c8c' : 'inherit'
                        }}
                      >
                        🍽️ Bàn #{orderDetail.tableNumber}
                      </Text>
                      <Tag color="blue" style={{ marginLeft: 4, fontSize: '12px' }}>
                        x{orderDetail.quantity}
                      </Tag>
                      {orderDetail.isCompleted && (
                        <Tag color="green" style={{ marginLeft: 4, fontSize: '12px' }}>
                          ✅ Xong
                        </Tag>
                      )}
                      {orderDetail.isCancelled && (
                        <Tag color="default" style={{ marginLeft: 4, fontSize: '12px' }}>
                          ❌ Đã hủy
                        </Tag>
                      )}
                    </div>
                    {orderDetail.note && (
                      <Text
                        type='secondary'
                        style={{ fontSize: '12px', display: 'block', marginTop: 2 }}
                      >
                        💬 {orderDetail.note}
                      </Text>
                    )}
                  </div>
                </div>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {dayjs(orderDetail.orderTime).fromNow()}
                </Text>
              </div>
            </List.Item>
          )}
        />
      </div>

      {hasActiveItems && (
        <>
          <Divider style={{ margin: '4px 0' }} />
          <div className='flex justify-between items-center'>
            <div>
              <Text style={{ fontSize: '13px', color: '#8c8c8c' }}>
                Còn lại: {dishGroup.remainingQuantity} phần
              </Text>
            </div>
            <Space size={4}>
              <Button
                type='primary'
                size='small'
                onClick={() => onFinishDish(dishGroup)}
                style={{ fontSize: '12px', padding: '0 6px', height: '24px' }}
                icon={<CheckOutlined />}
              >
                Hoàn thành
              </Button>
              <Button
                danger
                size='small'
                onClick={() => onCancelDishGroup(dishGroup)}
                style={{ fontSize: '12px', padding: '0 6px', height: '24px' }}
                title='Hủy tất cả món này'
              >
                ❌
              </Button>
            </Space>
          </div>
        </>
      )}
    </Card>
  );
};

export default DishGroupCard; 