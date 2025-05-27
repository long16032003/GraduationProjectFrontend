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
  navMain: [
    {
      title: "Thống kê",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Quản lý hóa đơn",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Quản lý thực đơn",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Quản lý bàn",
      url: "/admin/tables",
      icon: Frame,
    },
    {
      name: "Quản lý đặt bàn",
      url: "/admin/reservations",
      icon: PieChart,
    },
    {
      name: "Quản lý danh mục thực đơn",
      url: "/admin/dishcategories",
      icon: Map,
    },
    {
      name: "Quản lý thực đơn",
      url: "/admin/dish",
      icon: Map,
    },
    {
      name: "Quản lý hóa đơn",
      url: "#",
      icon: Map,
    },
    {
      name: "Quản lý gọi món",
      url: "#",
      icon: Map,
    },
    {
      name: "Quản lý nhân viên",
      url: "#",
      icon: Map,
    },
    {
      name: "Quản lý khách hàng",
      url: "#",
      icon: Map,
    },
    {
      name: "Quản lý bài viết",
      url: "#",
      icon: Map,
    },
    {
      name: "Quản lý ưu đãi",
      url: "#",
      icon: Map,
    },
    {
      name: "Quản lý kho",
      url: "#",
      icon: Map,
    },
  ],
}

const isMobile = false
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
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
        <NavProjects projects={data.projects} />
        {/* <NavMain items={data.navMain} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.navSecondary} className="mt-auto p-0" />
        {isMobile && <NavUser user={data.user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
