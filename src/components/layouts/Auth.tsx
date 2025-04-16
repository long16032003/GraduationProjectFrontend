// import { Authenticated, useActiveAuthProvider, useIsAuthenticated, useRouterType } from '@refinedev/core';
import { Outlet } from 'react-router';
// import { NavigateToResource } from '@refinedev/react-router';

export function Auth() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10" data-layout="auth">
      <Outlet />
      {/*<Authenticated*/}
      {/*  key='auth'*/}
      {/*  fallback={<Outlet />}*/}
      {/*>*/}
      {/*  <NavigateToResource resource='dashboard' />*/}
      {/*</Authenticated>*/}
    </div>
  );
}