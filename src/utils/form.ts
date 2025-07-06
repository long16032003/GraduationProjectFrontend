import type {
  Field,
  FieldFeedbackTriggerTypes,
  FeedbackMessage,
  Form,
  IFieldFeedback,
} from '@formily/core';
import { FetchError } from 'ofetch';
import { defu } from 'defu';
import type { ISchema } from '@formily/react';
import { collect } from 'collect.js';
import HttpStatusCodes from '@/utils/http-status-codes.ts';
import type { RefineError } from '@refinedev/core';

interface ValidationErrors {
  [key: string]: string[];
}

interface ValicationErrorResponse {
  errors: ValidationErrors;
  message: string;
}

const convertValidationErrorsToFeedbacks = (
  error: FetchError,
  triggerType: FieldFeedbackTriggerTypes = 'onInput',
) => {
  const json = error.data as ValicationErrorResponse;

  return collect(Object.entries(json.errors || {})).mapWithKeys(
    ([path, messages]: [string, string[]]) => [
      path,
      {
        messages: messages,
        type: 'error',
        code: 'ValidateError',
        triggerType,
      } as IFieldFeedback,
    ],
  );
};

function showRemoteValidationErrors(
  form: Form,
  error: FetchError,
  triggerType: FieldFeedbackTriggerTypes = 'onInput',
) {
  const json = error.data as ValicationErrorResponse;
  Object.entries(json.errors || {}).forEach(([path, messages]) => {
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

function isValidationError(error: RefineError | Error) {
  return error instanceof FetchError
    && error.statusCode === HttpStatusCodes.UNPROCESSABLE_ENTITY;
}

function isForbiddenError(error: RefineError | Error) {
  return error instanceof FetchError
    && error.statusCode === HttpStatusCodes.FORBIDDEN;
}

function isUnauthorizedError(error: RefineError | Error) {
  return error instanceof FetchError
    && error.statusCode === HttpStatusCodes.UNAUTHORIZED;
}

function isTooManyRequestError(error: RefineError | Error) {
  return error instanceof FetchError
    && error.statusCode === HttpStatusCodes.TOO_MANY_REQUESTS;
}

const defaultSchema: ISchema = {
  type: 'string',
  required: false,
  'x-decorator': 'FormItem',
  'x-decorator-props': {
    // https://antd5.formilyjs.org/components/form-item#formitem-api
    // colon: false,
    feedbackLayout: 'terse',
    labelStyle: {},
    // asterisk: false,
  },
  'x-component': 'Input',
  'x-component-props': {
    // https://ant.design/components/input#input
  },
};

function createInputSchema(props: ISchema) {
  return defu(props, {
    'x-component-props': {
      // https://ant.design/components/input#input
      showCount: true,
      maxLength: 255,
    },
  }, defaultSchema) as ISchema;
}

function createEmailSchema(props: ISchema) {
  return defu(
    props,
    {
      'x-validator': 'email',
      'x-component-props': {
        placeholder: 'user@example.com',
      },
    },
    defaultSchema,
  );
}

function createPasswordSchema(props: ISchema) {
  return defu(
    props,
    {
      'x-component': 'Password',
      'x-component-props': {
        visibilityToggle: true,
      },
    },
    defaultSchema,
  );
}


function createSwitchSchema(props: ISchema) {
  return defu(
    props,
    {
      type: 'boolean',
      // https://ant.design/components/switch#api
      'x-component': 'Switch',
    },
    defaultSchema,
  );
}

function createNumberSchema(props: ISchema) {
  return defu(
    props,
    {
      type: 'number',
      // https://ant.design/components/input-number#api
      'x-component': 'NumberPicker',
      'x-component-props': {
        style: {
          width: 120,
        },
      },
    },
    defaultSchema,
  );
}

function createSelectSchema(props: ISchema) {
  return defu(
    props,
    {
      type: 'string',
      // https://ant.design/components/select#api
      'x-component': 'Select',
      'x-component-props': {
        // style: {
        //   width: 120,
        // },
      },
    },
    defaultSchema,
  );
}

function createMultiSelectSchema(props: ISchema) {
  return defu(
    props,
    {
      type: 'array',
      // https://ant.design/components/select#api
      'x-component': 'Select',
      'x-component-props': {
        mode: 'multiple',
        allowClear: true,
        // style: {
        //   width: 120,
        // },
      },
    },
    defaultSchema,
  );
}


export {
  convertValidationErrorsToFeedbacks,
  showRemoteValidationErrors,
  isValidationError,
  isForbiddenError,
  isUnauthorizedError,
  isTooManyRequestError,
  defaultSchema,
  createInputSchema,
  createEmailSchema,
  createPasswordSchema,
  createSwitchSchema,
  createNumberSchema,
  createSelectSchema,
  createMultiSelectSchema,
};

export type {
  ValidationErrors,
  ValicationErrorResponse
};
