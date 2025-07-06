# 🔐 Hướng dẫn sử dụng Hệ thống Phân quyền

## 📋 Tổng quan

Hệ thống phân quyền đã được hoàn thiện với **2 cách chính** để triển khai permission checking trong frontend:

1. **CanAccess Component** - Component của Refine
2. **Direct Permission Checking** - Sử dụng hooks và wrapper components tùy chỉnh

---

## 🚀 Cách 1: Sử dụng CanAccess Component (Refine)

### Cú pháp cơ bản:
```tsx
import { CanAccess } from '@/components/canAccess.tsx';

<CanAccess
  resource="user"
  action="create"
  fallback={<div>Không có quyền tạo user</div>}
>
  <Button>Tạo User</Button>
</CanAccess>
```

### Ưu điểm:
- ✅ Tích hợp sẵn với Refine ecosystem
- ✅ Hỗ trợ `resource` và `action` parameters
- ✅ Fallback tùy chỉnh
- ✅ Tự động sử dụng Access Control Provider

### Sử dụng trong pages:
```tsx
// Wrap toàn bộ page
<CanAccess resource="role" action="create">
  <CreateRolePage />
</CanAccess>

// Wrap từng button
<CanAccess resource="user" action="delete">
  <DeleteButton />
</CanAccess>
```

---

## 🎯 Cách 2: Direct Permission Checking

### A. Hook usePermissions

```tsx
import { usePermissions } from '@/hooks/usePermissions';

const MyComponent = () => {
  const { checkPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  return (
    <div>
      {checkPermission("user:create") && (
        <Button>Tạo User</Button>
      )}
      
      {hasAnyPermission(["dish:browse", "dish:create"]) && (
        <Button>Quản lý món ăn</Button>
      )}
      
      {hasAllPermissions(["user:create", "user:update"]) && (
        <Button>Quản lý user đầy đủ</Button>
      )}
    </div>
  );
};
```

### B. PermissionWrapper Components

```tsx
import { PermissionWrapper, MultiplePermissionWrapper } from '@/components/PermissionWrapper';

// Single permission
<PermissionWrapper permission="dish:create">
  <Button>Tạo món ăn</Button>
</PermissionWrapper>

// Multiple permissions (OR logic)
<MultiplePermissionWrapper 
  permissions={["bill:browse", "dish:browse"]}
  requireAll={false}
>
  <Button>Xem báo cáo</Button>
</MultiplePermissionWrapper>

// Multiple permissions (AND logic)
<MultiplePermissionWrapper 
  permissions={["user:create", "user:update"]}
  requireAll={true}
>
  <Button>Quản lý user</Button>
</MultiplePermissionWrapper>
```

### C. Higher-Order Components (HOC)

```tsx
import { withPermission, withMultiplePermissions } from '@/components/PermissionWrapper';

// Wrap component với single permission
const ProtectedCreateButton = withPermission(
  CreateButton, 
  "user:create",
  <div>Không có quyền tạo</div>
);

// Wrap component với multiple permissions
const ProtectedAdminPanel = withMultiplePermissions(
  AdminPanel,
  ["user:browse", "role:browse"],
  true, // requireAll = true
  <NoPermission />
);
```

---

## 🛠️ Components đã tạo

### 1. **usePermissions Hook**
- `checkPermission(permission: string)` - Kiểm tra 1 quyền
- `hasAnyPermission(permissions: string[])` - Có ít nhất 1 quyền (OR)
- `hasAllPermissions(permissions: string[])` - Có tất cả quyền (AND)
- `isSuperAdmin()` - Kiểm tra superadmin
- `isAuthenticated()` - Kiểm tra đã đăng nhập

### 2. **PermissionWrapper Components**
- `PermissionWrapper` - Wrap với 1 permission
- `MultiplePermissionWrapper` - Wrap với nhiều permissions
- `withPermission` - HOC cho 1 permission
- `withMultiplePermissions` - HOC cho nhiều permissions

### 3. **NoPermission Component**
- Component hiển thị thông báo đẹp khi không có quyền
- Có nút "Quay lại" tùy chỉnh
- UI thân thiện với user

### 4. **Menu System với Permissions**
- File `src/config/menu.ts` - Cấu hình menu với permissions
- Auto-filter menu theo quyền user
- Hỗ trợ nested menu items

---

## 📍 Các Permission Resources & Actions

### Resources hiện có:
- `user` - Quản lý nhân viên
- `role` - Phân quyền
- `customer` - Quản lý khách hàng
- `dish` - Quản lý món ăn
- `dish-category` - Quản lý danh mục món ăn
- `table` - Quản lý bàn
- `reservation` - Quản lý đặt bàn
- `bill` - Quản lý hóa đơn
- `promotion` - Quản lý khuyến mãi
- `ingredient` - Quản lý nguyên liệu
- `enter-ingredient` - Quản lý nhập nguyên liệu
- `export-ingredient` - Quản lý xuất nguyên liệu
- `site-setting` - Quản lý cấu hình

### Actions phổ biến:
- `browse` - Xem danh sách
- `read` - Xem chi tiết
- `create` - Tạo mới
- `update` - Cập nhật
- `delete` - Xóa

---

## 📝 Ví dụ thực tế

### 1. Role List Page với Permission Buttons
```tsx
const actionsRender = useCallback((_: unknown, record: Role) => {
  return (
    <Space>
      <CanAccess resource="role" action="update">
        <EditButton recordItemId={record.id} />
      </CanAccess>
      <CanAccess resource="role" action="read">
        <ShowButton recordItemId={record.id} />
      </CanAccess>
      <CanAccess resource="role" action="delete">
        <DeleteButton recordItemId={record.id} />
      </CanAccess>
    </Space>
  );
}, []);
```

### 2. Page với Multiple Approaches
```tsx
// Cách 1: CanAccess
<CanAccess resource="role" action="create">
  <CreateRolePage />
</CanAccess>

// Cách 2: PermissionWrapper
<PermissionWrapper permission="role:create">
  <CreateRolePage />
</PermissionWrapper>

// Cách 3: Hook
const { checkPermission } = usePermissions();
if (!checkPermission("role:create")) {
  return <NoPermission />;
}
return <CreateRolePage />;
```

### 3. Sidebar Menu tự động filter
```tsx
// File: src/components/app/app-sidebar.tsx
const { checkPermission } = usePermissions();

const filteredMainMenu = useMemo(() => {
  return filterMenuByPermissions(mainMenuItems, checkPermission);
}, [checkPermission]);

<NavMain items={filteredMainMenu} />
```

---

## 🎮 Demo Page

Truy cập `/admin/role/demo` để xem demo đầy đủ các cách sử dụng permission system.

Demo bao gồm:
- ✅ Tất cả cách sử dụng CanAccess
- ✅ Tất cả cách sử dụng PermissionWrapper
- ✅ Tất cả cách sử dụng usePermissions hook
- ✅ Examples với code mẫu
- ✅ Thông tin user hiện tại

---

## 🔧 Configuration

### Access Control Provider
File: `src/providers/access-control-provider.ts`
- Tích hợp với auth store
- Support superadmin bypass
- Format permission: `"resource:action"`

### Auth Provider
File: `src/providers/auth-provider.ts`  
- Fetch user với permissions từ API `/@me`
- Fetch permissions structure từ API `/permissions`

### Menu Configuration
File: `src/config/menu.ts`
- Cấu hình menu items với permissions
- Function filter menu theo user permissions

---

## 📱 Best Practices

### ✅ DO's:
1. **LUÔN** check superadmin trước
2. **LUÔN** có fallback UI khi không có quyền
3. **LUÔN** sử dụng loading state
4. **LUÔN** handle 401/403 errors
5. **LUÔN** sử dụng computed properties cho performance

### ❌ DON'Ts:
1. **KHÔNG** hardcode role names
2. **KHÔNG** assume user luôn có quyền  
3. **KHÔNG** hiển thị UI rồi mới check permission
4. **KHÔNG** quên handle loading/error states
5. **KHÔNG** bypass permission checks ở frontend

---

## 🚀 Usage Summary

| Trường hợp | Nên dùng |
|------------|----------|
| Wrap toàn bộ page/route | `CanAccess` hoặc `PermissionWrapper` |
| Conditional rendering buttons | `usePermissions` hook |
| Multiple permissions logic | `MultiplePermissionWrapper` |
| Menu filtering | `filterMenuByPermissions` function |
| Reusable components | HOC `withPermission` |
| Custom fallback UI | `PermissionWrapper` + `NoPermission` |

---

## 🔗 Files liên quan

- `/src/hooks/usePermissions.ts` - Main permission hook
- `/src/components/PermissionWrapper.tsx` - Wrapper components & HOCs
- `/src/components/canAccess.tsx` - Enhanced CanAccess component  
- `/src/components/NoPermission.tsx` - No permission UI component
- `/src/config/menu.ts` - Menu configuration with permissions
- `/src/providers/access-control-provider.ts` - Access control logic
- `/src/pages/admin/role/demo-permissions.tsx` - Live demo page

**Hệ thống phân quyền đã hoàn thiện! 🎉** 