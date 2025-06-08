import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

interface ModalConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

export const ModalConfirmDelete: React.FC<ModalConfirmDeleteProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  message = "Bạn có chắc chắn muốn xóa mục này?",
  loading = false
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center">
          <ExclamationCircleFilled className="text-red-500 mr-2" />
          {title}
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={loading}
          onClick={onConfirm}
        >
          Xóa
        </Button>,
      ]}
    >
      <p>{message}</p>
    </Modal>
  );
};