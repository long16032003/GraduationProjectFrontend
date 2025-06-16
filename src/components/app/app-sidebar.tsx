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
  LayoutDashboard,
  TableProperties,
  CalendarCheck,
  ListOrdered,
  UtensilsCrossed,
  Receipt,
  ClipboardList,
  Users,
  UserCircle,
  FileText,
  Tag,
  PackageSearch,
  Settings,
  ChefHat,
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
      title: "Bàn ăn",
      url: "/admin/tables",
      icon: TableProperties,
      isActive: true,
    },
    {
      title: "Đặt bàn",
      url: "/admin/reservations",
      icon: CalendarCheck,
      isActive: true,
    },
    {
      title: "Danh mục thực đơn",
      url: "/admin/dishcategories",
      icon: ListOrdered,
      isActive: true,
    },
    {
      title: "Thực đơn",
      url: "/admin/dish",
      icon: UtensilsCrossed,
      isActive: true,
    },
    {
      title: "Hóa đơn",
      url: "/admin/bills",
      icon: Receipt,
      isActive: true,
    },
    {
      title: "Gọi món",
      url: "/admin/order",
      icon: ClipboardList,
      isActive: true,
    },
    {
      title: "Bếp",
      url: "/admin/kitchen",
      icon: ChefHat,
      isActive: true,
    },
    {
      title: "Nhân viên",
      url: "/admin/staffs",
      icon: Users,
      isActive: true,
    },
    {
      title: "Khách hàng",
      url: "/admin/customers",
      icon: UserCircle,
      isActive: true,
    },
    {
      title: "Bài viết",
      url: "/admin/posts",
      icon: FileText,
      isActive: true,
    },
    {
      title: "Ưu đãi",
      url: "/admin/promotions",
      icon: Tag,
      isActive: true,
    },
    {
      title: "Kho",
      url: "#",
      icon: PackageSearch,
      isActive: true,
      items: [
        {
          title: "Quản lý nguyên liệu",
          url: "/admin/warehouse/ingredient",
        },
        {
          title: "Nhập kho",
          url: "/admin/warehouse/import",
        },
        {
          title: "Xuất kho",
          url: "/admin/warehouse/export",
        },
        {
          title: "Kiểm kho",
          url: "/admin/warehouse/inventory",
        },
      ],
    },
    {
      title: "Thống kê",
      url: "#",
      icon: LayoutDashboard,
      isActive: false,
      items: [
        {
          title: "Thống kê doanh thu",
          url: "/admin/statistic/statistic-bill",
        },
        {
          title: "Thống kê món ăn được gọi nhiều nhất",
          url: "#",
        },
        {
          title: "Thống kê nguyên liệu",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Cài đặt website",
      url: "/admin/site-settings",
      icon: Settings,
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.navSecondary} className="mt-auto p-0" />
        {isMobile && <NavUser user={data.user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
