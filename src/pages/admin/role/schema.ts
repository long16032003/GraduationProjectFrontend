// https://react.formilyjs.org/api/shared/schema
// https://core.formilyjs.org/api/models/field#fieldvalidator

import type { ISchema } from "@formily/react";
import { createEmailSchema, createInputSchema, createPasswordSchema } from '@/utils/form.ts';

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
        name: createInputSchema({
          required: true,
          title: 'Name',
          maxLength: 255,
        }),
        permissions: {
          type: 'array',
          title: 'Permissions',
          'x-component': 'ArrayItems',
          'x-decorator': 'FormItem',
        },
      },
    },
  },
};
