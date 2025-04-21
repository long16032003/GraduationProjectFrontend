import { createForm } from '@formily/core';
import { createSchemaField, FormProvider, ISchema } from '@formily/react';
import { FormButtonGroup, FormItem, FormLayout, Input, Password, Submit } from '@formily/antd-v5';

// https://react.formilyjs.org/api/components/schema-field
const SchemaField = createSchemaField({
  components: {
    FormLayout,
    FormItem,
    Input,
    Password,
  },
  scope: {

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