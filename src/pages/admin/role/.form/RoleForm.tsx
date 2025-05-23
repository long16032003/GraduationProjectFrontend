import { createForm } from '@formily/core';
import { Form, Submit } from '@formily/antd-v5/esm';
import {
  type OpenNotificationParams,
  type RefineError,
  type SuccessNotificationResponse, useCreate,
  useGo, 
  useNotification, usePermissions,
} from '@refinedev/core';
import { useMemo } from 'react';
import type { RoleFormValues } from '@/pages/admin/role/types.ts';
import { schema as defaultSchema, updateSchema, SchemaField } from '@/pages/admin/role/.form/schema.ts';
import { FormButtonGroup, FormTab, Reset } from '@formily/antd-v5/esm';
import type { PermissionsResponse } from '@/types.ts';
import type { ISchema, Schema } from '@formily/react';


// https://core.formilyjs.org/api/models/form
const form = createForm({
  validateFirst: true,
});
const formTab = FormTab.createFormTab();

const RoleForm = () => {
  const { mutate, isLoading: isSubmiting } = useCreate<RoleFormValues>({
    resource: 'role',
  });
  const { close, open } = useNotification();
  const go = useGo();

  const { data, isLoading } = usePermissions<PermissionsResponse>();

  const schema = useMemo(() => {
    if (!data?.tree) {
      return defaultSchema;
    }
    return updateSchema(defaultSchema, data?.tree);
  }, [data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleSubmit = (values: RoleFormValues) => {
    mutate({
      values: values,
    }, {
      // onSuccess: async ({ success, redirectTo, error, successNotification }) => {
      //   // close?.("login-error");
      //   // if (success) {
      //   //   form.setValues(defaultValues)
      //   //   if (successNotification) {
      //   //     open?.(buildSuccessNotification(successNotification));
      //   //   }
      //   // }
      //   //
      //   // if (error || !success) {
      //   //   if (error instanceof FetchError) {
      //   //     if (error.statusCode === HttpStatusCodes.UNPROCESSABLE_ENTITY) {
      //   //       // 422: Validation error
      //   //       showRemoteValidationErrors(form, error);
      //   //     }
      //   //     if (error.statusCode === HttpStatusCodes.FORBIDDEN) {
      //   //       // 403: Already logged in
      //   //       open?.(buildNotification({
      //   //         name: "Login Error",
      //   //         message: "Already logged in",
      //   //       }));
      //   //     }
      //   //   } else {
      //   //     open?.(buildNotification(error));
      //   //   }
      //   // }
      //   //
      //   // if (success) {
      //   //   go({ to: '/admin', type: "replace" });
      //   // }
      // },
    });
  };

  return (
    <div className="grid gap-3">
      <Form
        form={form}
        layout="vertical"
        feedbackLayout="terse"
        onAutoSubmit={console.log}
        onAutoSubmitFailed={console.log}
        className="max-w-screen-sm"
      >
        <SchemaField schema={schema as ISchema} scope={{ formTab }} />
        <FormButtonGroup.Sticky align="center">
          <FormButtonGroup>
            <Reset>Reset</Reset>
            <Submit
              loading={isSubmiting}
              onSubmit={handleSubmit}
              block
            >Create</Submit>
          </FormButtonGroup>
        </FormButtonGroup.Sticky>
      </Form>
    </div>
  );
};

const buildNotification = (
  error?: Error | RefineError,
): OpenNotificationParams => {
  return {
    message: error?.name || 'Login Error',
    description: error?.message || 'Invalid credentials',
    key: 'login-error',
    type: 'error',
  };
};

const buildSuccessNotification = (
  successNotification: SuccessNotificationResponse,
): OpenNotificationParams => {
  return {
    message: successNotification.message,
    description: successNotification.description,
    key: 'login-success',
    type: 'success',
  };
};

export default RoleForm;