import { createForm } from '@formily/core';
import { createSchemaField, FormProvider, ISchema } from '@formily/react';
import { FormButtonGroup, FormLayout, Input, Password, Submit } from '@formily/antd-v5';
import FormItem from '@/components/form/form-item';

// https://react.formilyjs.org/api/components/schema-field
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

const form = createForm({
  // form current values
  values: {
    email: 'hello',
    password: '666666',
  },
  // form default values
  initialValues: {
    email: 'example@r0.test',
    password: 'any thing more than 8 characters',
  },
  validateFirst: true,
});

const schema: ISchema = {
  type: 'object',
  properties: {
    layout: {
      type: 'void',
      'x-component': 'FormLayout',
      'x-component-props': {
        labelCol: 6,
        wrapperCol: 10,
        layout: 'vertical',
      },
      properties: {
        email: {
          type: 'string',
          title: 'Email',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            colon: false,
            asterisk: false,
          },
          'x-component': 'Input',
          required: true,
          'x-component-props': {
            // https://ant.design/components/input#input
          },
        },
        password: {
          type: 'string',
          title: 'Password',
          required: true,
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            colon: false,
            asterisk: false,
            label: '{{ renderPasswordLabel() }}',
            tooltip: 'Password must be at least 8 characters',
          },
          'x-component': 'Password',
          'x-component-props': {
            // https://ant.design/components/input#inputpassword
            visibilityToggle: true,
          },
        },
      },
    },
  },
};

const LoginForm = () => {

  return (
    <FormProvider form={form}>
      <SchemaField schema={schema} />
      <Submit
        onSubmit={(values) => {
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              console.log(values);
              resolve();
            }, 2000);
          });
        }}
        onSubmitFailed={console.log}
        block
      >Submit</Submit>
      <FormButtonGroup>

      </FormButtonGroup>
    </FormProvider>
  );
};


export {
  LoginForm,
};