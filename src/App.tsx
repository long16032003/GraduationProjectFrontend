// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import '@/styles/siteSettings.css'
import '@/utils/i18n'; // Import i18n configuration
import { RouterProvider } from 'react-router';
import { router } from '@/router.tsx';
import { App as AntdApp, ConfigProvider } from 'antd';
import { iconPrefixCls, prefixCls, theme } from '@/config/theme.ts';
import { StyleProvider } from '@ant-design/cssinjs';
import viVN from 'antd/locale/vi_VN';

function App() {
  return (
    <StyleProvider layer>
      <ConfigProvider 
        prefixCls={prefixCls} 
        iconPrefixCls={iconPrefixCls} 
        theme={theme}
        locale={viVN}
      >
        <AntdApp>
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </StyleProvider>
  )
}

export default App
