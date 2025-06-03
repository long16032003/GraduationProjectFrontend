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
    // Font family
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    
    // Colors
    colorPrimary: '#ea580c', // orange-600
    colorSuccess: '#10b981', // emerald-500
    colorWarning: '#f59e0b', // amber-500
    colorError: '#ef4444',   // red-500
    colorInfo: '#3b82f6',    // blue-500

    // colorText: '#ea580c',

    colorLink: '#ea580c',
    
    // Text colors
    colorTextBase: '#374151',     // gray-700
    colorTextSecondary: '#6b7280', // gray-500
    colorTextTertiary: '#9ca3af',  // gray-400
    
    // Background colors
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#FFFAE9',      // gray-100
    colorBgSpotlight: '#f9fafb',   // gray-50
    
    // Border colors
    colorBorder: '#e5e7eb',        // gray-200
    colorBorderSecondary: '#f3f4f6', // gray-100

    // Border radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,
    
    // Shadows
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    
    // Component specific
    // Button
    controlHeight: 36,
    controlHeightLG: 42,
    controlHeightSM: 30,
    
    // Input
    controlPaddingHorizontal: 12,
    
    // Animation
    motionDurationMid: '0.2s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

    margin: 16,
    marginLG: 16,

  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 36,
      paddingContentHorizontal: 16,
      paddingInline: 16,
    },
    Card: {
      borderRadiusLG: 8,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },
    Menu: {
      itemBorderRadius: 6,
      itemHeight: 40,
      itemHoverBg: '#fff7ed', // orange-50
      itemSelectedBg: '#ffedd5', // orange-100
    },
    Input: {
      borderRadius: 6,
      controlHeight: 36,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 36,
    },
    Modal: {
      borderRadius: 8,
      paddingContentHorizontalLG: 24,
    },
    Table: {
      borderRadius: 8,
      headerBg: '#f9fafb', // gray-50
      headerColor: '#374151', // gray-700
      rowHoverBg: '#fff7ed', // orange-50
    },
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 48,
      siderBg: '#ffffff',
    }
  },
}

export {
  prefixCls,
  iconPrefixCls,
  theme
}