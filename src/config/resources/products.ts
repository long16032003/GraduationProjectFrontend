import type { ResourceProps } from '@refinedev/core';

export const resources: ResourceProps[] = [
  {
    name: 'products',
    list: '/products',
    create: '/products/create',
    show: '/products/:id',
    edit: '/products/:id/edit',
    clone: '/products/:id/clone',
    meta: {
      canDelete: true,
    },
  },
]