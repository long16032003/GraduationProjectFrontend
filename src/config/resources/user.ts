import type { ResourceProps } from '@refinedev/core';

// https://refine.dev/docs/core/refine-component/#resources
export const resources: ResourceProps[] = [
  {
    name: 'user',
    list: 'admin/user',
    create: 'admin/user/new',
    edit: 'admin/user/:id',
    show: 'admin/user/:id/show',
    clone: 'admin/user/:id/clone',
    meta: {
      parent: 'dashboard',
      label: 'User',
      canDelete: true,
    },
  },
]