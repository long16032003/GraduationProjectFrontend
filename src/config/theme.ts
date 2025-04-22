import { ThemeConfig } from 'antd';

const prefixCls = 'b'
const iconPrefixCls = 'b-icon'

const theme: ThemeConfig = {
  // https://ant.design/docs/react/css-variables
  cssVar: {
    prefix: prefixCls,
  },
  hashed: false,
  // https://ant.design/docs/react/customize-theme#seedtoken
  token: {
    // https://ant.design/docs/react/customize-theme#disable-motion
    motion: false,
    // Seed Token
    colorPrimary: '#5e6ae4',
    colorTextPlaceholder: '#737373',
    controlHeight: 36,
    // https://www.smashingmagazine.com/2015/11/using-system-ui-fonts-practical-guide/
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
    // borderRadius: 2,

    // Alias Token
    // colorBgContainer: '#f6ffed',
  },
  components: {
    Form: {
      // itemMarginBottom: 24,
    },
  },
}

export {
  prefixCls,
  iconPrefixCls,
  theme
}