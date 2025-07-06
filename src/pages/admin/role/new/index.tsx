import RoleForm from '../.form/RoleForm.tsx';
import { useLayoutEffect, useMemo } from 'react';
import { createForm } from '@formily/core';
import type { RoleFormValues } from '@/pages/admin/role/types.ts';
import { defaultValues } from '@/pages/admin/role/.form/schema.ts';
import { useGo, usePermissions, useCreate } from '@refinedev/core';
import type { PermissionsResponse } from '@/types.ts';
import { Alert, Card, Button, Spin, Row, Col, Typography, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UserOutlined, SettingOutlined, ClearOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function RoleNewPage() {
  const go = useGo();
  const values = defaultValues;
  
  const { data: permissions, isLoading: permissionsLoading } = usePermissions<PermissionsResponse>();

  const { mutate: createRole, isLoading: isSubmiting, isSuccess } = useCreate<RoleFormValues>({
    resource: 'roles',
    successNotification: {
      message: 'Tạo vai trò thành công!',
      type: 'success',
    },
  });

  useLayoutEffect(() => {
    if(isSuccess) {
      go({to: '/admin/role'});
    }
  }, [go, isSuccess])

  const form = useMemo(() => {
    return createForm<RoleFormValues>({
      validateFirst: true,
      initialValues: values,
    });
  }, [values]);

  const handleSubmit = async (values: RoleFormValues) => {
    // Convert permissions từ format "@" về ":"
    const permissions = Object.entries(values.permissions || {})
      .reduce((acc, [key, value]) => {
        const originalKey = key.replaceAll('@', ':');
        acc[originalKey] = value;
        return acc;
      }, {} as Record<string, number>);

    createRole({
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
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Đang tải danh sách quyền...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Space align="center" style={{ marginBottom: '16px' }}>
          <Title level={2} style={{ margin: 0 }}>
            ✨ Tạo vai trò mới
          </Title>
        </Space>
        <Text type="secondary">
          Tạo vai trò mới và phân quyền cho hệ thống nhà hàng
        </Text>
        
        <div style={{ float: 'right', marginTop: '-50px' }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              disabled={isLoading}
            >
              Quay lại
            </Button>
            <Button 
              type="primary"
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
            {/* Help Card */}
            <Card title="💡 Hướng dẫn" size="small">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <Text strong>Tên vai trò:</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Đặt tên mô tả rõ ràng (VD: Quản lý bếp, Thu ngân)
                  </Text>
                </div>
                <div>
                  <Text strong>Cấp độ:</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Vai trò cấp cao có thể tạo vai trò cấp thấp
                  </Text>
                </div>
                <div>
                  <Text strong>Quyền:</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Chọn quyền phù hợp với chức năng công việc
                  </Text>
                </div>
              </div>
            </Card>

            {/* Permissions Summary */}
            <Card title="🔐 Tóm tắt quyền" size="small">
              <PermissionsSummary form={form} />
            </Card>

            {/* Quick Actions */}
            <Card title="⚡ Mẫu quyền nhanh" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  size="small"
                  icon={<UserOutlined />}
                  style={{ width: '100%', textAlign: 'left' }}
                  onClick={() => {
                    const basicPermissions = {
                      'table@browse': 1,
                      'dish@browse': 1,
                      'bill@browse': 1,
                      'bill@create': 1,
                    };
                    form.setValuesIn('permissions', basicPermissions);
                  }}
                >
                  Nhân viên phục vụ
                </Button>
                <Button
                  size="small"
                  icon={<SettingOutlined />}
                  style={{ width: '100%', textAlign: 'left' }}
                  onClick={() => {
                    const kitchenPermissions = {
                      'bill@browse': 1,
                      'bill@update': 1,
                      'dish@browse': 1,
                      'ingredient@browse': 1,
                    };
                    form.setValuesIn('permissions', kitchenPermissions);
                  }}
                >
                  Nhân viên bếp
                </Button>
                <Button
                  size="small"
                  icon={<ClearOutlined />}
                  danger
                  style={{ width: '100%', textAlign: 'left' }}
                  onClick={() => {
                    form.setValuesIn('permissions', {});
                  }}
                >
                  Xóa tất cả quyền
                </Button>
              </Space>
            </Card>

            {/* Info Alert */}
            <Alert
              message="Lưu ý"
              description="Hệ thống sẽ tự động kiểm tra quyền khi người dùng thực hiện các hành động."
              type="info"
              showIcon
              style={{ fontSize: '12px' }}
            />
          </div>
        </Col>
      </Row>
    </div>
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