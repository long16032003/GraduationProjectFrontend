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
  type SuccessNotificationResponse,
  useGo, useInvalidateAuthStore,
  useLogin,
  useNotification,
} from '@refinedev/core';
import HttpStatusCodes from '@/utils/http-status-codes.ts';
import React from 'react';
import type { RoleFormValue } from '@/pages/admin/role/types.ts';
import { defaultValues, schema } from '@/pages/admin/role/schema.ts';

// https://react.formilyjs.org/api/components/schema-field
// https://core.formilyjs.org/api/entry/form-validator-registry
const SchemaField = createSchemaField({
  components: {
    FormLayout,
    FormItem,
    Input,
  },
  scope: {
  },
});

// https://core.formilyjs.org/api/models/form
const form = createForm({
  validateFirst: true,
});

const RoleForm = () => {
  const { mutate, isLoading } = useLogin<RoleFormValue>();
  const invalidateAuthStore = useInvalidateAuthStore();
  const { close, open } = useNotification();
  const go = useGo();

  const handleSubmit = (values: RoleFormValue) => {
    mutate(values, {
      onSuccess: async ({ success, redirectTo, error, successNotification }) => {
        close?.("login-error");
        if (success) {
          form.setValues(defaultValues)
          if (successNotification) {
            open?.(buildSuccessNotification(successNotification));
          }
        }

        if (error || !success) {
          if (error instanceof FetchError) {
            if (error.statusCode === HttpStatusCodes.UNPROCESSABLE_ENTITY) {
              // 422: Validation error
              showRemoteValidationErrors(form, error);
            }
            if (error.statusCode === HttpStatusCodes.FORBIDDEN) {
              // 403: Already logged in
              open?.(buildNotification({
                name: "Login Error",
                message: "Already logged in",
              }));
            }
          } else {
            open?.(buildNotification(error));
          }
        }

        if (success) {
          go({ to: '/admin', type: "replace" });
        }

        setTimeout(() => {
          invalidateAuthStore();
        }, 32);
      },
    });
  }

  return (
    <div className="grid gap-3">
      <Form
        form={form}
        layout="vertical"
        feedbackLayout="terse"
        onAutoSubmit={console.log}
        onAutoSubmitFailed={console.log}
      >
        <SchemaField schema={schema} />
        <Submit
          loading={isLoading}
          onSubmit={handleSubmit}
          block
        >Login</Submit>
      </Form>
    </div>
  );
};

const buildNotification = (
  error?: Error | RefineError,
): OpenNotificationParams => {
  return {
    message: error?.name || "Login Error",
    description: error?.message || "Invalid credentials",
    key: "login-error",
    type: "error",
  };
};

const buildSuccessNotification = (
  successNotification: SuccessNotificationResponse,
): OpenNotificationParams => {
  return {
    message: successNotification.message,
    description: successNotification.description,
    key: "login-success",
    type: "success",
  };
};

export {
  RoleForm,
};