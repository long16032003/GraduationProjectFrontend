import { createForm } from '@formily/core';
import { Form, Submit } from '@formily/antd-v5/esm';
import { FetchError } from 'ofetch';
import {
  showRemoteValidationErrors,
} from '@/utils/form.ts';
import {
  type OpenNotificationParams,
  type RefineError,
  type SuccessNotificationResponse,
  useGo, useInvalidateAuthStore,
  useNotification,
} from '@refinedev/core';
import HttpStatusCodes from '@/utils/http-status-codes.ts';
import { defaultValues, schema, SchemaField } from '@/pages/auth/register/.form/schema.ts';
import type { RegisterFormValues } from '@/types.ts';
import { useRegister } from '@/hooks/useRegister.ts';


// https://core.formilyjs.org/api/models/form
const form = createForm({
  validateFirst: true,
});

const RegisterForm = () => {
  const { mutate, isLoading } = useRegister<RegisterFormValues>();
  const invalidateAuthStore = useInvalidateAuthStore();
  const { close, open } = useNotification();
  const go = useGo();

  const handleSubmit = (values: RegisterFormValues) => {
    console.log(values);
    mutate(values, {
      onSuccess: async ({ success, redirectTo, error, successNotification }) => {
        close?.("register-error");
        if (success) {
          if (successNotification) {
            open?.(buildSuccessNotification(successNotification));
          }

          await invalidateAuthStore();
          form.setValues(defaultValues)
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
                name: "Register Error",
                message: "Already logged in",
              }));
            }
          } else {
            open?.(buildNotification(error));
          }
        }

        if (success) {
          go({ to: '/login', type: "replace" });
        }
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
          >Create an account</Submit>
      </Form>
    </div>
  );
};

const buildNotification = (
  error?: Error | RefineError,
): OpenNotificationParams => {
  return {
    message: error?.name || "Register Error",
    description: error?.message || "Invalid credentials",
    key: "register-error",
    type: "error",
  };
};

const buildSuccessNotification = (
  successNotification: SuccessNotificationResponse,
): OpenNotificationParams => {
  return {
    message: successNotification.message,
    description: successNotification.description,
    key: "register-success",
    type: "success",
  };
};


export default RegisterForm;