import type { RouteObject } from 'react-router';
import queryClient from '@/utils/queryClient.ts';
import { loader as newLoader } from '@/pages/admin/role/new/loader.ts';
import { HydrateFallback } from '@/components/HydrateFallback';

export const routes: RouteObject[] = [
  {
    path: 'staffs',
    children: [
      {
        index: true,
        lazy: { 
          Component: async () => (await import("@/pages/admin/staffs/manageStaffs")).default,
        },
      },
    ],
  },
];