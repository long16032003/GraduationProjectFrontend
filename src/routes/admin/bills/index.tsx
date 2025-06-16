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
    path: 'bills',
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import("@/pages/admin/bill/manageBills")).default,
        },
      },
      {
        path: 'checkout/:id',
        lazy: {
          Component: async () => (await import("@/pages/admin/bill/checkout")).default,
        },
      },
    ],
  },
];