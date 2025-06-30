import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Space,
  Typography,
  List,
  Tag,
  Alert,
  Input,
  Divider,
  Checkbox,
  Row,
  Col,
  Card,
} from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { Order, OrderDish } from './types';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ServiceConfirmModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirmComplete: (orderId: number) => void;
  onConfirmIncomplete: (orderId: number, missingDishes: number[], note: string) => void;
}

interface DishCheckStatus {
  dishId: number;
  isConfirmed: boolean;
  note?: string;
}

const ServiceConfirmModal: React.FC<ServiceConfirmModalProps> = ({
  visible,
  order,
  onClose,
  onConfirmComplete,
  onConfirmIncomplete,
}) => {
  const [dishStatuses, setDishStatuses] = useState<DishCheckStatus[]>([]);
  const [incompleteNote, setIncompleteNote] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize dish statuses when modal opens
  useEffect(() => {
    if (order && visible) {
      const initialStatuses: DishCheckStatus[] = order.order_dishes
        .filter(dish => dish.status !== 'cancelled')
        .map(dish => ({
          dishId: dish.dish_id,
          isConfirmed: dish.is_available !== false, // Available từ bếp = confirmed sẵn
          note: ''
        }));
      setDishStatuses(initialStatuses);
      setIncompleteNote('');
    }
  }, [order, visible]);

  const handleDishCheck = (dishId: number, isConfirmed: boolean) => {
    setDishStatuses(prev => 
      prev.map(status => 
        status.dishId === dishId 
          ? { ...status, isConfirmed, note: isConfirmed ? '' : status.note }
          : status
      )
    );
  };

  const handleDishNote = (dishId: number, note: string) => {
    setDishStatuses(prev => 
      prev.map(status => 
        status.dishId === dishId 
          ? { ...status, note }
          : status
      )
    );
  };

  const handleComplete = async () => {
    if (!order) return;
    setLoading(true);
    try {
      await onConfirmComplete(order.id);
      onClose();
      setIncompleteNote('');
    } catch (error) {
      console.error('Error completing order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncomplete = async () => {
    if (!order) return;
    setLoading(true);
    
    const missingDishes = dishStatuses
      .filter(status => !status.isConfirmed)
      .map(status => status.dishId);
      
    try {
      await onConfirmIncomplete(order.id, missingDishes, incompleteNote);
      onClose();
      setIncompleteNote('');
    } catch (error) {
      console.error('Error marking incomplete:', error);
    } finally {
      setLoading(false);
    }
  };

  const missingCount = dishStatuses.filter(status => !status.isConfirmed).length;
  const totalDishes = dishStatuses.length;
  const canComplete = missingCount === 0;

  if (!order) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>Xác nhận phục vụ - #{order.table?.name}</span>
        </div>
      }
      open={visible}
      onCancel={() => {
        onClose();
        setIncompleteNote('');
      }}
      width={700}
      footer={null}
    >
      <Alert
        message={
          canComplete 
            ? "Tất cả món đã sẵn sàng phục vụ" 
            : `${missingCount}/${totalDishes} món chưa sẵn sàng`
        }
        type={canComplete ? "success" : "warning"}
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Title level={5}>Kiểm tra từng món trước khi phục vụ:</Title>
      
      <List
        dataSource={order.order_dishes.filter(dish => dish.status !== 'cancelled')}
        renderItem={(dish: OrderDish) => {
          const status = dishStatuses.find(s => s.dishId === dish.dish_id);
          const isConfirmed = status?.isConfirmed ?? true;
          const isAvailableFromKitchen = dish.is_available !== false;
          
          return (
            <List.Item>
              <Card 
                size="small" 
                style={{ 
                  width: '100%',
                  borderColor: isConfirmed ? '#52c41a' : '#ff4d4f',
                  backgroundColor: isConfirmed ? '#f6ffed' : '#fff2f0'
                }}
              >
                <Row gutter={[16, 8]} align="middle">
                  <Col span={1}>
                    <Checkbox
                      checked={isConfirmed}
                      onChange={(e) => handleDishCheck(dish.dish_id, e.target.checked)}
                    />
                  </Col>
                  <Col span={9}>
                    <div>
                      <Text strong style={{ fontSize: '16px' }}>
                        {dish.dish?.name}
                      </Text>
                      <br />
                      <Space>
                        <Tag color="blue">x{dish.quantity}</Tag>
                        {!isAvailableFromKitchen && (
                          <Tag color="orange" icon={<WarningOutlined />}>
                            Bếp báo thiếu
                          </Tag>
                        )}
                        {dish.note && (
                          <Tag color="cyan">Ghi chú: {dish.note}</Tag>
                        )}
                      </Space>
                    </div>
                  </Col>
                  <Col span={5}>
                    <Tag 
                      color={isConfirmed ? 'green' : 'red'}
                      icon={isConfirmed ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                      style={{ fontSize: '13px' }}
                    >
                      {isConfirmed ? 'Sẵn sàng' : 'Chưa đủ'}
                    </Tag>
                  </Col>
                  {/* <Col span={9}>
                    {!isConfirmed && (
                      <Input
                        placeholder="Lý do chưa sẵn sàng..."
                        size="small"
                        value={status?.note || ''}
                        onChange={(e) => handleDishNote(dish.dish_id, e.target.value)}
                      />
                    )}
                  </Col> */}
                </Row>
              </Card>
            </List.Item>
          );
        }}
      />

      {/* {missingCount > 0 && (
        <>
          <Divider />
          <div style={{ marginBottom: 16 }}>
            <Title level={5}>Ghi chú tổng thể về những món chưa sẵn sàng:</Title>
            <TextArea
              rows={3}
              placeholder="Mô tả chi tiết vấn đề để bếp khắc phục: thiếu nguyên liệu, chất lượng chưa đạt, cần làm lại..."
              value={incompleteNote}
              onChange={(e) => setIncompleteNote(e.target.value)}
            />
          </div>
        </>
      )} */}

      <div style={{ textAlign: 'center' }}>
        <Space size="large">
          <Button
            size="large"
            onClick={() => {
              onClose();
              setIncompleteNote('');
            }}
          >
            Hủy
          </Button>
          
          {missingCount > 0 && (
            <Button
              type="primary"
              danger
              size="large"
              loading={loading}
              icon={<ExclamationCircleOutlined />}
              onClick={handleIncomplete}
              style={{ minWidth: '180px' }}
            >
              Báo {missingCount} món chưa sẵn sàng
            </Button>
          )}
          
          <Button
            type="primary"
            size="large"
            loading={loading}
            icon={<CheckCircleOutlined />}
            onClick={handleComplete}
            disabled={!canComplete}
            style={{ 
              backgroundColor: canComplete ? '#52c41a' : '#d9d9d9', 
              borderColor: canComplete ? '#52c41a' : '#d9d9d9',
              minWidth: '180px'
            }}
          >
            {canComplete ? 'Hoàn thành phục vụ' : 'Chưa thể phục vụ'}
          </Button>
        </Space>
      </div>

      <Alert
        message="Hướng dẫn sử dụng"
        description={
          <div>
            • <strong>Tick vào checkbox:</strong> Xác nhận món đã sẵn sàng phục vụ<br/>
            • <strong>Bỏ tick:</strong> Báo món chưa sẵn sàng<br/>
            • <strong>Hoàn thành phục vụ:</strong> Chỉ hiện khi tất cả món đều đã sẵn sàng<br/>
            • <strong>Báo chưa sẵn sàng:</strong> Đơn sẽ quay về bếp với độ ưu tiên cao hơn
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};

export default ServiceConfirmModal; 