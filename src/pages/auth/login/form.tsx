import { createForm } from '@formily/core';
import { Form, Submit } from '@formily/antd-v5/esm';
import { FetchError } from 'ofetch';
import { showRemoteValidationErrors } from '@/utils/form.ts';
import {
  Link,
  type OpenNotificationParams,
  type RefineError,
  type SuccessNotificationResponse,
  useGo,
  useInvalidateAuthStore,
  useNotification,
} from '@refinedev/core';
import HttpStatusCodes from '@/utils/http-status-codes.ts';
import { defaultValues, schema, SchemaField } from '@/pages/auth/login/schema.ts';
import type { LoginFormValues } from '@/types.ts';
import { useLogin } from '@/hooks/useLogin';

const PasswordLabel = () => {
  return (
    <div className='b-formily-item-label'>
      <div className='b-formily-item-label-content flex justify-between w-full'>
        <div className='flex items-center flex-row'>
          <label>Password</label>
          {/*<span className={`b-formily-item-label-tooltip-icon`}>*/}
          {/*  <Tooltip placement="top" title={'Password must be at least 8 characters'}>*/}
          {/*    <QuestionCircleOutlined />*/}
          {/*  </Tooltip>*/}
          {/*</span>*/}
        </div>
        <Link
          className='ml-auto text-sm underline-offset-4 hover:underline'
          to='/forgot-password'
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
};

// https://core.formilyjs.org/api/models/form
const form = createForm({
  validateFirst: true,
});

const LoginForm = () => {
  const { mutate, isLoading } = useLogin<LoginFormValues>();
  const invalidateAuthStore = useInvalidateAuthStore();
  const { close, open } = useNotification();
  const go = useGo();

  const handleLogin = (values: LoginFormValues) => {
    mutate(values, {
      onSuccess: async ({ success, redirectTo, error, successNotification }) => {
        close?.('login-error');
        if (success) {
          form.setValues(defaultValues);
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
              open?.(
                buildNotification({
                  name: 'Login Error',
                  message: 'Already logged in',
                }),
              );
            }
          } else {
            open?.(buildNotification(error));
          }
        }

        if (success) {
          go({ to: '/admin', type: 'replace' });
        }

        setTimeout(() => {
          invalidateAuthStore();
        }, 32);
      },
    });
  };

  return (
    <div className='grid gap-3'>
      <Form
        form={form}
        layout='vertical'
        feedbackLayout='terse'
        onAutoSubmit={console.log}
        onAutoSubmitFailed={console.log}
      >
        <SchemaField
          schema={schema}
          scope={{ PasswordLabel }}
        />
        <Submit
          loading={isLoading}
          onSubmit={handleLogin}
          block
        >
          Login
        </Submit>
      </Form>
    </div>
  );
};

const buildNotification = (error?: Error | RefineError): OpenNotificationParams => {
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

export { LoginForm };
