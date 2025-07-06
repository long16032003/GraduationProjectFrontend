import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CanAccess } from '@/components/canAccess.tsx';
import { PermissionWrapper, MultiplePermissionWrapper } from '@/components/PermissionWrapper.tsx';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermission } from '@/components/NoPermission';

// Demo page để minh họa các cách sử dụng permission khác nhau
export default function DemoPermissionsPage() {
  const { checkPermission, hasAnyPermission, hasAllPermissions, user, isSuperAdmin } = usePermissions();

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Demo Permission System</h1>
        <p className="text-gray-600">Minh họa các cách sử dụng hệ thống phân quyền</p>
        
        {/* Thông tin user hiện tại */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Thông tin User hiện tại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Superadmin:</strong> 
                <Badge variant={isSuperAdmin() ? "default" : "secondary"}>
                  {isSuperAdmin() ? "Yes" : "No"}
                </Badge>
              </p>
                             <p><strong>Permissions:</strong> {Object.keys((user as { permissions?: Record<string, number> })?.permissions || {}).length} quyền</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cách 1: Sử dụng CanAccess Component */}
        <Card>
          <CardHeader>
            <CardTitle>Cách 1: CanAccess Component</CardTitle>
            <CardDescription>
              Sử dụng CanAccess component của Refine với fallback tùy chỉnh
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Example 1: Simple permission check */}
            <div>
              <h4 className="font-medium mb-2">Kiểm tra quyền "user:create"</h4>
              <CanAccess
                resource="user"
                action="create"
                fallback={
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    ❌ Không có quyền tạo user
                  </div>
                }
              >
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                  ✅ Có quyền tạo user
                  <Button size="sm" className="ml-2">Tạo User</Button>
                </div>
              </CanAccess>
            </div>

            <div>
              <h4 className="font-medium mb-2">Kiểm tra quyền "role:browse"</h4>
              <CanAccess
                resource="role"
                action="browse"
                fallback={<Badge variant="destructive">Không có quyền xem role</Badge>}
              >
                <Badge variant="default">Có quyền xem role</Badge>
              </CanAccess>
            </div>
          </CardContent>
        </Card>

        {/* Cách 2: Sử dụng PermissionWrapper */}
        <Card>
          <CardHeader>
            <CardTitle>Cách 2: PermissionWrapper</CardTitle>
            <CardDescription>
              Sử dụng custom PermissionWrapper component
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Single Permission</h4>
              <PermissionWrapper 
                permission="dish:create"
                fallback={<Badge variant="destructive">Không có quyền tạo món ăn</Badge>}
              >
                <Badge variant="default">Có quyền tạo món ăn</Badge>
                <Button size="sm" className="ml-2">Tạo Món Ăn</Button>
              </PermissionWrapper>
            </div>

            <div>
              <h4 className="font-medium mb-2">Multiple Permissions (OR)</h4>
              <MultiplePermissionWrapper 
                permissions={["bill:browse", "dish:browse"]}
                requireAll={false}
                fallback={<Badge variant="destructive">Không có quyền xem hóa đơn hoặc món ăn</Badge>}
              >
                <Badge variant="default">Có quyền xem hóa đơn hoặc món ăn</Badge>
              </MultiplePermissionWrapper>
            </div>

            <div>
              <h4 className="font-medium mb-2">Multiple Permissions (AND)</h4>
              <MultiplePermissionWrapper 
                permissions={["user:create", "user:update"]}
                requireAll={true}
                fallback={<Badge variant="destructive">Cần cả 2 quyền create và update user</Badge>}
              >
                <Badge variant="default">Có đủ quyền tạo và sửa user</Badge>
              </MultiplePermissionWrapper>
            </div>
          </CardContent>
        </Card>

        {/* Cách 3: Sử dụng Hook trực tiếp */}
        <Card>
          <CardHeader>
            <CardTitle>Cách 3: Hook usePermissions</CardTitle>
            <CardDescription>
              Sử dụng hook để kiểm tra permission trong component logic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Conditional Rendering</h4>
              <div className="space-y-2">
                {checkPermission("table:browse") ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default">✅ Có quyền xem bàn</Badge>
                    <Button size="sm">Quản lý bàn</Button>
                  </div>
                ) : (
                  <Badge variant="destructive">❌ Không có quyền xem bàn</Badge>
                )}

                {hasAnyPermission(["promotion:browse", "promotion:create"]) ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default">✅ Có quyền về promotion</Badge>
                    <Button size="sm">Quản lý ưu đãi</Button>
                  </div>
                ) : (
                  <Badge variant="destructive">❌ Không có quyền về promotion</Badge>
                )}

                {hasAllPermissions(["ingredient:browse", "ingredient:create"]) ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default">✅ Có đủ quyền quản lý nguyên liệu</Badge>
                    <Button size="sm">Quản lý kho</Button>
                  </div>
                ) : (
                  <Badge variant="destructive">❌ Không đủ quyền quản lý nguyên liệu</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cách 4: No Permission Component */}
        <Card>
          <CardHeader>
            <CardTitle>Cách 4: NoPermission Component</CardTitle>
            <CardDescription>
              Component hiển thị thông báo đẹp khi không có quyền
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: '200px' }}>
              <NoPermission 
                title="Demo NoPermission"
                message="Đây là demo component NoPermission với giao diện thân thiện"
                showBackButton={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>
            Các ví dụ code để sử dụng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. CanAccess Component:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<CanAccess
  resource="user"
  action="create"
  fallback={<div>Không có quyền</div>}
>
  <Button>Tạo User</Button>
</CanAccess>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. PermissionWrapper:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<PermissionWrapper permission="dish:create">
  <Button>Tạo Món Ăn</Button>
</PermissionWrapper>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Hook usePermissions:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const { checkPermission } = usePermissions();

{checkPermission("user:create") && (
  <Button>Tạo User</Button>
)}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 