import type { RouteObject } from 'react-router';

export const routes: RouteObject[] = [
  {
    path: 'promotions',
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import("@/pages/admin/promotions/managePromotions")).default,
        },
      },
    ],
  },
];