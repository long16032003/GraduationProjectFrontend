import { ResourceProps } from '@refinedev/core';

export const resources: ResourceProps[] = [
  {
    name: 'collections',
    list: '/collections',
    create: '/collections/create',
    show: '/collections/:id',
    edit: '/collections/:id/edit',
    clone: '/collections/:id/clone',
    meta: {
      canDelete: true,
    },
  },
]