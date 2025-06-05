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
        close?.("login-error");
        
        switch (error.statusCode) {
          case HttpStatusCodes.UNPROCESSABLE_ENTITY:
            // 422: Validation error
            showRemoteValidationErrors(form, error);
            break;
            
          case HttpStatusCodes.FORBIDDEN:
            // 403: Already logged in
            open?.(
              buildNotification({
                type: 'error',
                name: 'Lỗi đăng nhập',
                message: 'Bạn đã đăng nhập rồi',
              }),
            );
            break;
            
          case HttpStatusCodes.UNAUTHORIZED:
            // 401: Unauthorized
            open?.(
              buildNotification({
                type: 'warning',
                name: 'Phiên đăng nhập hết hạn',
                message: 'Vui lòng đăng nhập lại',
              }),
            );
            break;
            
          default:
            // Other errors
            open?.(
              buildNotification({
                type: 'error',
                name: 'Lỗi đăng nhập',
                message: 'Có lỗi xảy ra, vui lòng thử lại sau',
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
          Đăng nhập
        </Submit>
      </div>
    </Form>
  );
};

export default LoginForm;
