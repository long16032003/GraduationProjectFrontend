// https://react.formilyjs.org/api/shared/schema
// https://core.formilyjs.org/api/models/field#fieldvalidator

import { createSchemaField, type ISchema } from '@formily/react';
import { createInputSchema, createNumberSchema, createSwitchSchema } from '@/utils/form.ts';
import type {
  PermissionAction,
  PermissionGroup,
  PermissionResource,
  PermissionsTree,
} from '@/types.ts';
import { collect } from 'collect.js';
import { defu } from 'defu';
import {
  Checkbox,
  FormItem,
  FormLayout,
  FormTab,
  Input,
  NumberPicker,
  Switch,
} from '@formily/antd-v5';

export interface RoleFormValues extends BaseRecord {
  name: string;
  level: number;
  status: boolean;
  permissions?: Record<string, number>;
}

export interface Role extends RoleFormValues {
  id: number
}

export const defaultValues: RoleFormValues = {
  name: '',
  level: 0,
  status: true,
  permissions: {},
};

// https://react.formilyjs.org/api/components/schema-field
// https://core.formilyjs.org/api/entry/form-validator-registry
import { type SchemaReactComponents } from '@formily/react';
import type { BaseRecord } from '@refinedev/core';

export const SchemaField = createSchemaField({
  components: {
    FormLayout,
    FormItem,
    Input,
    Checkbox,
    FormTab,
    Switch,
    NumberPicker,
  } as SchemaReactComponents,
  scope: {},
});

// https://formilyjs.org/guide/advanced/validate
export const schema: ISchema = {
  type: 'object',
  properties: {
    name: createInputSchema({
      required: true,
      title: 'Name',
      maxLength: 128,
      'x-component-props': {
        maxLength: 128,
      },
    }),
    level: createNumberSchema({
      title: 'Level',
      // description: 'Role with higher level can create lower level roles',
      'x-decorator-props': {
        tooltip: 'Role with higher level can create lower level roles',
      },
      minimum: 0,
      maximum: 10,
    }),
    status: createSwitchSchema({
      title: 'Active',
    }),
    permissions: {
      type: 'object',
      title: 'Permissions',
      'x-decorator': 'FormItem',
      'x-validator': [
        {
          validator: (value: Record<string, boolean>) => {
            return null; // Hợp lệ
          },
        },
      ],
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
  const permissionGroupSchema = createPermissionGroupSchema(tree.default);
  return defu(
    {
      properties: {
        permissions: {
          properties: {
            collapse: {
              properties: permissionGroupSchema,
            },
          },
        },
      },
    },
    schema,
  );
}

function createPermissionGroupSchema(group: PermissionGroup) {
  return collect(Object.entries(group.children))
    .mapWithKeys(([key, resource]: [string, PermissionResource]) => {
      return [
        key,
        {
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
          properties: createPermissionResourceSchema(resource),
          // }
          // }
        },
      ];
    })
    .all();
}

function createPermissionResourceSchema(resource: PermissionResource) {
  return collect(Object.entries(resource.actions))
    .mapWithKeys(([key, action]: [string, PermissionAction]) => {
      // normalize the permission name
      // replace all ":" with "@" to avoid issues with formily
      const normalizePermission = action.permission.replaceAll(':', '@');
      return [
        normalizePermission,
        {
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
          },
        },
      ];
    })
    .all();
}
