import { Form } from '@formily/antd-v5/esm';
import type { Form as FormType } from '@formily/core';
import { useLayoutEffect, useMemo, useState } from 'react';
import type { RoleFormValues } from '@/pages/admin/role/types.ts';
import {
  schema as defaultSchema,
  updateSchema,
  SchemaField,
} from '@/pages/admin/role/.form/schema.ts';
import { FormTab } from '@formily/antd-v5/esm';
import type { PermissionsResponse } from '@/types.ts';
import type { ISchema } from '@formily/react';

export interface RoleFormProps {
  values?: RoleFormValues;
  permissions?: PermissionsResponse | undefined,
  form: FormType
}

const RoleForm = (props: RoleFormProps) => {
  const { form, permissions } = props;

  const formTab = useMemo(() => FormTab.createFormTab(), []);

  const [schema, setSchema] = useState(defaultSchema);

  useLayoutEffect(() => {
    if (permissions?.tree) {
      const prevPermissions = form.getValuesIn('permissions'); // Get the permissions field graph
      form.clearFormGraph('permissions'); // Clear the permissions field graph

      //Can be obtained asynchronously
      setSchema(updateSchema(defaultSchema, permissions?.tree || {}) as ISchema);
      // Restore the previous permissions values
      form.setValuesIn('permissions', prevPermissions);
    }
  }, [permissions, form]);

  return (
    <Form
      form={form}
      // layout='vertical'
      labelCol={6}
      wrapperCol={18}
      // layout='horizontal'
      feedbackLayout="terse"
    >
      <SchemaField
        schema={schema as ISchema}
        scope={{ formTab }}
      />
    </Form>
  );
};

export default RoleForm;
