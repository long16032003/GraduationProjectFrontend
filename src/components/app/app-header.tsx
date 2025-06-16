import React, { Fragment } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { SearchForm } from '@/components/app/search-form.tsx';
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Bell, History } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { useBreadcrumb, useLogout } from '@refinedev/core';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';
import type { Customer, User } from '@/types.ts';
import { Link, useLocation } from 'react-router';
import { theme } from '@/config/theme';
import { UserOutlined, DashboardOutlined, HistoryOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';

interface UserNavProps {
  user: User | Customer
}

const {
  colorPrimary,
  colorBgContainer,
  colorTextBase,
  colorTextSecondary,
  colorBorderSecondary,
  borderRadius,
  boxShadow,
  fontFamily,
} = theme.token || {};

const getInitials = (name?: string): string => {
  if (!name) return '';
  
  // Tách tên thành các từ
  const words = name.trim().split(' ');
  
  if (words.length === 1) {
    // Nếu chỉ có một từ, lấy chữ cái đầu
    return words[0].charAt(0).toUpperCase();
  } else {
    // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
    const firstInitial = words[0].charAt(0);
    const lastInitial = words[words.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }
};

export function UserNav({user, ...rest}: UserNavProps) {
  const { mutate, isLoading } = useLogout();

  const handleLogout = () => {
    mutate()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full"
          style={{ borderRadius }}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/03.png" alt={user?.name} />
            <AvatarFallback style={{ 
              fontFamily,
              backgroundColor: colorPrimary,
              color: 'white' 
            }}>
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56" 
        align="end" 
        forceMount
        style={{
          backgroundColor: colorBgContainer,
          borderColor: colorBorderSecondary,
          boxShadow,
          fontFamily,
        }}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none" style={{ color: colorTextBase }}>
              {user?.name}
            </p>
            <p className="text-xs leading-none" style={{ color: colorTextSecondary }}>
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator style={{ backgroundColor: colorBorderSecondary }} />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className="hover:bg-primary/10"
            style={{ color: colorTextBase }}
          >
            <UserOutlined className="mr-2 h-4 w-4" />
            Thông tin cá nhân
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/admin" className="flex items-center">
              <DashboardOutlined className="mr-2 h-4 w-4" />
              Trang quản trị
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/history-reservation" className="flex items-center">
              <HistoryOutlined className="mr-2 h-4 w-4" />
              Lịch sử đặt bàn
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center">
            <SettingOutlined className="mr-2 h-4 w-4" />
            Cài đặt
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isLoading} className="flex items-center">
          <LogoutOutlined className="mr-2 h-4 w-4" />
          Đăng xuất
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NotificationNav() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-primary/10"
          style={{ color: colorTextBase }}
        >
          <Bell className="h-5 w-5" />
          <span 
            className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full ring-2" 
            style={{ 
              backgroundColor: colorPrimary,
              // ringColor: colorBgContainer 
            }} 
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        style={{
          backgroundColor: colorBgContainer,
          borderColor: colorBorderSecondary,
          boxShadow,
          fontFamily,
        }}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b px-3 py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs font-semibold text-primary hover:text-primary transition-colors"
                >
                  Mark all as read
                </Button>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="max-h-60 overflow-y-auto p-0">
            <div className="flex flex-col">
              {/* Unread notification */}
              <div className="flex items-start gap-2 border-b bg-muted/50 px-3 py-2 cursor-pointer">
                <span className="mt-1 flex h-2 w-2 rounded-full bg-rose-500" />
                <div className="grid flex-1 gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">New message from Sarah</p>
                    <span className="text-xs text-muted-foreground">2m ago</span>
                  </div>
                  <p className="text-sm/5 text-muted-foreground line-clamp-2 ">Hey, I wanted to check in about the project status hey, the project status hey I wanted to check in about the project status</p>
                </div>
              </div>

              {/* Unread notification */}
              <div className="flex items-start gap-2 border-b bg-muted/50 px-3 py-2 cursor-pointer">
                <span className="mt-1 flex h-2 w-2 rounded-full bg-rose-500" />
                <div className="grid flex-1 gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Your order has shipped</p>
                    <span className="text-xs text-muted-foreground">5h ago</span>
                  </div>
                  <p className="text-sm/4 text-muted-foreground line-clamp-2">
                    Order #12345 has been shipped and will arrive in 2-3 days.
                  </p>
                </div>
              </div>

              {/* Read notification */}
              <div className="flex items-start gap-2 border-b px-3 py-2 cursor-pointer">
                <div className="mt-1 flex h-2 w-2 rounded-full opacity-0" />
                <div className="grid flex-1 gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">New feature available</p>
                    <span className="text-xs text-muted-foreground">1d ago</span>
                  </div>
                  <p className="text-sm/4 text-muted-foreground line-clamp-2">
                    Check out the new dashboard view. Pages now load faster.
                  </p>
                </div>
              </div>

              {/* Read notification */}
              <div className="flex items-start gap-2 px-3 py-2 cursor-pointer">
                <div className="mt-1 flex h-2 w-2 rounded-full opacity-0" />
                <div className="grid flex-1 gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Account security alert</p>
                    <span className="text-xs text-muted-foreground">3d ago</span>
                  </div>
                  <p className="text-sm/4 text-muted-foreground line-clamp-2">
                    Your account password was changed. If this wasn't you, please contact support.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t p-0">
            <Button variant="ghost" className="h-9 w-full rounded-none text-sm font-medium">
              View all notifications
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

const AppBreadcrumb = () => {
  const { breadcrumbs } = useBreadcrumb();
  const location = useLocation();

  // Nếu ở trang chủ thì không hiển thị breadcrumb
  if (location.pathname === '/') {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={`${breadcrumb.label}-${index}`}>
            {index < breadcrumbs.length - 1 ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={breadcrumb.href || '#'}>
                    {/* Capitalize first letter */}
                    {breadcrumb.label.charAt(0).toUpperCase() + breadcrumb.label.slice(1)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {breadcrumb.label.charAt(0).toUpperCase() + breadcrumb.label.slice(1)}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};


export function DefaultHeaderContent() {
  const user = use$(auth$.user)

  return (
    <Fragment>
      <div className="flex items-center gap-2 lg:w-1/3 justify-start" data-element="header-start">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <AppBreadcrumb />
      </div>
      <div className="flex items-center flex-1" data-element="header-center">
        <SearchForm className="w-full" />
      </div>
      <div className="flex items-center gap-3 lg:w-1/3 justify-end" data-element="header-end">
        <NotificationNav />
        {!!user && <UserNav user={user}/>}
      </div>
    </Fragment>
  );
}

export function AppHeader(props: React.ComponentProps<'header'>) {
  return (
    <header
      style={{
        fontFamily,
        backgroundColor: colorBgContainer,
        borderColor: colorBorderSecondary,
        boxShadow,
      }}
      className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background/70 backdrop-blur-sm z-10 h-12 overflow-hidden flex-wrap justify-between px-3"
    >
      {props.children ?? <DefaultHeaderContent />}
    </header>
  );
}

// Tạo một custom hook để sử dụng theme tokens
const useThemeTokens = () => {
  return {
    colorPrimary,
    colorBgContainer,
    colorTextBase,
    colorTextSecondary,
    colorBorderSecondary,
    borderRadius,
    boxShadow,
    fontFamily,
  };
};

// Export hook để các components khác có thể sử dụng
export { useThemeTokens };