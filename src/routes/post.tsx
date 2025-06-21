import type { RouteObject } from 'react-router';

export const routes: RouteObject[] = [
  {
    path: '/posts',
    children: [
      {
        index: true,
        lazy: {
          Component: async () => (await import("@/pages/post/post")).default,
        },
      },
      {
        path: 'create',
        lazy: {
          Component: async () => (await import("@/pages/post/create-post")).default,
        },
      },
      {
        path: 'edit/:id',
        lazy: {
          Component: async () => (await import("@/pages/post/edit-post")).default,
        },
      },
      {
        path: ':id',
        lazy: {
          Component: async () => (await import("@/pages/post/post-detail")).default,
        },
      },
    ],
  },
];