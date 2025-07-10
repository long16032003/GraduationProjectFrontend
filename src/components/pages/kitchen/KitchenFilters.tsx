import React from 'react';
import { Input, Space, Radio, Tag, Typography, DatePicker } from 'antd';
import { SearchOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
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
}

const KitchenFilters: React.FC<KitchenFiltersProps> = ({
  searchText,
  onSearchChange,
  kitchenViewMode,
  onViewModeChange,
  isMobile,
  selectedDate,
  onDateChange,
}) => {
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

      <div>
        <Text style={{ fontSize: '14px' }}>Tự động làm mới: </Text>
        <Tag color='processing' style={{ margin: 0, fontSize: '14px' }}>
          30 giây
        </Tag>
      </div>
    </div>
  );
};

export default KitchenFilters; 