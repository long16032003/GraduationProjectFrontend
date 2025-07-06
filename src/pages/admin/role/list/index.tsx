import { DateField, useTable, List, ShowButton, DeleteButton, EditButton } from '@refinedev/antd';
import { CanAccess, useGo } from '@refinedev/core';
import { Space, Table, type TablePaginationConfig, type TableProps, Tag } from 'antd';
import type { Role } from '@/pages/admin/role/.form/schema.ts';
import React, { useCallback, useMemo } from 'react';

export default function RoleListPage() {
  const go = useGo();

  const { tableProps } = useTable<Role>({
    resource: 'role',
    syncWithLocation: true,
  });

  const rowSelection: TableProps<Role>['rowSelection'] = useMemo(() => ({
    type: 'checkbox',
    onChange: (selectedRowKeys, selectedRows, info) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows, 'info:', info);
    },
    // getCheckboxProps: (record: Role) => ({
    //   disabled: record.name === 'Disabled User', // Column configuration not to be checked
    //   name: record.name,
    // }),
  }), []);

  const pagination = useMemo(() => {
    return {
      ...tableProps.pagination,
      // position: ['bottomCenter'],
      size: 'small',
      showSizeChanger: true,
      pageSizeOptions: [1, 10, 20, 50, 100],
    } as TablePaginationConfig
  }, [tableProps.pagination])

  // console.log('RoleListPage tableProps', tableProps);

  const actionsRender = useCallback((_: unknown, record: Role) => {
    return (
      <Space>
        <EditButton
          resource={'role'}
          size="small"
          recordItemId={record.id}
        />
        <ShowButton
          resource={'role'}
          size="small"
          recordItemId={record.id}
        />
        <DeleteButton
          resource={'role'}
          size="small"
          recordItemId={record.id}
        />
      </Space>
    );
  }, []);

  const dateRender = useCallback((value: string) => <DateField value={value} format={`DD/MM/YYYY HH:mm`}/>, [])

  const statusRender = useCallback((value: boolean) => {
    if(value) {
      return <Tag color="green">Active</Tag>
    }

    return <Tag color="volcano">Inactive</Tag>
  }, [])

  return (
    <div className={`mt-4`}>
      <List>
        <Table
          {...tableProps}
          rowSelection={rowSelection}
          rowKey="id"
          pagination={pagination}
          size="small"
        >
          <Table.Column
            dataIndex="id"
            width={50}
            align={'right'}
            title={'ID'}
            fixed={`left`}
          />
          <Table.Column
            dataIndex="name"
            title={'Name'}
          />
          <Table.Column
            dataIndex="status"
            width={80}
            title={'Status'}
            render={statusRender}
          />
          <Table.Column
            width={150}
            dataIndex={'created_at'}
            title={'Created at'}
            render={dateRender}
          />
          <Table.Column
            width={120}
            title={'Actions'}
            dataIndex="actions"
            render={actionsRender}
          />
        </Table>
      </List>
    </div>
  );
}

