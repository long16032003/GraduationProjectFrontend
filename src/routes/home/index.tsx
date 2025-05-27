import { Admin } from '@/components/layouts/Admin';
import type { RouteObject } from 'react-router';
import { routes as role_routes } from '@/routes/admin/role';
import { routes as tables_routes } from '@/routes/admin/tables';
import { routes as dishcategories_routes } from '@/routes/admin/dishcategories';
import { routes as dish_routes } from '@/routes/admin/dish';
import { routes as reservations_routes } from '@/routes/admin/reservations';
import HomePage from '@/pages/home/home.tsx';
// https://remix.run/blog/lazy-loading-routes
// https://reactrouter.com/start/data/route-object#lazy
// https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v750
// https://reactrouter.com/start/data/routing#layout-routes

export const routes: RouteObject[] = [
  {
    path: 'home',
    Component: HomePage,
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import("@/pages/home/home.tsx")).default,
        },
      },
    ],
  },
];