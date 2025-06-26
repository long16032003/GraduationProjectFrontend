import { Navigate, Outlet } from 'react-router';
import { Authenticated } from '@refinedev/core';
import React from 'react';
import auth$ from '@/stores/auth';

export function Auth() {
  return (
    <div className="" data-layout="auth">
      {/* <Authenticated key='auth' fallback={<Outlet />}>
        <Navigate to={'/admin'} />
      </Authenticated> */}
      <Outlet />
    </div>
  );
}