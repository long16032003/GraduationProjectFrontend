import { createForm } from '@formily/core';
import { Form, Submit } from '@formily/antd-v5/esm';
import { FetchError } from 'ofetch';
import { showRemoteValidationErrors } from '@/utils/form.ts';
import {
  useNotification,
} from '@refinedev/core';
import { message } from 'antd';
import HttpStatusCodes from '@/utils/http-status-codes.ts';
import { defaultValues, customerSchema, SchemaField } from './customerSchema.ts';
import type { LoginCustomerFormValues } from '@/types.ts';
import { useCustomerLogin } from '@/hooks/useCustomerLogin.ts';
import CustomerPasswordLabel from './CustomerPasswordLabel.tsx';

const scope = {
  CustomerPasswordLabel,
};

// https://core.formilyjs.org/api/models/form
const form = createForm({
  validateFirst: true,
});

const LoginCustomerForm = () => {
  const { close } = useNotification();
  const { mutate, isLoading } = useCustomerLogin<LoginCustomerFormValues>({
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
            message.error('Bạn đã đăng nhập rồi');
            break;
            
          case HttpStatusCodes.UNAUTHORIZED:
            // 401: Unauthorized
            message.warning('Thông tin đăng nhập không chính xác');
            break;
            
          default:
            // Other errors
            message.error('Có lỗi xảy ra, vui lòng thử lại sau');
        }
      }
    }
  });

  const handleLogin = (values: LoginCustomerFormValues) => {
    mutate(values);
  };

  return (
    <Form
      form={form}
      layout='vertical'
      feedbackLayout='terse'
    >
      <div className='grid gap-4'>
        <SchemaField schema={customerSchema} scope={scope} />
        <Submit
          loading={isLoading}
          onSubmit={handleLogin}
          block
          className="h-10 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md mt-2"
        >
          Đăng nhập
        </Submit>
      </div>
    </Form>
  );
};

export default LoginCustomerForm;
