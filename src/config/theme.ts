import { ThemeConfig } from 'antd';

const prefixCls = 'b'
const iconPrefixCls = 'b-icon'

const theme: ThemeConfig = {
  // https://ant.design/docs/react/css-variables
  cssVar: {
    prefix: prefixCls,
  },
  hashed: false,
  token: {
    // https://ant.design/docs/react/customize-theme#disable-motion
    motion: false,
    // Seed Token
    colorPrimary: '#5e6ae4',
    // borderRadius: 2,

    // Alias Token
    // colorBgContainer: '#f6ffed',
  },
}

export {
  prefixCls,
  iconPrefixCls,
  theme
}