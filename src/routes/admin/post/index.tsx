import type { RouteObject } from 'react-router';
import queryClient from '@/utils/queryClient.ts';
import { loader as newLoader } from '@/pages/admin/role/new/loader.ts';
import { HydrateFallback } from '@/components/HydrateFallback';

export const routes: RouteObject[] = [
  {
    path: 'posts',
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import("@/pages/admin/posts/managePosts")).default,
        },
      },
      {
        path: 'new',
        // loader: newLoader(queryClient),
        // HydrateFallback: HydrateFallback,
        // lazy: {
        //   Component: async () => (await import("@/pages/admin/tables/new")).default,
        // },
      },
    ],
  },
];