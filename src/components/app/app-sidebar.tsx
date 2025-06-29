import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  LampDesk,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  SquareUserRound,
  Table,
} from "lucide-react"

import { NavMain } from "@/components/app/nav-main.tsx"
import { NavProjects } from "@/components/app/nav-projects.tsx"
import { NavSecondary } from "@/components/app/nav-secondary.tsx"
import { NavUser } from "@/components/app/nav-user.tsx"
// import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar.tsx';
import { mainMenuItems, secondaryMenuItems, filterMenuByPermissions } from '@/config/menu';
import { usePermissions } from '@/hooks/usePermissions';
import { useMemo } from 'react';

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  projects: [
    // {
    //   name: "Bàn ăn",
    //   url: "/admin/tables",
    //   icon: TableProperties,
    // },
  ],
}

const isMobile = false
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { checkPermission } = usePermissions();

  // Filter menu items based on user permissions
  const filteredMainMenu = useMemo(() => {
    return filterMenuByPermissions(mainMenuItems, checkPermission);
  }, [checkPermission]);

  const filteredSecondaryMenu = useMemo(() => {
    return filterMenuByPermissions(secondaryMenuItems, checkPermission);
  }, [checkPermission]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <img src="/logo_restaurant.jpg" alt="logo" className="w-full h-full object-cover" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">BamBoo Sông Chanh</span>
                  <span className="truncate text-xs">Nhà hàng</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/*<TeamSwitcher teams={data.teams} />*/}
      </SidebarHeader>
      <SidebarContent>
        {/* <NavProjects projects={data.projects} /> */}
        <NavMain items={filteredMainMenu} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={filteredSecondaryMenu} className="mt-auto p-0" />
        {isMobile && <NavUser user={data.user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
