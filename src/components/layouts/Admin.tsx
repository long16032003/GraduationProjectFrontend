import { Outlet } from 'react-router';
import { CatchAllNavigate } from '@refinedev/react-router';
import { AppSidebar } from '@/components/app/app-sidebar.tsx';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.tsx';
import { AppHeader } from '@/components/app/app-header.tsx';
// import { PageHeader } from '@/components/app/page-header.tsx';
import { Authenticated } from '@/components/authenticated';
import { useEffect } from 'react';
import { authProvider } from '@/providers/auth-provider.ts';

// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example

export function Admin() {
  // re-fetch user identity when page reload
  useEffect(() => {
    authProvider?.getIdentity?.();
  }, []);
  return (
    <div className="admin-layout">
      <Authenticated key={'admin-auth'} fallback={<CatchAllNavigate to="/login" />}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <div id="page-wraper" className="flex flex-col flex-1 relative px-5">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </Authenticated>
    </div>
  );
}