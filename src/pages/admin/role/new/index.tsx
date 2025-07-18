import RoleForm from '../.form/RoleForm.tsx';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { createForm } from '@formily/core';
import type { RoleFormValues } from '@/pages/admin/role/types.ts';
import { defaultValues, type Role } from '@/pages/admin/role/.form/schema.ts';
import { useGo, usePermissions, useCreate, useList, useDelete, useUpdate, useOne } from '@refinedev/core';
import type { PermissionsResponse } from '@/types.ts';
import { Alert, Card, Button, Spin, Row, Col, Typography, Space, Table, Tag, Modal, Descriptions, Checkbox, Form, Input, InputNumber, Switch, message } from 'antd';
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
          lg={11}
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
          lg={13}
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
                deleteRole={deleteRole}
                isDeleteLoading={isDeleteRoleLoading}
                onRefresh={() => window.location.reload()}
                permissions={permissions}
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
  deleteRole,
  isDeleteLoading,
  onRefresh,
  permissions,
}: {
  roles: { data: Role[]; total: number } | undefined;
  isLoading: boolean;
  deleteRole: ReturnType<typeof useDelete>['mutate'];
  isDeleteLoading: boolean;
  onRefresh?: () => void;
  permissions: PermissionsResponse | undefined;
}) {
  const go = useGo();
  
  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // Update hook for editing
  const { mutate: updateRole, isLoading: isUpdating } = useUpdate();

  const handleView = (role: Role) => {
    setSelectedRole(role);
    setViewModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setEditModalVisible(true);
  };

  const handleDelete = async (id: number, roleName: string) => {
    Modal.confirm({
      title: '⚠️ Xác nhận xóa vai trò',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa vai trò <strong>"{roleName}"</strong>?</p>
          <p style={{ color: '#ff4d4f', fontSize: '12px' }}>
            ⚠️ Lưu ý: Hành động này không thể hoàn tác và sẽ ảnh hưởng đến tất cả người dùng có vai trò này!
          </p>
        </div>
      ),
      icon: null,
      okText: 'Xóa vai trò',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        await deleteRole({
          id,
          resource: 'role',
          successNotification: {
            message: 'Xóa vai trò thành công!',
            type: 'success',
          },
          errorNotification: {
            message: 'Xóa vai trò thất bại!',
            type: 'error',
          },
        });
        // // Refresh danh sách sau khi xóa thành công
        // if (onRefresh) {
        //   setTimeout(() => onRefresh(), 1000);
        // }
      },
    });
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
            onClick={() => handleView(record)}
            title="Xem chi tiết"
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          /> */}
          <Button
            type='link'
            size='small'
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.name)}
            title='Xóa'
            loading={isDeleteLoading}
            danger
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
      
      {/* View Permissions Modal */}
      <ViewPermissionsModal
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        role={selectedRole}
        permissions={permissions}
      />
      
      {/* Edit Role Modal */}
      <EditRoleModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        role={selectedRole}
        permissions={permissions}
        onSuccess={() => {
          setEditModalVisible(false);
          if (onRefresh) onRefresh();
        }}
        updateRole={updateRole}
        isUpdating={isUpdating}
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

// Modal xem chi tiết permissions
function ViewPermissionsModal({ visible, onCancel, role, permissions }: {
  visible: boolean;
  onCancel: () => void;
  role: Role | null;
  permissions: PermissionsResponse | undefined;
}) {
  if (!role || !permissions) return null;

  const rolePermissions = role.permissions || {};
  const enabledPermissions = Object.entries(rolePermissions).filter(([_, enabled]) => enabled);
  
  // Nhóm permissions theo module để hiển thị đẹp hơn - giống như EditRoleModal
  const permissionGroups = Object.entries(permissions || {}).reduce((groups, [key, value]) => {
    const [module] = key.split(':');
    if (!groups[module]) groups[module] = [];
    groups[module].push({ key, label: String(value) });
    return groups;
  }, {} as Record<string, Array<{ key: string; label: string }>>);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EyeOutlined style={{ color: '#1890ff' }} />
          <span>Chi tiết vai trò: {role.name}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>
      ]}
      width={800}
    >
      <Descriptions column={2} size="small" style={{ marginBottom: '16px' }}>
        <Descriptions.Item label="Tên vai trò">
          <strong>{role.name}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Cấp độ">
          <Tag color={role.level >= 5 ? 'gold' : role.level >= 3 ? 'blue' : 'green'}>
            Level {role.level}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={role.status ? 'success' : 'error'}>
            {role.status ? 'Hoạt động' : 'Tạm dừng'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tổng số quyền">
          <Tag color="processing">{enabledPermissions.length} quyền</Tag>
        </Descriptions.Item>
      </Descriptions>

      <Typography.Title level={5}>🔐 Quyền hạn chi tiết:</Typography.Title>
      
      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: '6px', backgroundColor: '#fafafa' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: '#f0f0f0', 
          padding: '8px 12px', 
          borderBottom: '1px solid #d9d9d9',
          fontWeight: 'bold',
          fontSize: '12px'
        }}>
          <div style={{ flex: '0 0 200px', borderRight: '1px solid #d9d9d9', paddingRight: '8px' }}>
            Permissions:
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', paddingLeft: '8px' }}>
            <span>Xem danh sách</span>
            <span>Xem chi tiết</span>
            <span>Tạo</span>
            <span>Cập nhật</span>
            <span>Xóa</span>
            <span>Sao chép</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '0' }}>
          {Object.entries(permissionGroups).map(([module, modulePermissions]) => {
            // Tạo mapping cho các actions
            const actions = ['browse', 'read', 'create', 'update', 'delete', 'clone'];
            const moduleActions = actions.map(action => {
              const permissionKey = `${module}:${action}`;
              const hasPermission = Boolean(rolePermissions[permissionKey]);
              return { action, hasPermission, key: permissionKey };
            });

            // Tên module dễ hiểu
            const moduleLabels: Record<string, string> = {
              'user': 'Quản lý nhân viên',
              'role': 'Phân quyền',
              'customer': 'Quản lý khách hàng', 
              'post': 'Quản lý bài viết',
              'order': 'Quản lý đơn gọi món',
              'ingredient': 'Quản lý nguyên liệu',
              'product': 'Quản lý sản phẩm',
              'bill': 'Quản lý hóa đơn',
              'site-setting': 'Quản lý cấu hình',
              'enter-ingredient': 'Quản lý nhập nguyên liệu',
              'export-ingredient': 'Quản lý xuất nguyên liệu',
              'dish': 'Quản lý món ăn',
              'dish-category': 'Quản lý danh mục món ăn',
              'reservation': 'Quản lý đặt bàn',
              'table': 'Quản lý bàn',
              'promotion': 'Quản lý khuyến mãi',
              'staff': 'Quản lý nhân viên',
              'media': 'Quản lý phương tiện',
              'statistics': 'Quản lý thống kê',
            };
            
            return (
              <div key={module} style={{ 
                display: 'flex', 
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div style={{ 
                  flex: '0 0 200px', 
                  padding: '8px 12px', 
                  borderRight: '1px solid #f0f0f0',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: '#1890ff'
                }}>
                  {moduleLabels[module] || module}
                </div>
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  justifyContent: 'space-around', 
                  alignItems: 'center',
                  padding: '8px'
                }}>
                  {moduleActions.map(({ action, hasPermission, key }) => (
                    <Checkbox 
                      key={key}
                      checked={hasPermission}
                      disabled={true}
                      style={{ 
                        margin: 0,
                        color: hasPermission ? '#52c41a' : '#999'
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {Object.keys(permissionGroups).length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <Alert
              message="Không có quyền nào được cấu hình"
              type="warning"
              showIcon
            />
          </div>
        )}
      </div>
      
    </Modal>
  );
}

// Modal chỉnh sửa role
function EditRoleModal({ visible, onCancel, role, permissions, onSuccess, updateRole, isUpdating }: {
  visible: boolean;
  onCancel: () => void;
  role: Role | null;
  permissions: PermissionsResponse | undefined;
  onSuccess: () => void;
  updateRole: ReturnType<typeof useUpdate>['mutate'];
  isUpdating: boolean;
}) {
  const form = useMemo(() => {
    if (!role) return null;

    // Chuyển đổi permissions từ format ":" sang "@"
    const formPermissions = Object.entries(role.permissions || {})
      .reduce((acc, [key, value]) => {
        const formKey = key.replaceAll(':', '@');
        acc[formKey] = value;
        return acc;
      }, {} as Record<string, number>);

    return createForm<RoleFormValues>({
      validateFirst: true,
      initialValues: {
        name: role.name,
        level: role.level,
        status: role.status,
        permissions: formPermissions
      },
    });
  }, [role]);
  
  // Reset form khi modal mở với role mới
  React.useEffect(() => {
    if (visible && role && form) {
      // Chuyển đổi permissions từ format ":" sang "@"
      const formPermissions = Object.entries(role.permissions || {})
        .reduce((acc, [key, value]) => {
          const formKey = key.replaceAll(':', '@');
          acc[formKey] = value;
          return acc;
        }, {} as Record<string, number>);

      form.setValues({
        name: role.name,
        level: role.level,
        status: role.status,
        permissions: formPermissions
      });
    }
  }, [visible, role, form]);

  const handleSubmit = async (values: RoleFormValues) => {
    if (!role) return;
    
    // Chuyển đổi permissions từ format "@" về ":"
    const permissions = Object.entries(values.permissions || {})
      .reduce((acc, [key, value]) => {
        const originalKey = key.replaceAll('@', ':');
        acc[originalKey] = value;
        return acc;
      }, {} as Record<string, number>);

    try {
      await updateRole({
        resource: 'role',
        id: role.id,
        values: {
          name: values.name,
          level: values.level,
          status: values.status,
          permissions
        },
        successNotification: {
          message: 'Cập nhật vai trò thành công!',
          type: 'success',
        },
        errorNotification: {
          message: 'Cập nhật vai trò thất bại!',
          type: 'error',
        },
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  if (!role || !permissions || !form) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EditOutlined style={{ color: '#52c41a' }} />
          <span>Chỉnh sửa vai trò: {role.name}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit(handleSubmit)}
      confirmLoading={isUpdating}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      width={1000}
      style={{ top: 20 }}
    >
      <RoleForm
        form={form}
        permissions={permissions}
      />
    </Modal>
  );
}
