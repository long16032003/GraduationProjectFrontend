import type { RouteObject } from 'react-router';

export const routes: RouteObject[] = [
  {
    path: '/reservation',
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import("@/pages/reservation/reservationPage")).default,
        },
      },
    ],
  },
];