import { createForm } from '@formily/core';
import { Form, Submit } from '@formily/antd-v5/esm';
import { FetchError } from 'ofetch';
import { showRemoteValidationErrors } from '@/utils/form.ts';
import {
  useNotification,
} from '@refinedev/core';
import HttpStatusCodes from '@/utils/http-status-codes.ts';
import { defaultValues, schema, SchemaField } from '@/pages/auth/login/.form/schema.ts';
import type { LoginFormValues } from '@/types.ts';
import { buildNotification, useLogin } from '@/hooks/useLogin.ts';
import PasswordLabel from './PasswordLabel.tsx';


const scope = {
  PasswordLabel,
};

// https://core.formilyjs.org/api/models/form
const form = createForm({
  validateFirst: true,
});

const LoginForm = () => {
  const { close, open } = useNotification();
  const { mutate, isLoading } = useLogin<LoginFormValues>({
    onSuccess: async ({ success }) => {
      if (success) {
        form.setValues(defaultValues);
      }
    },
    onError: async (error) => {
      if (error instanceof FetchError) {
        if (error.statusCode === HttpStatusCodes.UNPROCESSABLE_ENTITY) {
          close?.("login-error");
          // 422: Validation error
          showRemoteValidationErrors(form, error);
        }
        if (error.statusCode === HttpStatusCodes.FORBIDDEN) {
          // 403: Already logged in
          open?.(
            buildNotification({
              name: 'Login Error',
              message: 'Already logged in',
            }),
          );
        }
      }
    }
  });

  const handleLogin = (values: LoginFormValues) => {
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
        <SchemaField schema={schema} scope={scope} />
        <Submit
          loading={isLoading}
          onSubmit={handleLogin}
          block
        >
          Login
        </Submit>
      </div>
    </Form>
  );
};

export default LoginForm;
