import {
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
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: string; // Required permission
  isActive?: boolean;
  items?: Omit<MenuItem, 'icon' | 'isActive'>[];
}

// Cấu hình menu chính với permissions
export const mainMenuItems: MenuItem[] = [
  {
    title: "Bảng điều khiển",
    url: "/admin",
    icon: LayoutDashboard,
    isActive: true,
    permission: "statistic:browse",
    // Không có permission - public cho tất cả admin
  },
  {
    title: "Bàn ăn",
    url: "/admin/tables",
    icon: TableProperties,
    permission: "table:create",
    isActive: true,
  },
  {
    title: "Đặt bàn",
    url: "/admin/reservations",
    icon: CalendarCheck,
    permission: "reservation:browse",
    isActive: true,
  },
  {
    title: "Danh mục thực đơn",
    url: "/admin/dishcategories",
    icon: ListOrdered,
    permission: "dish-category:create",
    isActive: true,
  },
  {
    title: "Thực đơn",
    url: "/admin/dish",
    icon: UtensilsCrossed,
    permission: "dish:create",
    isActive: true,
  },
  {
    title: "Hóa đơn",
    url: "/admin/bills",
    icon: Receipt,
    permission: "bill:browse",
    isActive: true,
  },
  {
    title: "Gọi món",
    url: "/admin/order",
    icon: ClipboardList,
    permission: "bill:create", // Permission để tạo order/bill
    isActive: true,
  },
  {
    title: "Bếp",
    url: "/admin/kitchen",
    icon: ChefHat,
    permission: "bill:update", // Permission để update trạng thái order
    isActive: true,
  },
  {
    title: "Nhân viên",
    url: "/admin/staffs",
    icon: Users,
    permission: "user:browse",
    isActive: true,
  },
  {
    title: "Khách hàng",
    url: "/admin/customers",
    icon: UserCircle,
    permission: "customer:create",
    isActive: true,
  },
  {
    title: "Bài viết",
    url: "/admin/posts",
    icon: FileText,
    permission: "post:create",
    isActive: true,
  },
  {
    title: "Ưu đãi",
    url: "/admin/promotions",
    icon: Tag,
    permission: "promotion:create",
    isActive: true,
  },
  {
    title: "Kho",
    url: "#",
    icon: PackageSearch,
    permission: "ingredient:browse",
    isActive: true,
    items: [
      {
        title: "Quản lý nguyên liệu",
        url: "/admin/warehouse/ingredient",
        permission: "ingredient:browse",
      },
      {
        title: "Nhập kho",
        url: "/admin/warehouse/import",
        permission: "enter-ingredient:browse",
      },
      {
        title: "Xuất kho",
        url: "/admin/warehouse/export",
        permission: "export-ingredient:browse",
      },
      {
        title: "Kiểm kho",
        url: "/admin/warehouse/inventory",
        permission: "ingredient:browse",
      },
    ],
  },
  {
    title: "Thống kê",
    url: "#",
    icon: LayoutDashboard,
    permission: "statistic:browse", // Cần quyền xem bill để xem thống kê
    isActive: false,
    items: [
      {
        title: "Thống kê tổng quan",
        url: "/admin/statistic",
        permission: "statistic:browse",
      },
      {
        title: "Thống kê doanh thu",
        url: "/admin/statistic/statistic-bill",
        permission: "statistic:browse",
      },
      {
        title: "Thống kê món ăn được gọi nhiều nhất",
        url: "#",
        permission: "statistic:browse",
      },
      {
        title: "Thống kê nguyên liệu",
        url: "#",
        permission: "statistic:browse",
      },
    ],
  },
  {
    title: "Phân quyền",
    url: "/admin/roles",
    icon: ShieldCheck,
    permission: "role:create",
    isActive: true,
  },
];

// Menu phụ (settings, v.v.)
export const secondaryMenuItems: MenuItem[] = [
  {
    title: "Cài đặt website",
    url: "/admin/site-settings",
    icon: Settings,
    permission: "site-setting:browse",
  },
];

/**
 * Filter menu items theo permissions của user
 * @param menuItems - Danh sách menu items
 * @param checkPermission - Function check permission
 * @returns Filtered menu items
 */
export const filterMenuByPermissions = (
  menuItems: MenuItem[],
  checkPermission: (permission: string) => boolean
): MenuItem[] => {
  return menuItems.filter(item => {
    // Nếu không có permission thì hiển thị (public menu)
    if (!item.permission) return true;
    
    // Kiểm tra permission của user
    const hasPermission = checkPermission(item.permission);
    
    // Nếu có sub-items, filter cả sub-items
    if (item.items && hasPermission) {
      item.items = item.items.filter(subItem => {
        if (!subItem.permission) return true;
        return checkPermission(subItem.permission);
      });
      
      // Nếu không còn sub-items nào sau khi filter thì ẩn parent
      return item.items.length > 0;
    }
    
    return hasPermission;
  });
}; 