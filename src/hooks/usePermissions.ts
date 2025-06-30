import { useCallback } from 'react';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';
import type { Staff, Customer } from '@/types';

export const usePermissions = () => {
  const user = use$(auth$.user) as Staff | null;

  /**
   * Kiểm tra một quyền cụ thể
   * @param permission - Permission theo format "resource:action" (ví dụ: "user:create")
   * @returns boolean
   */
  const checkPermission = useCallback((permission: string): boolean => {
    // Superadmin có tất cả quyền
    if ((user as Staff)?.superadmin) return true;
    
    // Kiểm tra permission cụ thể
    return (user as Staff)?.permissions?.[permission] === 1;
  }, [user]);

  /**
   * Kiểm tra có ít nhất một quyền trong danh sách (OR)
   * @param permissions - Mảng các permissions
   * @returns boolean
   */
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if ((user as Staff)?.superadmin) return true;
    return permissions.some(perm => (user as Staff)?.permissions?.[perm] === 1);
  }, [user]);

  /**
   * Kiểm tra có tất cả quyền trong danh sách (AND)
   * @param permissions - Mảng các permissions
   * @returns boolean
   */
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if ((user as Staff)?.superadmin) return true;
    return permissions.every(perm => (user as Staff)?.permissions?.[perm] === 1);
  }, [user]);

  /**
   * Kiểm tra user có phải là superadmin không
   * @returns boolean
   */
  const isSuperAdmin = useCallback((): boolean => {
    return Boolean((user as Staff)?.superadmin);
  }, [user]);

  /**
   * Kiểm tra user đã đăng nhập chưa
   * @returns boolean
   */
  const isAuthenticated = useCallback((): boolean => {
    return Boolean(user);
  }, [user]);

  return {
    user,
    checkPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    isAuthenticated,
  };
}; 