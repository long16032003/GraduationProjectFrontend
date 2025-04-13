// import { Authenticated, useActiveAuthProvider, useIsAuthenticated, useRouterType } from '@refinedev/core';
import { Outlet } from 'react-router';
// import { NavigateToResource } from '@refinedev/react-router';

export function Auth () {
  return (
    <div className='auth-layout'>
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