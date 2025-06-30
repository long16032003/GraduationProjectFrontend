import { ClockCircleOutlined, FireOutlined, CheckOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { CancelType } from './types';

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'init':
      return 'Chờ chế biến';
    case 'processing':
      return 'Đang chế biến';
    case 'finished process':
      return 'Chờ phục vụ';
    case 'not completed':
      return 'Chưa hoàn thành';
    case 'done':
      return 'Hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'init':
    case 'not completed':
      return '#1890ff';
    case 'processing':
      return '#faad14';
    case 'finished process':
      return '#722ed1';
    case 'done':
      return '#52c41a';
    default:
      return '#d9d9d9';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'init':
    case 'not completed':
      return ClockCircleOutlined;
    case 'processing':
      return FireOutlined;
    case 'finished process':
      return CheckOutlined;
    case 'done':
      return CheckCircleOutlined;
    default:
      return ExclamationCircleOutlined;
  }
};

export const getElapsedTime = (createdAt: string): string => {
  return dayjs(createdAt).fromNow();
};

export const getCancelTypeText = (type: CancelType): string => {
  switch (type) {
    case 'out_of_stock':
      return 'Hết hàng/Không có nguyên liệu';
    case 'kitchen_issue':
      return 'Sự cố bếp/Thiết bị';
    case 'customer_request':
      return 'Yêu cầu khách hàng';
    case 'other':
      return 'Lý do khác';
    default:
      return 'Không xác định';
  }
}; 