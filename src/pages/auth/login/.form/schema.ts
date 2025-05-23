// https://react.formilyjs.org/api/shared/schema
// https://core.formilyjs.org/api/models/field#fieldvalidator

import { createSchemaField, type ISchema } from "@formily/react";
import { createEmailSchema, createPasswordSchema } from '@/utils/form.ts';
import { FormLayout, Input, Password } from "@formily/antd-v5/esm";
import type { LoginFormValues } from "@/types.ts";
import FormItem from "@/components/form/form-item";

export const defaultValues: LoginFormValues = {
  email: '',
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
        // spaceGap: 4,
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
            label: '{{ PasswordLabel() }}',
            // tooltip: 'Password must be at least 8 characters',
          },
        }),
      },
    },
  },
};
