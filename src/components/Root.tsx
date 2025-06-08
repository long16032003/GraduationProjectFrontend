import { resources } from '@/config/resources';
import { authProvider } from '@/providers/auth-provider.ts';
import { dataProvider } from '@/providers/data-provider.ts';
import { type IRefineOptions, Refine } from '@refinedev/core';
import routerBindings, { UnsavedChangesNotifier } from '@refinedev/react-router';
import { Outlet } from 'react-router';
import { useNotificationProvider } from '@refinedev/antd';
import queryClient from '@/utils/queryClient.ts';
import { ConfigProvider } from 'antd';
import { theme } from '@/config/theme';
// import { accessControlProvider } from '@/providers/access-control-provider.ts';

const options: IRefineOptions = {
  disableTelemetry: true,
  syncWithLocation: true,
  warnWhenUnsavedChanges: true,
  reactQuery: {
    clientConfig: queryClient,
  },
};

export const Root = () => {
  return (
    <ConfigProvider theme={theme}>
      <Refine
        resources={resources}
        options={options}
        routerProvider={routerBindings}
        authProvider={authProvider}
        notificationProvider={useNotificationProvider}
        // accessControlProvider={accessControlProvider}
        dataProvider={dataProvider}
      >
        <Outlet />
        <UnsavedChangesNotifier />
      </Refine>
    </ConfigProvider>
  );
};
