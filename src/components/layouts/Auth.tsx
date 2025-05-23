import { Navigate, Outlet } from 'react-router';
import { Authenticated } from '@refinedev/core';
import React from 'react';

export function Auth() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10" data-layout="auth">
      <Authenticated key='auth' fallback={<Outlet />}>
        <Navigate to={'/admin'} />
      </Authenticated>
    </div>
  );
}