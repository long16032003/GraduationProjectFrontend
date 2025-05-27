import { createForm } from '@formily/core';
import { Form, Submit } from '@formily/antd-v5/esm';
import { FetchError } from 'ofetch';
import { showRemoteValidationErrors } from '@/utils/form.ts';
import {
  useNotification,
} from '@refinedev/core';
import HttpStatusCodes from '@/utils/http-status-codes.ts';
import { defaultValues, schema, SchemaField } from '@/pages/auth/register/.form/schema.ts';
import type { RegisterFormValues } from '@/types.ts';
import { buildNotification, useRegister } from '@/hooks/useRegister.ts';

// https://core.formilyjs.org/api/models/form
const form = createForm({
  validateFirst: true,
});

const RegisterForm = () => {
  const { close, open } = useNotification();
  const { mutate, isLoading } = useRegister<RegisterFormValues>({
    onSuccess: async ({ success }) => {
      if (success) {
        form.reset();
      }
    },
    onError: async (error) => {
      if (error instanceof FetchError) {
        if (error.statusCode === HttpStatusCodes.UNPROCESSABLE_ENTITY) {
          close?.("register-error");
          // 422: Validation error
          showRemoteValidationErrors(form, error);
        }
        if (error.statusCode === HttpStatusCodes.FORBIDDEN) {
          // 403: Already logged in
          open?.(
            buildNotification({
              name: 'Register Error',
              message: 'Already logged in',
            }),
          );
        }
      }
    },
  });

  const handleSubmit = (values: RegisterFormValues) => {
    mutate(values);
  };

  return (
    <Form
      form={form}
      layout='vertical'
      feedbackLayout='terse'
      onAutoSubmit={console.log}
      onAutoSubmitFailed={console.log}
    >
      <div className='grid gap-3'>
        <SchemaField schema={schema} />
        <Submit
          loading={isLoading}
          onSubmit={handleSubmit}
          block
        >
          Create an account
        </Submit>
      </div>
    </Form>
  );
};

export default RegisterForm;
