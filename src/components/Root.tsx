import { resources } from '@/config/resources';
// import { authProvider } from '@/providers/authProvider';
import { dataProvider } from '@/providers/data-provider.ts';
import { type IRefineOptions, Refine } from '@refinedev/core';
import routerBindings, { UnsavedChangesNotifier } from '@refinedev/react-router';
import { Outlet } from 'react-router';
import { iconPrefixCls, prefixCls, theme } from '@/config/theme.ts';
import { ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
// import { accessControlProvider } from '@/providers/access-control-provider.ts';

const options: IRefineOptions = {
  disableTelemetry: true,
  syncWithLocation: true,
  warnWhenUnsavedChanges: true,
};

export const Root = () => {
  return (
    <Refine
      resources={resources}
      options={options}
      routerProvider={routerBindings}
      // authProvider={authProvider}
      // accessControlProvider={accessControlProvider}
      dataProvider={dataProvider}
    >
      <StyleProvider layer>
        <ConfigProvider prefixCls={prefixCls} iconPrefixCls={iconPrefixCls} theme={theme}>
          <Outlet />
        </ConfigProvider>
      </StyleProvider>
      <UnsavedChangesNotifier />
    </Refine>
  );
};
