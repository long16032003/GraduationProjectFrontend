import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Spin } from 'antd';

const InventoryPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to ingredient management page
    navigate('/admin/warehouse/ingredient');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spin size="large" tip="Đang chuyển hướng..." />
    </div>
  );
};

export default InventoryPage; 