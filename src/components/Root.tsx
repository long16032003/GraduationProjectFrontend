import { resources } from '@/config/resources';
import { authProvider } from '@/providers/auth-provider.ts';
import { dataProvider } from '@/providers/data-provider.ts';
import { type IRefineOptions, Refine } from '@refinedev/core';
import routerBindings, { UnsavedChangesNotifier } from '@refinedev/react-router';
import { Outlet } from 'react-router';
import { useNotificationProvider } from '@refinedev/antd';
import { notification } from 'antd';
import queryClient from '@/utils/queryClient.ts';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { theme } from '@/config/theme';
import viVN from 'antd/locale/vi_VN';
import { useTranslation } from 'react-i18next';
import '@/utils/i18n'; // Import i18n configuration
import { accessControlProvider } from '@/providers/access-control-provider.ts';
import { SiteSettingsProvider } from '@/providers/SiteSettingsProvider';

const options: IRefineOptions = {
  disableTelemetry: true,
  syncWithLocation: true,
  warnWhenUnsavedChanges: true,
  reactQuery: {
    clientConfig: queryClient,
  },
};

export const Root = () => {
  const { t, i18n } = useTranslation();

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme} locale={viVN}>
        <Refine
          resources={resources}
          options={options}
          routerProvider={routerBindings}
          authProvider={authProvider}
          notificationProvider={useNotificationProvider}
          accessControlProvider={accessControlProvider}
          dataProvider={dataProvider}
          i18nProvider={{
            translate: (key: string, params?: Record<string, unknown>) => t(key, params) as string,
            changeLocale: (lang: string) => i18n.changeLanguage(lang),
            getLocale: () => i18n.language,
          }}
        >
          <SiteSettingsProvider>
            <Outlet />
            <UnsavedChangesNotifier />
          </SiteSettingsProvider>
        </Refine>
      </ConfigProvider>
    </QueryClientProvider>
  );
};
