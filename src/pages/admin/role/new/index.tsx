import RoleForm from '../.form/RoleForm.tsx';
import { useLayoutEffect, useMemo } from 'react';
import { createForm } from '@formily/core';
import type { RoleFormValues } from '@/pages/admin/role/types.ts';
import { defaultValues, type Role } from '@/pages/admin/role/.form/schema.ts';
import { useGo, usePermissions, useCreate, useList, useDelete } from '@refinedev/core';
import type { PermissionsResponse } from '@/types.ts';
import { Alert, Card, Button, Spin, Row, Col, Typography, Space, Table, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  SettingOutlined,
  ClearOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function RoleNewPage() {
  const go = useGo();
  const values = defaultValues;

  const { data: permissions, isLoading: permissionsLoading } =
    usePermissions<PermissionsResponse>();

  const {
    data: roles,
    isLoading: isListRoleLoading,
    isSuccess: isListRoleSuccess,
  } = useList<Role>({
    resource: 'role',
  });

  const {
    mutate: createRole,
    isLoading: isSubmiting,
    isSuccess,
  } = useCreate<RoleFormValues>({
    resource: 'role',
    successNotification: {
      message: 'Tạo vai trò thành công!',
      type: 'success',
    },
  });

  const { mutate: deleteRole, isLoading: isDeleteRoleLoading } = useDelete();

  const form = useMemo(() => {
    return createForm<RoleFormValues>({
      validateFirst: true,
      initialValues: values,
    });
  }, [values]);

  const handleSubmit = async (values: RoleFormValues) => {
    // Convert permissions từ format "@" về ":"
    const permissions = Object.entries(values.permissions || {}).reduce(
      (acc, [key, value]) => {
        const originalKey = key.replaceAll('@', ':');
        acc[originalKey] = value;
        return acc;
      },
      {} as Record<string, number>,
    );

    await createRole({
      values: {
        ...values,
        permissions,
      },
    });
  };

  const handleBack = () => {
    go({ to: '/admin/role' });
  };

  const isLoading = isSubmiting || permissionsLoading;

  if (permissionsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size='large' />
        <div style={{ marginTop: 16 }}>
          <Text type='secondary'>Đang tải danh sách quyền...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Space
          align='center'
          style={{ marginBottom: '16px' }}
        >
          <Title
            level={3}
            style={{ margin: 0 }}
            className='text-orange-600'
          >
            Tạo vai trò mới
          </Title>
          <Text type='secondary'>Tạo vai trò mới cho hệ thống nhà hàng</Text>
        </Space>
        

        <div style={{ float: 'right' }}>
          <Space>
            <Button
              type='primary'
              icon={<SaveOutlined />}
              onClick={() => form.submit(handleSubmit)}
              loading={isLoading}
            >
              Tạo vai trò
            </Button>
          </Space>
        </div>
      </div>

      <Row gutter={24}>
        {/* Form Content */}
        <Col
          xs={24}
          lg={10}
        >
          <Card
            title='Thông tin vai trò'
            style={{ height: 'fit-content' }}
          >
            <RoleForm
              form={form}
              permissions={permissions}
            />
          </Card>
        </Col>

        {/* Sidebar */}
        <Col
          xs={24}
          lg={14}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Roles List */}
            <Card
              title='Danh sách vai trò hiện có'
              size='small'
            >
              <RolesList
                roles={roles}
                isLoading={isListRoleLoading}
              />
            </Card>

            {/* Help Card */}
            <Card
              title='💡 Hướng dẫn'
              size='small'
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <Text strong>Tên vai trò:</Text>
                  <br />
                  <Text
                    type='secondary'
                    style={{ fontSize: '12px' }}
                  >
                    Đặt tên mô tả rõ ràng (VD: Quản lý bếp, Thu ngân)
                  </Text>
                </div>
                <div>
                  <Text strong>Cấp độ:</Text>
                  <br />
                  <Text
                    type='secondary'
                    style={{ fontSize: '12px' }}
                  >
                    Vai trò cấp cao có thể tạo vai trò cấp thấp
                  </Text>
                </div>
                <div>
                  <Text strong>Quyền:</Text>
                  <br />
                  <Text
                    type='secondary'
                    style={{ fontSize: '12px' }}
                  >
                    Chọn quyền phù hợp với chức năng công việc
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}

// Component hiển thị danh sách roles
function RolesList({
  roles,
  isLoading,
}: {
  roles: { data: Role[]; total: number } | undefined;
  isLoading: boolean;
}) {
  const go = useGo();

  const handleView = (id: number) => {
    // go({ to: `/admin/role/${id}/show` });
  };

  const handleEdit = (id: number) => {
    // go({ to: `/admin/role/${id}/edit` });
  };

  const handleDelete = async (id: number) => {
    // await deleteRole({
    //   id,
    //   resource: 'role',
    // });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 50,
      align: 'center' as const,
    },
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Text
          strong
          style={{ color: '#1890ff' }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      align: 'center' as const,
      render: (level: number) => (
        <Tag color={level >= 5 ? 'gold' : level >= 3 ? 'blue' : 'green'}>{level}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center' as const,
      render: (status: boolean) => (
        <Tag color={status ? 'success' : 'error'}>{status ? 'Hoạt động' : 'Tạm dừng'}</Tag>
      ),
    },
    // {
    //   title: 'Số quyền',
    //   dataIndex: 'permissions',
    //   key: 'permissions',
    //   width: 80,
    //   align: 'center' as const,
    //   render: (permissions: Record<string, number>) => (
    //     <Tag color='processing'>{Object.values(permissions || {}).filter(Boolean).length}</Tag>
    //   ),
    // },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: Role) => (
        <Space size='small'>
          {/* <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
            title="Xem chi tiết"
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            title="Chỉnh sửa"
          /> */}
          <Button
            type='link'
            size='small'
            icon={<DeleteOutlined />}
            onClick={() => handleEdit(record.id)}
            title='Xóa'
          />
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin size='small' />
        <div style={{ marginTop: 8 }}>
          <Text
            type='secondary'
            style={{ fontSize: '12px' }}
          >
            Đang tải danh sách vai trò...
          </Text>
        </div>
      </div>
    );
  }

  if (!roles?.data || roles.data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Text
          type='secondary'
          style={{ fontSize: '12px' }}
        >
          Chưa có vai trò nào được tạo
        </Text>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: '12px', color: '#666' }}>
          Tổng cộng: <strong>{roles.data.length}</strong> vai trò
        </Text>
      </div>
      <Table
        columns={columns}
        dataSource={roles.data}
        rowKey='id'
        size='small'
        pagination={false}
        scroll={{ y: 300 }}
        style={{ fontSize: '12px' }}
      />
    </div>
  );
}

// Component hiển thị tóm tắt quyền đã chọn
function PermissionsSummary({ form }: { form: ReturnType<typeof createForm<RoleFormValues>> }) {
  const permissions = form.getValuesIn('permissions') || {};
  const selectedCount = Object.values(permissions).filter(Boolean).length;

  if (selectedCount === 0) {
    return (
      <Text
        type='secondary'
        style={{ fontSize: '12px' }}
      >
        Chưa có quyền nào được chọn
      </Text>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: '12px' }}>Đã chọn:</Text>
        <span
          style={{
            fontSize: '11px',
            backgroundColor: '#e6f7ff',
            color: '#1890ff',
            padding: '2px 8px',
            borderRadius: '10px',
          }}
        >
          {selectedCount} quyền
        </span>
      </div>
      <div
        style={{
          maxHeight: '120px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {Object.entries(permissions)
          .filter(([_, value]) => value)
          .map(([key]) => (
            <div
              key={key}
              style={{
                fontSize: '10px',
                backgroundColor: '#f5f5f5',
                color: '#666',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {key.replaceAll('@', ':')}
            </div>
          ))}
      </div>
    </div>
  );
}
