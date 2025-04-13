import { Home } from '@/pages';
import { Root } from '@/components/Root.tsx';
import { RouteObject } from 'react-router';
import { routes as auth_routes } from '@/routes/auth.tsx';
import { Dashboard } from '@/pages/admin';
import { HydrateFallback } from '@/components/HydrateFallback.tsx';

export const routes: RouteObject[] = [
  {
    Component: Root,
    HydrateFallback: HydrateFallback,
    children: [
      { index: true, Component: Home },
      { path: 'dashboard', Component: Dashboard },
      ...auth_routes,
    ],
  },
];
