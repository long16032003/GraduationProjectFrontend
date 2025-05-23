// import { Home } from '@/pages';
import { Root } from '@/components/Root.tsx';
import type { RouteObject } from 'react-router';
import { routes as auth_routes } from '@/routes/auth.tsx';
import { routes as admin_routes } from '@/routes/admin';
// import { HydrateFallback } from '@/components/HydrateFallback.tsx';

// https://reactrouter.com/start/data/custom#3-lazy-loading

export const routes: RouteObject[] = [
  {
    Component: Root,
    // HydrateFallback: HydrateFallback,
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import('@/pages')).Home,
        },
      },
      ...auth_routes,
      ...admin_routes,
    ],
  },
];
