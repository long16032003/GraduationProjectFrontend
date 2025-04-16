// import { Home } from '@/pages';
import { Root } from '@/components/Root.tsx';
import { RouteObject } from 'react-router';
import { routes as auth_routes } from '@/routes/auth.tsx';
import { routes as admin_routes } from '@/routes/admin';
// import { HydrateFallback } from '@/components/HydrateFallback.tsx';
// import { Dashboard } from '@/pages/admin/dashboard.tsx';

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
