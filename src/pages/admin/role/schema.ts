// https://react.formilyjs.org/api/shared/schema
// https://core.formilyjs.org/api/models/field#fieldvalidator

import type { ISchema } from "@formily/react";
import { createEmailSchema, createPasswordSchema } from '@/utils/form.ts';

export const defaultValues = {
  email: '',
  password: '',
}

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
            label: '{{ renderPasswordLabel() }}',
            // tooltip: 'Password must be at least 8 characters',
          },
        }),
      },
    },
  },
};
