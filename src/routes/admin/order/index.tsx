import type { RouteObject } from 'react-router';
import queryClient from '@/utils/queryClient.ts';
import { loader as newLoader } from '@/pages/admin/role/new/loader.ts';
import { HydrateFallback } from '@/components/HydrateFallback';

// https://remix.run/blog/lazy-loading-routes
// https://reactrouter.com/start/data/route-object#lazy
// https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v750
// https://reactrouter.com/start/data/routing#layout-routes

export const routes: RouteObject[] = [
  {
    path: 'order',
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import("@/pages/admin/order/manageOrder.tsx")).default,
        },
      },
      {
        path: 'table/:tableId/new-bill',
        lazy: {
          Component: async () => (await import("@/pages/admin/order/newBill.tsx")).default,
        },
      },
      {
        path: 'bill/:billId/add-order',
        lazy: {
          Component: async () => (await import("@/pages/admin/order/addOrder.tsx")).default,
        },
      },
    ],
  },
  {
    path: 'kitchen',
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import("@/pages/admin/kitchen/kitchenDashboard.tsx")).default,
        },
      },
    ],
  },
];