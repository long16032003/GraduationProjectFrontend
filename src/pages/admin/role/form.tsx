import { createForm } from '@formily/core';
import { createSchemaField, FormProvider } from '@formily/react';
import { Form, FormLayout, Input, Password, Submit } from '@formily/antd-v5/esm';
import FormItem from '@/components/form/form-item';
import { FetchError } from 'ofetch';
import {
  showRemoteValidationErrors,
} from '@/utils/form.ts';
import {
  Link,
  type OpenNotificationParams,
  type RefineError,
  type SuccessNotificationResponse, useCreate,
  useGo, useInvalidateAuthStore, useList,
  useLogin,
  useNotification, usePermissions,
} from '@refinedev/core';
import HttpStatusCodes from '@/utils/http-status-codes.ts';
import React, { useMemo } from 'react';
import type { RoleFormValues } from '@/pages/admin/role/types.ts';
import { defaultValues, schema as defaultSchema, updateSchema, SchemaField } from '@/pages/admin/role/schema.ts';
import { Checkbox, FormButtonGroup, FormTab, Reset } from '@formily/antd-v5';
import type { PermissionsResponse, PermissionsTree } from '@/types';


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
        <SchemaField schema={schema} scope={{ formTab }} />
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

export {
  RoleForm,
};