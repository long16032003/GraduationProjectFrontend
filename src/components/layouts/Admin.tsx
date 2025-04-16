import { Outlet } from 'react-router';
import { Authenticated } from '@refinedev/core';
import { CatchAllNavigate } from '@refinedev/react-router';
import { AppSidebar } from '@/components/app/app-sidebar.tsx';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.tsx';
import { AppHeader } from '@/components/app/app-header.tsx';

// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example

export function Admin() {
  return (
    <div className="admin-layout">
      <Authenticated key={'admin-auth'} fallback={<CatchAllNavigate to="/auth/login" />}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </Authenticated>
    </div>
  );
}