import React from 'react';
import { Card, Typography, Breadcrumb } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import OverviewStatistics from '../dashboard/overview-statistics';

const { Title } = Typography;

const StatisticDetail: React.FC = () => {
  return (
    <div className="p-6">
      <Card className="shadow-sm mb-4">
        <Breadcrumb 
          className="mb-4"
          items={[
            {
              title: <a href="/admin">Dashboard</a>,
            },
            {
              title: 'Thống kê chi tiết',
            },
          ]}
        />
        
        <div className="flex items-center mb-6">
          <BarChartOutlined className="text-2xl text-blue-500 mr-3" />
          <Title level={2} className="!mb-0">
            Thống kê chi tiết nhà hàng
          </Title>
        </div>
      </Card>

      <OverviewStatistics />
    </div>
  );
};

export default StatisticDetail; 