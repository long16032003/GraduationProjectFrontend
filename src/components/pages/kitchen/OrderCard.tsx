import React, { useState } from 'react';
import {
  Card,
  List,
  Space,
  Badge,
  Tag,
  Button,
  Divider,
  Statistic,
  Avatar,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Order, OrderDish, KitchenViewMode } from './types';
import { getStatusColor, getStatusIcon, getStatusText, getElapsedTime } from './utils';

const { Text } = Typography;

interface OrderCardProps {
  order: Order;
  kitchenViewMode: KitchenViewMode;
  onStartCooking: (order: Order) => void;
  onFinishCooking: (order: Order) => void;
  onCancelOrder: (order: Order) => void;
  onCancelDish: (order: Order, dish: OrderDish) => void;
  onServiceConfirm: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  kitchenViewMode,
  onStartCooking,
  onFinishCooking,
  onCancelOrder,
  onCancelDish,
  onServiceConfirm,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const elapsedTime = getElapsedTime(order.order_time);
  const isHighPriority =
    order.status === 'not completed' || (order.priority !== undefined && order.priority > 3);
  const StatusIcon = getStatusIcon(order.status);

  const renderOrderActions = () => {
    if (order.status === 'cancelled') {
      return (
        <Tag
          color='default'
          style={{ fontSize: '12px' }}
        >
          Đã hủy
        </Tag>
      );
    }
    if (kitchenViewMode === 'by-order') {
      if (['init', 'not completed'].includes(order.status)) {
        return (
          <Space size={4}>
            <Button
              type='primary'
              size='small'
              onClick={() => onStartCooking(order)}
              style={{ fontSize: '12px', padding: '0 6px', height: '24px' }}
            >
              Bắt đầu
            </Button>
            <Button
              danger
              size='small'
              onClick={() => onCancelOrder(order)}
              style={{ fontSize: '12px', padding: '0 6px', height: '24px' }}
              title='Hủy đơn'
            >
              ❌
            </Button>
          </Space>
        );
      } else if (order.status === 'processing') {
        return (
          <Space size={4}>
            <Button
              type='primary'
              size='small'
              onClick={() => onFinishCooking(order)}
              style={{ fontSize: '12px', padding: '0 6px', height: '24px' }}
            >
              Hoàn thành
            </Button>
            <Button
              danger
              size='small'
              onClick={() => onCancelOrder(order)}
              style={{ fontSize: '12px', padding: '0 6px', height: '24px' }}
              title='Hủy đơn'
            >
              ❌
            </Button>
          </Space>
        );
      } else {
        if (order.status === 'finished process') {
          return (
            <Button
              type='primary'
              size='small'
              onClick={() => onServiceConfirm(order)}
              style={{ fontSize: '12px', padding: '0 6px', height: '24px' }}
            >
              Kiểm tra
            </Button>
          );
        }
      }
    }
    return null;
  };

  return (
    <Card
      className='mb-0'
      size='small'
      style={{
        borderLeft: `4px solid ${getStatusColor(order.status)}`,
        background: isHighPriority
          ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        height: '100%',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${getStatusColor(order.status)}20`,
      }}
      title={
        <div
          className='flex justify-between items-center'
          style={{ padding: '0' }}
        >
          <div className='flex items-center'>
            <span
              className='font-bold mr-2'
              style={{ fontSize: '16px' }}
            >
              {order.table?.name}
            </span>
            {isHighPriority && (
              <Badge
                count='!'
                style={{ backgroundColor: '#f5222d' }}
              />
            )}
          </div>
          <Space size={4}>
            <Tag
              color={getStatusColor(order.status)}
              style={{ margin: 0, padding: '0 4px', fontSize: '14px' }}
            >
              <StatusIcon /> {getStatusText(order.status)}
            </Tag>
            <Text
              type='secondary'
              style={{ fontSize: '13px' }}
            >
              {elapsedTime}
            </Text>
          </Space>
        </div>
      }
      styles={{ body: { padding: '8px' } }}
    >
      <List
        size='small'
        dataSource={isExpanded ? order.order_dishes : order.order_dishes.slice(0, 3)}
        renderItem={(dish) => (
          <List.Item style={{ padding: '2px 0' }}>
            <div className='w-full flex justify-between items-center'>
              <div className='flex items-center flex-1'>
                <div className='flex-1'>
                  <div className='flex items-center'>
                    <Text
                      strong
                      className='mr-1'
                      style={{
                        fontSize: '14px',
                        color:
                          dish.is_available === false || dish.status === 'cancelled'
                            ? '#ff4d4f'
                            : 'inherit',
                      }}
                    >
                      {dish.dish?.name}
                    </Text>
                    <Text style={{ fontSize: '14px' }}>x{dish.quantity}</Text>
                    {dish.is_available === false && (
                      <Tag
                        color='red'
                        className='ml-1'
                      >
                        Thiếu
                      </Tag>
                    )}
                    {dish.status === 'cancelled' && (
                      <Tag
                        color='default'
                        className='ml-1'
                      >
                        Đã hủy
                      </Tag>
                    )}
                  </div>
                  {dish.note && (
                    <Text
                      type='secondary'
                      style={{ fontSize: '13px' }}
                    >
                      Ghi chú: {dish.note}
                    </Text>
                  )}
                  {dish.cancelled_reason && (
                    <Text
                      type='danger'
                      style={{ fontSize: '12px' }}
                    >
                      Lý do hủy: {dish.cancelled_reason}
                    </Text>
                  )}
                </div>
              </div>
              <div className='flex items-center'>
                {order.chef_name && (
                  <Tooltip title={`Đầu bếp: ${order.chef_name}`}>
                    <Avatar
                      size='small'
                      icon={<UserOutlined />}
                      className='mr-2'
                    />
                  </Tooltip>
                )}
                {/* <Text
                  type='secondary'
                  style={{ fontSize: '13px' }}
                >
                  {dish.dish?.preparation_time || 15} phút
                </Text> */}
                {dish.status !== 'cancelled' && (order.status !== 'cancelled' && order.status !== 'finished process' && order.status !== 'done') && (
                  <Button
                    danger
                    size='small'
                    onClick={() => onCancelDish(order, dish)}
                    style={{
                      fontSize: '10px',
                      padding: '0 4px',
                      height: '18px',
                      marginLeft: '4px',
                    }}
                    title='Hủy món này'
                  >
                    ❌
                  </Button>
                )}
              </div>
            </div>
          </List.Item>
        )}
      />

      {order.order_dishes.length > 3 && (
        <div className='text-center py-1'>
          <Button
            type='link'
            size='small'
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              fontSize: '13px',
              height: 'auto',
              padding: '0',
              color: '#1890ff'
            }}
          >
            {isExpanded 
              ? 'Thu gọn' 
              : `Xem thêm ${order.order_dishes.length - 3} món khác`
            }
          </Button>
        </div>
      )}

      {order.note && (
        <div className='mt-1'>
          <Text
            type='secondary'
            style={{ fontSize: '13px' }}
          >
            Ghi chú: {order.note}
          </Text>
        </div>
      )}

      <Divider style={{ margin: '4px 0' }} />

      <div className='flex justify-between items-center'>
        <div>
          <Space size={4}>
            <Statistic
              title={<span style={{ fontSize: '13px' }}>Thời gian chờ</span>}
              value={dayjs().diff(dayjs(order.created_at), 'minute')}
              suffix='phút'
              valueStyle={{ fontSize: '14px' }}
            />
          </Space>
        </div>
        <div>{renderOrderActions()}</div>
      </div>
    </Card>
  );
};

export default OrderCard;
