import RoleForm from '../.form/RoleForm.tsx';
import { useLayoutEffect, useMemo } from 'react';
import { createForm } from '@formily/core';
import type { RoleFormValues } from '@/pages/admin/role/types.ts';
import collect from 'collect.js';
import { useGo, usePermissions, useShow, useUpdate } from '@refinedev/core';
import type { PermissionsResponse } from '@/types.ts';
import { useParams } from 'react-router';
import { Show } from '@/components/crud/show.tsx';

// https://github.com/shadcn-ui/ui/tree/main/apps/www/registry/default/blocks/login-03
export default function RoleShowPage() {
  const {id} = useParams();
  const go = useGo();
  // const values = defaultValues;
  const { query } = useShow<RoleFormValues>({
    resource: "role",
    id,
  });
  const { data, isLoading } = query;

  const { data: permissions } = usePermissions<PermissionsResponse>();

  const { mutate: updateRole, isLoading: isSubmiting, isSuccess } = useUpdate<RoleFormValues>({
    resource: 'role',
    id
  });

  useLayoutEffect(() => {
    if(isSuccess) {
      go({to: {resource: 'role', action: 'list'}});
    }
  }, [go, isSuccess])

  // https://core.formilyjs.org/api/models/form
  const form = useMemo(() => {
    const permissions = collect(Object.entries(data?.data?.permissions || {}))
      .mapWithKeys(([permission, value]: [string, number]) => {
        // replace all ":" with "@"
        const originPermission = permission.replaceAll(':', '@');
        return [originPermission, value];
      })
      .all() as unknown as Record<string, number>;

    return createForm<RoleFormValues>({
      validateFirst: true,
      initialValues: {
        ...(data?.data || {}),
        permissions: permissions,
      },
    });
  }, [data?.data]);

  return (
    <div className={`mt-4`}>
      <Show
        resource={'role'}
        isLoading={isLoading || isSubmiting}
      >
        <RoleForm form={form} permissions={permissions}/>
      </Show>
    </div>
  );
}
