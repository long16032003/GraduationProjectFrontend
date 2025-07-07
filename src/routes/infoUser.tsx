import type { RouteObject } from 'react-router';

export const routes: RouteObject[] = [
  {
    path: '/info-user',
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import("@/pages/auth/info-user")).default,
        },
      },
    ],
  },
];