import type { ThemeConfig } from 'antd';

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
    colorLink: '#4653dd',
    // colorLinkHover: '#818bed',
    colorLinkHover: '#000000e0',
    linkHoverDecoration: 'underline',
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
    Tabs: {
      verticalItemMargin: '0', // '16px 0 0 0'
    }
  },
}

export {
  prefixCls,
  iconPrefixCls,
  theme
}