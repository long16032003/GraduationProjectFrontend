import type { RouteObject } from 'react-router';

export const routes: RouteObject[] = [
  {
    path: '/history-reservation',
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import("@/pages/historyReservation")).default,
        },
      },
    ],
  },
];