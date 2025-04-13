import { Outlet } from 'react-router';
import { Authenticated } from '@refinedev/core';
import { CatchAllNavigate } from '@refinedev/react-router';

export function Admin() {
  return (
    <div className="admin-layout">
      <Authenticated key={'admin-auth'} fallback={<CatchAllNavigate to="/auth/login" />}>
        <Outlet />
      </Authenticated>
    </div>
  );
}