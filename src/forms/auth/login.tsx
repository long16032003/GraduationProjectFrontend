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
import { useLogin } from "@refinedev/core";
import { redirect } from 'react-router';

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

const LoginForm = () => {
  const { mutate: login, isPending } = useLogin<LoginVariables>();

  const handleLogin = (values: LoginVariables) => {
    console.log(values);
    login(values, {
      onSuccess: (data) => {
        if (data.success) {
          return redirect('/admin')
        }

        const error = data.error as FetchError;

        if (error.statusCode === 422) {
          // 419: Validation error
          showRemoteValidationErrors(form, error);
        }

        //   show notification
      },
    });
  }

  return (
    <div>
      <FormProvider form={form}>
        <SchemaField schema={schema} />
        <Submit
          loading={isPending}
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