import { createForm } from '@formily/core';
import { createSchemaField, FormProvider, type ISchema } from '@formily/react';
import { FormButtonGroup, FormLayout, Input, Password, Submit } from '@formily/antd-v5/esm';
import FormItem from '@/components/form/form-item';
import { $http } from '@/utils/http.ts';
import { FetchError } from 'ofetch';
import {
  createEmailSchema,
  createPasswordSchema,
  showRemoteValidationErrors,
} from '@/utils/form.ts';
import {
  type OpenNotificationParams,
  type RefineError,
  type SuccessNotificationResponse,
  useGo, useInvalidateAuthStore,
  useLogin,
  useNotification,
} from '@refinedev/core';
import HttpStatusCodes from '@/utils/http-status-codes.ts';

// https://react.formilyjs.org/api/components/schema-field
// https://core.formilyjs.org/api/entry/form-validator-registry
const SchemaField = createSchemaField({
  components: {
    FormLayout,
    FormItem,
    Input,
    Password,
  },
  scope: {
    renderPasswordLabel() {
      return (
        <div className="b-formily-item-label">
          <div className="b-formily-item-label-content flex justify-between w-full">
            <div className="flex items-center flex-row">
              <label>Password</label>
              {/*<span className={`b-formily-item-label-tooltip-icon`}>*/}
              {/*  <Tooltip placement="top" title={'Password must be at least 8 characters'}>*/}
              {/*    <QuestionCircleOutlined />*/}
              {/*  </Tooltip>*/}
              {/*</span>*/}
            </div>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
        </div>
      )
    }
  },
});

// https://core.formilyjs.org/api/models/form
const form = createForm({
  // form current values
  // values: {
  //   email: 'hello',
  //   password: '666666',
  // },
  // // form default values
  // initialValues: {
  //   email: 'example@r0.test',
  //   password: 'any thing more than 8 characters',
  // },
  validateFirst: true,
});

// https://react.formilyjs.org/api/shared/schema
// https://core.formilyjs.org/api/models/field#fieldvalidator
// https://formilyjs.org/guide/advanced/validate
const schema: ISchema = {
  type: 'object',
  properties: {
    layout: {
      type: 'void',
      'x-component': 'FormLayout',
      'x-component-props': {
        // labelCol: 6,
        // wrapperCol: 10,
        layout: 'vertical',
      },
      properties: {
        email: createEmailSchema({
          required: true,
          title: 'Email',
          'x-decorator-props': {
            asterisk: false,
          },
        }),
        password: createPasswordSchema({
          required: true,
          title: 'Password',
          'x-decorator-props': {
            asterisk: false,
            label: '{{ renderPasswordLabel() }}',
            tooltip: 'Password must be at least 8 characters',
          },
        }),
      },
    },
  },
};

type LoginVariables = {
  email: string;
  password: string;
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

const LoginForm = () => {
  const { mutate: login, isLoading } = useLogin<LoginVariables>();
  const invalidateAuthStore = useInvalidateAuthStore();
  const { close, open } = useNotification();
  const go = useGo();

  const handleLogin = (values: LoginVariables) => {
    console.log(values);
    login(values, {
      onSuccess: async ({ success, redirectTo, error, successNotification }) => {
        console.log(error, redirectTo)
        if (success) {
          close?.("login-error");

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
              console.log('FORBIDDEN')
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
    <div>
      <FormProvider form={form}>
        <SchemaField schema={schema} />
        <Submit
          loading={isLoading}
          onSubmit={handleLogin}
          block
        >Submit</Submit>
        <FormButtonGroup>

        </FormButtonGroup>
      </FormProvider>
    </div>
  );
};


export {
  LoginForm,
};