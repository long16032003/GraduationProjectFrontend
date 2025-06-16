// https://react.formilyjs.org/api/shared/schema
// https://core.formilyjs.org/api/models/field#fieldvalidator
// https://formilyjs.org/guide/advanced/validate
import { createSchemaField, type ISchema } from '@formily/react';
import { createEmailSchema, createInputSchema, createPasswordSchema } from '@/utils/form.ts';
import type { RegisterFormValues } from '@/types.ts';
import { FormItem, FormLayout, Input, Password } from '@formily/antd-v5/esm';

export const defaultValues: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
}

// https://react.formilyjs.org/api/components/schema-field
// https://core.formilyjs.org/api/entry/form-validator-registry
export const SchemaField = createSchemaField({
  components: {
    FormLayout,
    FormItem,
    Input,
    Password,
  },
  scope: {
    //
  },
});

export const schema: ISchema = {
  type: 'object',
  properties: {
    layout: {
      // https://github.com/formilyjs/antd/blob/master/packages/components/src/form-layout/index.tsx
      type: 'void',
      'x-component': 'FormLayout',
      'x-component-props': {
        layout: 'vertical',
        feedbackLayout: 'terse',
      },
      properties: {
        name: createInputSchema({
          required: true,
          title: 'Họ và tên',
          maxLength: 255,
          'x-decorator-props': {
            asterisk: false,
          },
        }),
        phone: createInputSchema({
          required: true,
          title: 'Số điện thoại',
          'x-decorator-props': {
            asterisk: false,
          },
        }),
        email: createEmailSchema({
          required: true,
          title: 'Email',
          'x-decorator-props': {
            asterisk: false,
          },
        }),
        password: createPasswordSchema({
          required: true,
          title: 'Mật khẩu',
          minLength: 8,
          maxLength: 64,
          'x-decorator-props': {
            asterisk: false,
            // tooltip: 'Password must be at least 8 characters',
          },
        }),
        password_confirmation: createPasswordSchema({
          required: true,
          title: 'Xác nhận mật khẩu',
          maxLength: 64,
          'x-reactions': [
            {
              dependencies: ['.password'],
              fulfill: {
                state: {
                  selfErrors:
                    '{{$deps[0] && $self.value && $self.value !== $deps[0] ? "The password does not match" : ""}}',
                },
              },
            },
          ],
          'x-decorator-props': {
            asterisk: false,
            // tooltip: 'Password must be at least 8 characters',
          },
        }),
      },
    },
  },
};
