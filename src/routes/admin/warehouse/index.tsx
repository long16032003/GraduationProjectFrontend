import { Outlet, type RouteObject } from 'react-router';
import queryClient from '@/utils/queryClient.ts';
import { loader as newLoader } from '@/pages/admin/role/new/loader.ts';
import { HydrateFallback } from '@/components/HydrateFallback';
import NewImportWarehouse from '@/pages/admin/warehouse/newImportWarehouse';

// https://remix.run/blog/lazy-loading-routes
// https://reactrouter.com/start/data/route-object#lazy
// https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v750
// https://reactrouter.com/start/data/routing#layout-routes

export const routes: RouteObject[] = [
  {
    path: 'warehouse',
    children: [
      {
        index: true,
        // lazy: {
        //   Component: async () => (await import("@/pages/admin/tables/manageTables")).default,
        // },
      },
      {
        path: 'inventory',
        lazy: {
          Component: async () => (await import("@/pages/admin/warehouse/inventory")).default,
        },
      },
      {
        path: 'ingredient',
        lazy: {
          Component: async () => (await import("@/pages/admin/warehouse/manageIngredient")).default,
        },
      },
      {
        path: 'import',
        Component: Outlet,
        children: [
          {
            index: true,
            lazy: {
              Component: async () => (await import("@/pages/admin/warehouse/manageImportWarehouse")).default,
            },
          },
          {
            path: 'new',
            lazy: {
              Component: async () => (await import("@/pages/admin/warehouse/newImportWarehouse")).default,
            },
          },
        ],
      },
      {
        path: 'export',
        lazy: {
          Component: async () => (await import("@/pages/admin/warehouse/manageExportWarehouse")).default,
        },
      },
    ],
  },
];