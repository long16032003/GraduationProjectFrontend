// import { Home } from '@/pages';
import { Root } from '@/components/Root.tsx';
import type { RouteObject } from 'react-router';
import { routes as auth_routes } from '@/routes/auth.tsx';
import { routes as admin_routes } from '@/routes/admin';
import { ErrorPage404 } from '@/pages/error';
import { routes as post_routes } from '@/routes/post';
import { routes as reservation_routes } from '@/routes/reservation';
import { routes as menu_routes } from '@/routes/menu';
import { routes as promotion_routes } from '@/routes/promotion';
// import { HydrateFallback } from '@/components/HydrateFallback.tsx';

// https://reactrouter.com/start/data/custom#3-lazy-loading


export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Root,
    // HydrateFallback: HydrateFallback,
    ErrorBoundary: () => <ErrorPage404 />,
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import('@/pages')).Home,
        },
      },
      ...auth_routes,
      ...admin_routes,
      ...post_routes,
      ...reservation_routes,
      ...menu_routes,
      ...promotion_routes,
    ],
  },
];
