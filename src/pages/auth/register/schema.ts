// https://react.formilyjs.org/api/shared/schema
// https://core.formilyjs.org/api/models/field#fieldvalidator
// https://formilyjs.org/guide/advanced/validate
import type { ISchema } from '@formily/react';
import { createEmailSchema, createInputSchema, createPasswordSchema } from '@/utils/form.ts';

export const defaultValues = {
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
}

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
          title: 'Full Name',
          maxLength: 255,
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
          title: 'Password',
          minLength: 8,
          maxLength: 64,
          'x-decorator-props': {
            asterisk: false,
            // tooltip: 'Password must be at least 8 characters',
          },
        }),
        password_confirmation: createPasswordSchema({
          required: true,
          title: 'Confirm Password',
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
