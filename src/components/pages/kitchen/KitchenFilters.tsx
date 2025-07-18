import React, { useState, useEffect } from 'react';
import { Input, Space, Radio, Tag, Typography, DatePicker, Button, Tooltip } from 'antd';
import { SearchOutlined, UnorderedListOutlined, AppstoreOutlined, SyncOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;
import type { KitchenViewMode } from './types';

interface KitchenFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  kitchenViewMode: KitchenViewMode;
  onViewModeChange: (mode: KitchenViewMode) => void;
  isMobile: boolean;
  selectedDate: Dayjs;
  onDateChange: (date: Dayjs | null) => void;
  isRefreshing?: boolean;
  onManualRefresh?: () => void;
}

const KitchenFilters: React.FC<KitchenFiltersProps> = ({
  searchText,
  onSearchChange,
  kitchenViewMode,
  onViewModeChange,
  isMobile,
  selectedDate,
  onDateChange,
  isRefreshing = false,
  onManualRefresh,
}) => {
  const [countdown, setCountdown] = useState(30);

  // Countdown timer for auto refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Reset countdown when manual refresh is triggered
  useEffect(() => {
    if (isRefreshing) {
      setCountdown(30);
    }
  }, [isRefreshing]);

  const handleManualRefresh = () => {
    if (onManualRefresh) {
      onManualRefresh();
      setCountdown(30); // Reset countdown
    }
  };

  return (
    <div className='mb-2 flex justify-between items-center flex-wrap'>
      <Space wrap className='mb-2'>
        <Input
          placeholder='Tìm kiếm theo bàn hoặc món'
          prefix={<SearchOutlined />}
          style={{ width: isMobile ? '100%' : 200 }}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          size='middle'
        />
        
        <DatePicker
          value={selectedDate}
          onChange={onDateChange}
          format="DD/MM/YYYY"
          placeholder="Chọn ngày"
          size="middle"
          style={{ width: 120 }}
          allowClear={false}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text style={{ fontSize: '14px' }}>Xem theo:</Text>
          <Radio.Group
            value={kitchenViewMode}
            onChange={(e) => onViewModeChange(e.target.value)}
            size="small"
          >
            <Radio.Button value="by-order">
              <UnorderedListOutlined /> Đơn hàng
            </Radio.Button>
            <Radio.Button value="by-dish">
              <AppstoreOutlined /> Món ăn
            </Radio.Button>
          </Radio.Group>
        </div>
      </Space>

      <Space>
        {/* Manual refresh button */}
        <Tooltip title="Làm mới ngay">
          <Button
            icon={<SyncOutlined spin={isRefreshing} />}
            onClick={handleManualRefresh}
            size="small"
            type="text"
            loading={isRefreshing}
          />
        </Tooltip>

        {/* Auto refresh status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text style={{ fontSize: '14px' }}>Tự động làm mới:</Text>
          <Tag 
            color='processing' 
            style={{ margin: 0, fontSize: '12px', minWidth: '60px', textAlign: 'center' }}
          >
            {isRefreshing ? 'Đang tải...' : `${countdown}s`}
          </Tag>
        </div>
      </Space>
    </div>
  );
};

export default KitchenFilters; 