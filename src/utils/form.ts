import { FeedbackMessage, Field, FieldFeedbackTriggerTypes, Form } from '@formily/core';
import { FetchError } from 'ofetch';

export interface ValicationErrorJson {
  errors: {
    [key: string]: string[];
  };
  message: string;
}

export function showRemoteValidationErrors(
  form: Form,
  error: FetchError,
  triggerType: FieldFeedbackTriggerTypes = 'onInput',
) {
  const json = error.data as ValicationErrorJson;
  Object.entries(json.errors || {})
    .forEach(([path, messages]) => {
    const field = form.query(path as string).take();

    if (!field) return;
    (field as Field).setFeedback({
      messages: messages as FeedbackMessage,
      type: 'error',
      code: 'ValidateError',
      triggerType,
    });
  });
}