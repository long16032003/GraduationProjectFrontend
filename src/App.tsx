// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { Button, ConfigProvider, Space } from 'antd';
import { iconPrefixCls, prefixCls, theme } from '@/config/theme';
import { Refine } from "@refinedev/core";
import { dataProvider } from '@/providers/data-provider';

function App() {

  return (
    <Refine dataProvider={dataProvider}>
      <ConfigProvider prefixCls={prefixCls} iconPrefixCls={iconPrefixCls} theme={theme}>
        <Space>
          <Button type="primary">Primary</Button>
          <Button>Default</Button>
        </Space>
      </ConfigProvider>
    </Refine>
  )
}

export default App
