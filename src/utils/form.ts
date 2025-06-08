import type { Field, FieldFeedbackTriggerTypes, FeedbackMessage, Form, IFieldFeedback } from '@formily/core';
import { FetchError } from 'ofetch';
import { defu } from 'defu';
import type { ISchema } from '@formily/react';
import { collect } from 'collect.js';

export interface ValicationErrorJson {
  errors: {
    [key: string]: string[];
  };
  message: string;
}

export const convertValidationErrorsToFeedbacks = (
  error: FetchError,
  triggerType: FieldFeedbackTriggerTypes = 'onInput',
) => {
  const json = error.data as ValicationErrorJson;

  return collect(Object.entries(json.errors || {}))
    .mapWithKeys(([path, messages]: [string, string[]]) => [path, {
      messages: messages,
      type: 'error',
      code: 'ValidateError',
      triggerType,
    } as IFieldFeedback])
};

export function showRemoteValidationErrors(
  form: Form,
  error: FetchError,
  triggerType: FieldFeedbackTriggerTypes = 'onInput',
) {
  const json = error.data as ValicationErrorJson;
  Object.entries(json.errors || {})
    .forEach(([path, messages]) => {
    const field = form.query(path).take();

    if (!field) return;
    (field as Field).setFeedback({
      messages: messages as FeedbackMessage,
      type: 'error',
      code: 'ValidateError',
      triggerType,
    } as IFieldFeedback);
  });
}

export const defaultSchema: ISchema = {
  type: 'string',
  required: false,
  'x-decorator': 'FormItem',
  'x-decorator-props': {
    // https://antd5.formilyjs.org/components/form-item#formitem-api
    colon: false,
    feedbackLayout: 'terse',
    labelStyle: {}
    // asterisk: false,
  },
  'x-component': 'Input',
  'x-component-props': {
    // https://ant.design/components/input#input
  },
}

export function createInputSchema(props: ISchema) {
  return defu(props, defaultSchema) as ISchema;
}

export function createEmailSchema(props: ISchema) {
  return defu(props, {
    'x-validator': 'email',
    'x-component-props': {
      placeholder: 'user@example.com'
    },
  }, defaultSchema)
}

export function createPasswordSchema(props: ISchema) {
  return defu(props, {
    'x-component': 'Password',
    'x-component-props': {
      visibilityToggle: true,
    },
  }, defaultSchema)
}
