import React from 'react';
import { Modal, List, Tag, Select, Input, Typography } from 'antd';
import { FireOutlined, CheckOutlined } from '@ant-design/icons';
import type { Order, OrderDish, DishGroup, CancelType } from './types';
import { getCancelTypeText } from './utils';

const { Text } = Typography;
const { Option } = Select;

interface KitchenModalsProps {
  // Start cooking modal
  isStartModalVisible: boolean;
  setIsStartModalVisible: (visible: boolean) => void;
  selectedOrder: Order | null;
  onConfirmStartCooking: () => void;

  // Finish cooking modal
  isFinishModalVisible: boolean;
  setIsFinishModalVisible: (visible: boolean) => void;
  onConfirmFinishCooking: () => void;

  // Finish dish modal
  isFinishDishModalVisible: boolean;
  setIsFinishDishModalVisible: (visible: boolean) => void;
  selectedDishGroup: DishGroup | null;
  onConfirmFinishDish: () => void;

  // Cancel order modal
  isCancelOrderModalVisible: boolean;
  setIsCancelOrderModalVisible: (visible: boolean) => void;
  onConfirmCancelOrder: () => void;

  // Cancel dish modal
  isCancelDishModalVisible: boolean;
  setIsCancelDishModalVisible: (visible: boolean) => void;
  selectedDish: OrderDish | null;
  onConfirmCancelDish: () => void;

  // Cancel dish group modal
  isCancelDishGroupModalVisible: boolean;
  setIsCancelDishGroupModalVisible: (visible: boolean) => void;
  onConfirmCancelDishGroup: () => void;

  // Cancel state
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  cancelType: CancelType;
  setCancelType: (type: CancelType) => void;
}

const KitchenModals: React.FC<KitchenModalsProps> = ({
  isStartModalVisible,
  setIsStartModalVisible,
  selectedOrder,
  onConfirmStartCooking,
  isFinishModalVisible,
  setIsFinishModalVisible,
  onConfirmFinishCooking,
  isFinishDishModalVisible,
  setIsFinishDishModalVisible,
  selectedDishGroup,
  onConfirmFinishDish,
  isCancelOrderModalVisible,
  setIsCancelOrderModalVisible,
  onConfirmCancelOrder,
  isCancelDishModalVisible,
  setIsCancelDishModalVisible,
  selectedDish,
  onConfirmCancelDish,
  isCancelDishGroupModalVisible,
  setIsCancelDishGroupModalVisible,
  onConfirmCancelDishGroup,
  cancelReason,
  setCancelReason,
  cancelType,
  setCancelType,
}) => {
  const resetCancelState = () => {
    setCancelReason('');
    setCancelType('out_of_stock');
  };

  return (
    <>
      {/* Modal xác nhận bắt đầu chế biến */}
      <Modal
        title='🔥 Bắt đầu chế biến đơn'
        open={isStartModalVisible}
        onOk={onConfirmStartCooking}
        onCancel={() => setIsStartModalVisible(false)}
        okText='Bắt đầu làm'
        cancelText='Hủy'
        okButtonProps={{ icon: <FireOutlined /> }}
      >
        {selectedOrder && (
          <div>
            <Text style={{ fontSize: '16px' }}>
              Xác nhận bắt đầu chế biến đơn cho <strong>#{selectedOrder.table?.name}</strong>?
            </Text>
            <div style={{ marginTop: 16 }}>
              <Text strong>Danh sách món:</Text>
              <List
                size='small'
                bordered
                dataSource={selectedOrder.order_dishes.filter(dish => dish.is_available === false)}
                renderItem={(dish) => (
                  <List.Item>
                    <Text>{dish.dish?.name}</Text>
                    <Tag color='blue'>x{dish.quantity}</Tag>
                  </List.Item>
                )}
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal xác nhận hoàn thành chế biến */}
      <Modal
        title='✅ Hoàn thành chế biến đơn'
        open={isFinishModalVisible}
        onOk={onConfirmFinishCooking}
        onCancel={() => setIsFinishModalVisible(false)}
        okText='Hoàn thành'
        cancelText='Hủy'
        okButtonProps={{ icon: <CheckOutlined /> }}
      >
        {selectedOrder && (
          <div>
            <Text style={{ fontSize: '16px' }}>
              Xác nhận hoàn thành chế biến đơn <strong>bàn #{selectedOrder.table?.number}</strong>?
            </Text>
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6ffed', borderRadius: 6 }}>
              <Text type='secondary'>
                💡 Đơn sẽ chuyển sang trạng thái "Chờ phục vụ" sau khi hoàn thành.
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal hoàn thành món ăn */}
      <Modal
        title="🍽️ Hoàn thành món ăn"
        open={isFinishDishModalVisible}
        onOk={onConfirmFinishDish}
        onCancel={() => setIsFinishDishModalVisible(false)}
        okText="Hoàn thành tất cả"
        cancelText="Hủy"
        okButtonProps={{ icon: <CheckOutlined /> }}
      >
        {selectedDishGroup && (
          <div>
            <Text style={{ fontSize: '16px' }}>
              Xác nhận hoàn thành <strong>{selectedDishGroup.dishName}</strong> cho tất cả{' '}
              <strong style={{ color: '#1890ff' }}>{selectedDishGroup.remainingQuantity} phần</strong>?
            </Text>
            <div style={{ marginTop: 16 }}>
              <Text strong>Các đơn sẽ được cập nhật:</Text>
              <List
                size="small"
                bordered
                dataSource={selectedDishGroup.orderDetails.filter((o) => !o.isCompleted)}
                renderItem={(orderDetail) => (
                  <List.Item>
                    <Text>🍽️ Bàn #{orderDetail.tableNumber}</Text>
                    <Tag color="blue">x{orderDetail.quantity}</Tag>
                  </List.Item>
                )}
                style={{ marginTop: 8 }}
              />
            </div>
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fff7e6', borderRadius: 6 }}>
              <Text type="secondary">
                💡 Tất cả các đơn có món này sẽ chuyển sang trạng thái "Chờ phục vụ".
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal hủy đơn hàng */}
      <Modal
        title="❌ Hủy đơn hàng"
        open={isCancelOrderModalVisible}
        onOk={onConfirmCancelOrder}
        onCancel={() => {
          setIsCancelOrderModalVisible(false);
          resetCancelState();
        }}
        okText="Xác nhận hủy"
        cancelText="Hủy bỏ"
        okButtonProps={{ danger: true }}
        width={500}
      >
        {selectedOrder && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fff2f0', borderRadius: 6, border: '1px solid #ffccc7' }}>
              <Text type="danger" strong style={{ fontSize: '16px' }}>
                ⚠️ Bạn có chắc chắn muốn hủy đơn #{selectedOrder.table?.name}?
              </Text>
              <br />
              <Text type="secondary">
                Hành động này không thể hoàn tác và sẽ ảnh hưởng đến hóa đơn của khách hàng.
              </Text>
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text strong>Lý do hủy đơn:</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder="Chọn lý do hủy"
                value={cancelType}
                onChange={setCancelType}
              >
                <Option value="out_of_stock">🍽️ Hết hàng/Không có nguyên liệu</Option>
                <Option value="kitchen_issue">🔥 Sự cố bếp/Thiết bị</Option>
                <Option value="customer_request">👤 Yêu cầu khách hàng</Option>
                <Option value="other">❓ Lý do khác</Option>
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text strong>Chi tiết lý do:</Text>
              <Input.TextArea
                rows={3}
                style={{ marginTop: 8 }}
                placeholder="Nhập mô tả chi tiết lý do hủy đơn..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div>
              <Text strong>Danh sách món sẽ bị hủy:</Text>
              <List
                size="small"
                bordered
                style={{ marginTop: 8 }}
                dataSource={selectedOrder.order_dishes}
                renderItem={(dish) => (
                  <List.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Text>{dish.dish?.name} x{dish.quantity}</Text>
                      <Text type="secondary">
                        {Number(dish.price_at_order_time).toLocaleString('vi-VN')} VNĐ
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal hủy món cụ thể */}
      <Modal
        title="❌ Hủy món ăn"
        open={isCancelDishModalVisible}
        onOk={onConfirmCancelDish}
        onCancel={() => {
          setIsCancelDishModalVisible(false);
          resetCancelState();
        }}
        okText="Xác nhận hủy"
        cancelText="Hủy bỏ"
        okButtonProps={{ danger: true }}
        width={450}
      >
        {selectedOrder && selectedDish && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fff7e6', borderRadius: 6, border: '1px solid #ffe7ba' }}>
              <Text type="warning" strong style={{ fontSize: '16px' }}>
                ⚠️ Hủy món: {selectedDish.dish?.name} x{selectedDish.quantity}
              </Text>
              <br />
              <Text type="secondary">
                Món này sẽ không được tính tiền trong hóa đơn cuối cùng.
              </Text>
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text strong>Lý do hủy món:</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder="Chọn lý do hủy"
                value={cancelType}
                onChange={setCancelType}
              >
                <Option value="out_of_stock">🍽️ Hết hàng/Không có nguyên liệu</Option>
                <Option value="kitchen_issue">🔥 Sự cố trong quá trình chế biến</Option>
                <Option value="customer_request">👤 Khách hàng yêu cầu hủy</Option>
                <Option value="other">❓ Lý do khác</Option>
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text strong>Chi tiết lý do:</Text>
              <Input.TextArea
                rows={2}
                style={{ marginTop: 8 }}
                placeholder="Nhập mô tả chi tiết..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal hủy nhóm món */}
      <Modal
        title="❌ Hủy tất cả món"
        open={isCancelDishGroupModalVisible}
        onOk={onConfirmCancelDishGroup}
        onCancel={() => {
          setIsCancelDishGroupModalVisible(false);
          resetCancelState();
        }}
        okText="Xác nhận hủy tất cả"
        cancelText="Hủy bỏ"
        okButtonProps={{ danger: true }}
        width={500}
      >
        {selectedDishGroup && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fff2f0', borderRadius: 6, border: '1px solid #ffccc7' }}>
              <Text type="danger" strong style={{ fontSize: '16px' }}>
                ⚠️ Hủy tất cả {selectedDishGroup.dishName} ({selectedDishGroup.remainingQuantity} phần)?
              </Text>
              <br />
              <Text type="secondary">
                Tất cả món này trong các đơn khác nhau sẽ bị hủy và không được tính tiền.
              </Text>
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text strong>Lý do hủy món:</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder="Chọn lý do hủy"
                value={cancelType}
                onChange={setCancelType}
              >
                <Option value="out_of_stock">🍽️ Hết hàng/Không có nguyên liệu</Option>
                <Option value="kitchen_issue">🔥 Sự cố bếp/Thiết bị</Option>
                <Option value="customer_request">👤 Yêu cầu khách hàng</Option>
                <Option value="other">❓ Lý do khác</Option>
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text strong>Chi tiết lý do:</Text>
              <Input.TextArea
                rows={2}
                style={{ marginTop: 8 }}
                placeholder="Nhập mô tả chi tiết..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div>
              <Text strong>Các đơn sẽ bị ảnh hưởng:</Text>
              <List
                size="small"
                bordered
                style={{ marginTop: 8 }}
                dataSource={selectedDishGroup.orderDetails.filter(o => !o.isCompleted)}
                renderItem={(orderDetail) => (
                  <List.Item>
                    <Text>🍽️ Bàn #{orderDetail.tableNumber} - {orderDetail.quantity} phần</Text>
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default KitchenModals; 