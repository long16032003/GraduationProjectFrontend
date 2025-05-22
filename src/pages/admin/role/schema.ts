// https://react.formilyjs.org/api/shared/schema
// https://core.formilyjs.org/api/models/field#fieldvalidator

import { createSchemaField, type ISchema } from "@formily/react";
import { createInputSchema } from '@/utils/form.ts';
import type { PermissionGroup, PermissionResource, PermissionsTree } from '@/types.ts';
import { collect } from 'ts-collect';
import { defu } from 'defu';
import { Checkbox, FormItem, FormLayout, FormTab, Input } from "@formily/antd-v5";

export const defaultValues = {
  name: '',
  passwords: {},
}

// https://react.formilyjs.org/api/components/schema-field
// https://core.formilyjs.org/api/entry/form-validator-registry
export const SchemaField = createSchemaField({
  components: {
    FormLayout,
    FormItem,
    Input,
    Checkbox,
    FormTab
  },
  scope: {
  },
});

// https://formilyjs.org/guide/advanced/validate
export const schema: ISchema = {
  type: 'object',
  properties: {
    name: createInputSchema({
      required: true,
      title: 'Name',
      maxLength: 255,
    }),
    permissions: {
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
            // dynamic content
          },
        },
      },
    },
  },
};


export function updateSchema(schema: ISchema, tree: PermissionsTree) {
  return defu({
    properties: {
      permissions: {
        properties: {
          collapse: {
            properties: createPermissionGroupSchema(tree.default)
          }
        }
      }
    }
  },schema)
}

function createPermissionGroupSchema(group: PermissionGroup) {
  return Object.fromEntries(collect(Object.entries(group.children))
    .mapWithKeys(([key, resource]) => {
      return [key, {
        type: 'void',
        'x-component': 'FormTab.TabPane',
        'x-component-props': {
          tab: resource.description,
        },
        // properties: {
        //   grid: {
        //     type: 'void',
        //     'x-component': 'FormGrid',
        //     'x-component-props': {
        //       // minWidth: 300,
        //       // maxWidth: 300,
        //     },
            properties: createPermissionResourceSchema(resource)
          // }
        // }
      }]
    }).entries())


}

function createPermissionResourceSchema(resource: PermissionResource) {
  return Object.fromEntries(collect(Object.entries(resource.actions))
    .mapWithKeys(([key, action]) => {
      const normalizePermission = action.permission.replaceAll(':', '@')
      return [normalizePermission, {
        type: 'boolean',
        'x-decorator': 'FormItem',
        'x-component': 'Checkbox',
        'x-component-props': {
          className: 'w-full',
          style: {
            height: '34px',
            lineHeight: '34px',
          },
        },
        'x-content': action.description,
        'x-decorator-props': {
          feedbackLayout: 'none',
        }
      }]
    }).entries())
}