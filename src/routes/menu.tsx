import type { RouteObject } from 'react-router';

export const routes: RouteObject[] = [
  {
    path: '/menu',
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import("@/pages/menuPage")).default,
        },
      },
    ],
  },
];