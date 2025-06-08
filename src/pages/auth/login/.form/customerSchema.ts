// https://react.formilyjs.org/api/shared/schema
// https://core.formilyjs.org/api/models/field#fieldvalidator

import { createSchemaField, type ISchema } from "@formily/react";
import { createPasswordSchema } from '@/utils/form.ts';
import { FormLayout, Input, Password, FormItem } from "@formily/antd-v5/esm";
import type { LoginCustomerFormValues } from "@/types.ts";

export const defaultValues: LoginCustomerFormValues = {
  phone: '',
  password: '',
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
});

// https://formilyjs.org/guide/advanced/validate
export const customerSchema: ISchema = {
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
        phone: {
          type: 'string',
          title: 'Số điện thoại',
          required: true,
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          'x-validator': [
            {
              pattern: /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/,
              message: 'Số điện thoại không hợp lệ',
            },
            {
              required: true,
              message: 'Vui lòng nhập số điện thoại',
            },
          ],
          'x-component-props': {
            placeholder: 'Nhập số điện thoại',
            size: 'large',
          },
          'x-decorator-props': {
            asterisk: false,
          },
        },
        password: {
          type: 'string',
          title: 'Mật khẩu',
          required: true,
          'x-decorator': 'FormItem',
          'x-component': 'Password',
          'x-component-props': {
            placeholder: 'Nhập mật khẩu',
            size: 'large',
            visibilityToggle: true,
          },
          'x-validator': [
            {
              required: true,
              message: 'Vui lòng nhập mật khẩu',
            },
          ],
          'x-decorator-props': {
            asterisk: false,
            label: '{{ CustomerPasswordLabel() }}',
          },
        },
      },
    },
  },
}; 