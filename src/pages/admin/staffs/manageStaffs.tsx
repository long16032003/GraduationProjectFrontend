import React from 'react'
import {
  FormItem,
  Input,
  ArrayTable,
  Editable,
  FormButtonGroup,
  Submit,
  Select,
  Password,
} from '@formily/antd-v5'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { Card } from 'antd'
import { useCreate, useList } from '@refinedev/core'
import dayjs from 'dayjs'
import type { Staff } from '@/types'

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Editable,
    Input,
    ArrayTable,
    Select,
    Password,
  },
})

const form = createForm()

const schema = {
  type: 'object',
  properties: {
    staffs: {
      type: 'array',
      'x-decorator': 'FormItem',
      'x-component': 'ArrayTable',
      'x-component-props': {
        pagination: { pageSize: 10 },
        scroll: { x: '100%' },
      },
      items: {
        type: 'object',
        properties: {
          column1: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': { width: 50, title: 'STT', align: 'center' },
            properties: {
              index: {
                type: 'void',
                'x-component': 'ArrayTable.Index',
              },
            },
          },
          column2: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': { width: 100, title: 'Mã NV' },
            properties: {
              id: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  disabled: true,
                },
              },
            },
          },
          column3: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': { width: 200, title: 'Họ và tên' },
            properties: {
              name: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
              },
            },
          },
          column4: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': { width: 200, title: 'Email' },
            properties: {
              email: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
              },
            },
          },
          column5: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': { width: 150, title: 'Số điện thoại' },
            properties: {
              phone: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                required: true,
                'x-validator': [
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
                ],
                'x-component-props': {
                  placeholder: 'Nhập số điện thoại',
                },
              },
            },
          },
          column6: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': { width: 150, title: 'Vai trò' },
            properties: {
              role: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-component-props': {
                  options: [
                    { label: 'Quản trị viên', value: 'admin' },
                    { label: 'Nhân viên', value: 'staff' },
                    { label: 'Đầu bếp', value: 'chef' },
                  ],
                },
              },
            },
          },
          column7: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': { width: 200, title: 'Ngày tạo' },
            properties: {
              'user.created_at': {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  disabled: true,
                },
              },
            },
          },
          column8: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: 'Thao tác',
              width: 200,
              fixed: 'right',
            },
            properties: {
              item: {
                type: 'void',
                'x-component': 'FormItem',
                properties: {
                  remove: {
                    type: 'void',
                    'x-component': 'ArrayTable.Remove',
                  },
                  moveDown: {
                    type: 'void',
                    'x-component': 'ArrayTable.MoveDown',
                  },
                  moveUp: {
                    type: 'void',
                    'x-component': 'ArrayTable.MoveUp',
                  },
                },
              },
            },
          },
        },
      },
      properties: {
        add: {
          type: 'void',
          'x-component': 'ArrayTable.Addition',
          title: 'Thêm nhân viên',
        },
      },
    },
  },
};

const ManageStaffs: React.FC = () => {
  const { data } = useList<Staff>({
    resource: 'staffs',
  });

  const { mutate: createStaff } = useCreate();

  React.useEffect(() => {
    if (data) {
      // Format lại ngày tạo để hiển thị
      const formattedData = data.map((staff: any) => ({
        ...staff,
        'user.created_at': dayjs(staff.user.created_at).format('DD/MM/YYYY HH:mm:ss'),
      }));
      
      form.setValues({
        staffs: formattedData,
      });
    }
  }, [data]);

  const handleSubmit = async (values: Staff) => {
    try {
      await createStaff({
        resource: 'staffs',
        values: values,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Card title="Quản lý nhân viên" className="m-4">
      <FormProvider form={form}>
        <SchemaField schema={schema} />
        <FormButtonGroup>
          <Submit onSubmit={handleSubmit}>Lưu thay đổi</Submit>
        </FormButtonGroup>
      </FormProvider>
    </Card>
  );
};

export default ManageStaffs;