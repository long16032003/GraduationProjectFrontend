import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MenuPage from "@/pages/menuPage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/menu" element={<MenuPage />} />
      {/* Thêm các routes khác vào đây */}
    </Routes>
  );
};

export default AppRoutes; 