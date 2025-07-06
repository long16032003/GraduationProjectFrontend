import type { ResourceProps } from '@refinedev/core';

// https://refine.dev/docs/core/refine-component/#resources
export const resources: ResourceProps[] = [
  {
    name: 'role',
    list: 'admin/role',
    create: 'admin/role/new',
    edit: 'admin/role/:id',
    show: 'admin/role/:id/show',
    clone: 'admin/role/:id/clone',
    meta: {
      parent: 'dashboard',
      label: 'Role',
      canDelete: true,
    },
  },
]