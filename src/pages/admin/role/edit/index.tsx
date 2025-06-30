import RoleForm from '../.form/RoleForm.tsx';
import { useLayoutEffect, useMemo } from 'react';
import { createForm } from '@formily/core';
import type { RoleFormValues } from '@/pages/admin/role/types.ts';
import { useGo, useOne, usePermissions, useUpdate } from '@refinedev/core';
import type { PermissionsResponse } from '@/types.ts';
import { Alert, Card, Button, Spin, Row, Col, Typography, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useParams } from 'react-router';
import { CanAccess } from '@/components/canAccess';

const { Title, Text } = Typography;

export default function RoleEditPage() {
  const { id } = useParams();
  const go = useGo();
  
  const { data, isLoading } = useOne<RoleFormValues>({
    resource: "roles", // Đổi thành "roles" để nhất quán
    id,
  });
  
  const { data: permissions, isLoading: permissionsLoading } = usePermissions<PermissionsResponse>();

  const { mutate: updateRole, isLoading: isSubmiting, isSuccess } = useUpdate<RoleFormValues>({
    resource: 'roles',
    id,
    successNotification: {
      message: 'Cập nhật vai trò thành công!',
      type: 'success',
    },
  });

  useLayoutEffect(() => {
    if(isSuccess) {
      go({to: '/admin/role'});
    }
  }, [go, isSuccess])

  const form = useMemo(() => {
    if (!data?.data) return null;
    
    // Convert permissions từ format ":" về "@" cho form
    const formPermissions = Object.entries(data.data.permissions || {})
      .reduce((acc, [key, value]) => {
        const formKey = key.replaceAll(':', '@');
        acc[formKey] = value;
        return acc;
      }, {} as Record<string, number>);

    return createForm<RoleFormValues>({
      validateFirst: true,
      initialValues: {
        ...data.data,
        permissions: formPermissions,
      },
    });
  }, [data?.data]);

  const handleSubmit = async (values: RoleFormValues) => {
    // Convert permissions từ format "@" về ":" cho API
    const permissions = Object.entries(values.permissions || {})
      .reduce((acc, [key, value]) => {
        const originalKey = key.replaceAll('@', ':');
        acc[originalKey] = value;
        return acc;
      }, {} as Record<string, number>);

    updateRole({
            values: {
              ...values,
        permissions,
            },
          });
  };

  const handleBack = () => {
    go({ to: '/admin/role' });
  };

  const handleView = () => {
    go({ to: `/admin/role/${id}/show` });
  };

  const currentRole = data?.data;
  const loading = isLoading || permissionsLoading;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Đang tải thông tin vai trò...</Text>
        </div>
      </div>
    );
  }

  if (!currentRole || !form) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="secondary">Không tìm thấy thông tin vai trò</Text>
      </div>
    );
  }

  return (
    <CanAccess 
      resource="role" 
      action="edit"
      fallback={
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text type="secondary">Bạn không có quyền chỉnh sửa vai trò</Text>
        </div>
      }
    >
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <Title level={2} style={{ margin: 0 }}>
              ✏️ Chỉnh sửa vai trò
            </Title>
          </Space>
          <Text type="secondary">
            Cập nhật thông tin và quyền hạn cho vai trò: <strong>{currentRole.name}</strong>
          </Text>
          
          <div style={{ float: 'right', marginTop: '-50px' }}>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                disabled={isSubmiting}
              >
                Quay lại
              </Button>
              <Button 
                icon={<EyeOutlined />}
                onClick={handleView}
                disabled={isSubmiting}
              >
                Xem chi tiết
              </Button>
              <Button 
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => form.submit(handleSubmit)}
                loading={isSubmiting}
              >
                Lưu thay đổi
              </Button>
            </Space>
          </div>
        </div>

        <Row gutter={24}>
          {/* Form Content */}
          <Col xs={24} lg={16}>
            <Card title="📝 Thông tin vai trò" style={{ height: 'fit-content' }}>
              <RoleForm 
                form={form} 
                permissions={permissions}
              />
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Current Info */}
              <Card title="📋 Thông tin hiện tại" size="small">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <Text strong>Tên vai trò:</Text>
                    <br />
                    <Text>{currentRole.name}</Text>
                  </div>
                                     <div>
                     <Text strong>Cấp độ:</Text>
                     <br />
                     <Text>{(currentRole as RoleFormValues & {level?: number}).level || 'Chưa có'}</Text>
                   </div>
                   <div>
                     <Text strong>Số quyền hiện tại:</Text>
                     <br />
                     <Text>
                       {Object.values(currentRole.permissions || {}).filter(Boolean).length} quyền
                     </Text>
                   </div>
                   <div>
                     <Text strong>Ngày tạo:</Text>
                     <br />
                     <Text type="secondary" style={{ fontSize: '12px' }}>
                       {(currentRole as RoleFormValues & {created_at?: string}).created_at ? new Date((currentRole as RoleFormValues & {created_at?: string}).created_at!).toLocaleDateString('vi-VN') : 'Không có'}
                     </Text>
                   </div>
                </div>
              </Card>

              {/* Help Card */}
              <Card title="💡 Hướng dẫn chỉnh sửa" size="small">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <Text strong>Thay đổi tên:</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Có thể đổi tên mô tả cho vai trò
                    </Text>
                  </div>
                  <div>
                    <Text strong>Cấp độ:</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Cẩn thận khi thay đổi cấp độ
                    </Text>
                  </div>
                  <div>
                    <Text strong>Quyền:</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Thêm/bớt quyền theo nhu cầu
                    </Text>
                  </div>
                </div>
              </Card>

              {/* Permissions Summary */}
              <Card title="🔐 Tóm tắt quyền" size="small">
                <PermissionsSummary form={form} />
              </Card>

              {/* Quick Actions */}
              <Card title="⚡ Thao tác nhanh" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    size="small"
                    style={{ width: '100%', textAlign: 'left' }}
                    onClick={() => {
                      // Reset về quyền gốc
                      const originalPermissions = Object.entries(currentRole.permissions || {})
                        .reduce((acc, [key, value]) => {
                          const formKey = key.replaceAll(':', '@');
                          acc[formKey] = value;
                          return acc;
                        }, {} as Record<string, number>);
                      form.setValuesIn('permissions', originalPermissions);
                    }}
                  >
                    🔄 Khôi phục quyền gốc
                  </Button>
                  <Button
                    size="small"
                    danger
                    style={{ width: '100%', textAlign: 'left' }}
                    onClick={() => {
                      form.setValuesIn('permissions', {});
                    }}
                  >
                    🗑️ Xóa tất cả quyền
                  </Button>
                </Space>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Warning Alert */}
        <Alert
          message="⚠️ Lưu ý khi chỉnh sửa"
          description={
            <div>
              <p>• Thay đổi sẽ ảnh hưởng đến tất cả người dùng có vai trò này</p>
              <p>• Người dùng cần đăng nhập lại để áp dụng quyền mới</p>
              <p>• Không nên xóa quyền quan trọng đang được sử dụng</p>
              <p>• Kiểm tra kỹ trước khi lưu thay đổi</p>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginTop: '24px' }}
        />
      </div>
    </CanAccess>
  );
}

// Component hiển thị tóm tắt quyền đã chọn
function PermissionsSummary({ form }: { form: ReturnType<typeof createForm<RoleFormValues>> }) {
  const permissions = form.getValuesIn('permissions') || {};
  const selectedCount = Object.values(permissions).filter(Boolean).length;

  if (selectedCount === 0) {
      return (
      <Text type="secondary" style={{ fontSize: '12px' }}>
        Chưa có quyền nào được chọn
      </Text>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: '12px' }}>Đã chọn:</Text>
        <span style={{ 
          fontSize: '11px', 
          backgroundColor: '#e6f7ff', 
          color: '#1890ff',
          padding: '2px 8px',
          borderRadius: '10px'
        }}>
          {selectedCount} quyền
        </span>
      </div>
      <div style={{ 
        maxHeight: '120px', 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {Object.entries(permissions)
          .filter(([_, value]) => value)
          .map(([key]) => (
            <div key={key} style={{ 
              fontSize: '10px', 
              backgroundColor: '#f5f5f5', 
              color: '#666',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {key.replaceAll('@', ':')}
            </div>
          ))
        }
      </div>
    </div>
  );
}