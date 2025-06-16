import { Admin } from '@/components/layouts/Admin';
import type { RouteObject } from 'react-router';
import { routes as role_routes } from '@/routes/admin/role';
import { routes as tables_routes } from '@/routes/admin/tables';
import { routes as dishcategories_routes } from '@/routes/admin/dishcategories';
import { routes as dish_routes } from '@/routes/admin/dish';
import { routes as reservations_routes } from '@/routes/admin/reservations';
import { routes as post_routes } from '@/routes/admin/post';
import { routes as staff_routes } from '@/routes/admin/staff';
import { routes as promotion_routes } from '@/routes/admin/promotion';
import { routes as bills_routes } from '@/routes/admin/bills';
import { routes as statistic_routes } from '@/routes/admin/statistic';
import { routes as order_routes } from '@/routes/admin/order';
import { routes as warehouse_routes } from '@/routes/admin/warehouse';
import { routes as customer_routes } from '@/routes/admin/customer';
// https://remix.run/blog/lazy-loading-routes
// https://reactrouter.com/start/data/route-object#lazy
// https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v750
// https://reactrouter.com/start/data/routing#layout-routes

export const routes: RouteObject[] = [
  {
    path: 'admin',
    Component: Admin,
    // loader: async () => {
    //   const response = await httpClient('/api/admin/dashboard');
    //   return response;
    // },
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import("@/pages/admin/dashboard.tsx")).DashboardPage,
        },
      },
      ...role_routes,
      ...tables_routes,
      ...dishcategories_routes,
      ...dish_routes,
      ...reservations_routes,
      ...customer_routes,
      ...post_routes,
      ...staff_routes,
      ...promotion_routes,
      ...bills_routes,
      ...statistic_routes,
      ...order_routes,
      ...warehouse_routes,
      {
          path: 'site-settings',
          children: [
            {
              index: true,
              lazy: {
                Component: async () => (await import("@/pages/admin/siteSettings.tsx")).default,
              },
            },
          ],
        },
    ],
  },
];