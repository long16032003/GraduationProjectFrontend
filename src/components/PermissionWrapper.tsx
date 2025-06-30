import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { NoPermission } from '@/components/NoPermission';

interface PermissionWrapperProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  requireAll?: boolean; // Cho trường hợp nhiều permissions
}

interface MultiplePermissionWrapperProps {
  permissions: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
  requireAll?: boolean; // true = AND, false = OR
}

/**
 * Component wrapper đơn giản để check 1 permission
 */
export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  permission,
  fallback = <NoPermission />,
  children,
}) => {
  const { checkPermission } = usePermissions();

  if (!checkPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Component wrapper để check nhiều permissions
 */
export const MultiplePermissionWrapper: React.FC<MultiplePermissionWrapperProps> = ({
  permissions,
  fallback = <NoPermission />,
  children,
  requireAll = false,
}) => {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  const hasPermission = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * HOC để wrap component với permission
 */
export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  permission: string,
  fallback?: React.ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <PermissionWrapper permission={permission} fallback={fallback}>
        <Component {...props} />
      </PermissionWrapper>
    );
  };
}

/**
 * HOC để wrap component với nhiều permissions
 */
export function withMultiplePermissions<T extends object>(
  Component: React.ComponentType<T>,
  permissions: string[],
  requireAll = false,
  fallback?: React.ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <MultiplePermissionWrapper 
        permissions={permissions} 
        requireAll={requireAll}
        fallback={fallback}
      >
        <Component {...props} />
      </MultiplePermissionWrapper>
    );
  };
} 