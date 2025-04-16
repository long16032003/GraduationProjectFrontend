import { Admin } from '@/components/layouts/Admin';
import { RouteObject } from 'react-router';

// https://remix.run/blog/lazy-loading-routes
// https://reactrouter.com/start/data/route-object#lazy
// https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v750
// https://reactrouter.com/start/data/routing#layout-routes

export const routes: RouteObject[] = [
  {
    path: 'admin',
    Component: Admin,
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import("@/pages/admin/dashboard.tsx")).DashboardPage,
        },
      },
    ],
  },
];