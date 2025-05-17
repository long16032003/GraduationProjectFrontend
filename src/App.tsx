// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { RouterProvider } from 'react-router';
import { router } from '@/router.tsx';
import { App as AntdApp, ConfigProvider } from 'antd';
import { iconPrefixCls, prefixCls, theme } from '@/config/theme.ts';
import { StyleProvider } from '@ant-design/cssinjs';

function App() {
  return (
    <StyleProvider layer>
      <ConfigProvider prefixCls={prefixCls} iconPrefixCls={iconPrefixCls} theme={theme}>
        <AntdApp>
            <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </StyleProvider>
  )
}

export default App
