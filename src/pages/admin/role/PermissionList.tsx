import React, { useState } from 'react';
import {
  FormTab,
  FormItem,
  Input,
  FormButtonGroup,
  Submit,
  Checkbox,
  Form,
  ArrayTabs,
} from '@formily/antd-v5'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField, type ISchema } from '@formily/react'
import { Button } from 'antd'
import { useList } from '@refinedev/core';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormTab,
    Checkbox,
    ArrayTabs,
    Input,
  },
})

const form = createForm()
const formTab = FormTab.createFormTab()

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Name',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      required: true,
    },
    permissions: {  // Thêm trường permissions để chứa tất cả các checkbox
      type: 'object',
      title: 'Permissions',
      'x-component': 'FormItem',
      properties: {
        collapse: {
          type: 'void',
          'x-component': 'FormTab',
          'x-component-props': {
            formTab: '{{formTab}}',
            tabPosition: 'left',
          },
          properties: {
            tab1: {
              type: 'void',
              'x-component': 'FormTab.TabPane',
              'x-component-props': {
                tab: 'A1',
              },
              properties: {
                aaa: {
                  type: 'boolean',
                  'x-decorator': 'FormItem',
                  'x-component': 'Checkbox',
                  'x-content': 'AAA',
                  'x-decorator-props': {
                    feedbackLayout: 'none',
                  }
                },
                ddd: {
                  type: 'boolean',
                  'x-decorator': 'FormItem',
                  'x-component': 'Checkbox',
                  'x-content': 'ddd',
                  'x-decorator-props': {
                    feedbackLayout: 'none',
                  }
                },
              },
            },
            tab2: {
              type: 'void',
              'x-component': 'FormTab.TabPane',
              'x-component-props': {
                tab: 'A2',
              },
              properties: {
                bbb: {
                  type: 'boolean',
                  'x-decorator': 'FormItem',
                  'x-component': 'Checkbox',
                  'x-content': 'Nội dung checkbox B',
                  'x-decorator-props': {
                    feedbackLayout: 'none',
                  }
                },
              },
            },
            tab3: {
              type: 'void',
              'x-component': 'FormTab.TabPane',
              'x-component-props': {
                tab: 'A3',
              },
              properties: {
                ccc: {
                  type: 'boolean',
                  'x-decorator': 'FormItem',
                  'x-component': 'Checkbox',
                  'x-content': 'Nội dung checkbox C',
                  'x-decorator-props': {
                    feedbackLayout: 'none',
                  }
                },
              },
            },
          },
        },
      },
    },
  },
}

export default () => {
  const { data, isLoading } = useList({ resource: 'permissions' });


  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      feedbackLayout="terse"
      labelCol={6}
      wrapperCol={16}
      onAutoSubmit={console.log}
      onAutoSubmitFailed={console.log}
    >
      <SchemaField schema={schema} scope={{ formTab }} />
      <FormButtonGroup.FormItem>
        <Submit onSubmit={(values) => {
          console.log('Form values:', values)
        }}>Submit</Submit>
      </FormButtonGroup.FormItem>
    </Form>
  )
}