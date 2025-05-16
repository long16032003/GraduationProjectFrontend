import type { ResourceProps } from '@refinedev/core';

export const resources: ResourceProps[] = [
  {
    name: 'users',
    list: '/users',
    create: '/users/create',
    show: '/users/:id',
    edit: '/users/:id/edit',
    clone: '/users/:id/clone',
    meta: {
      canDelete: true,
    },
  },
]