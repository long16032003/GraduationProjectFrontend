import React from 'react';
import { UserNav } from '@/components/app/app-header.tsx';
import { cn } from '@/lib/utils.ts';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth.ts';
import { Button } from 'antd';
import { Link } from '@refinedev/core';
import HomePage from './home/home';
import { GiftOutlined, ShopOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layouts/HeaderMainLayout';


const mainMenuItems = [
  {
    title: "Thực đơn",
    icon: <ShopOutlined className="text-xl" />,
    description: "Khám phá các món ăn đặc sắc của nhà hàng",
    href: "/menu",
    // items: [
    //   {
    //     title: "Món mới",
    //     description: "Những món ăn mới nhất tại nhà hàng",
    //     href: "/menu/new"
    //   },
    //   {
    //     title: "Món đặc biệt",
    //     description: "Các món đặc sản nổi tiếng",
    //     href: "/menu/special"
    //   },
    //   {
    //     title: "Set menu",
    //     description: "Combo món ăn hấp dẫn",
    //     href: "/menu/sets"
    //   }
    // ]
  },
  {
    title: "Ưu đãi",
    icon: <GiftOutlined className="text-xl" />,
    description: "Các chương trình khuyến mãi hấp dẫn",
    href: "/promotions"
  },
  {
    title: "Bài viết",
    icon: <BookOutlined className="text-xl" />,
    href: "/posts"
  },
  {
    title: "Đặt bàn",
    icon: <BookOutlined className="text-xl" />,
    href: "/reservation"
  }
];

export function MainNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-2">
        {mainMenuItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            {item.items ? (
              <>
                <NavigationMenuTrigger className="bg-white/80 backdrop-blur-sm">
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.title}
                  </span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    {item.items.map((subItem) => (
                      <ListItem
                        key={subItem.title}
                        title={subItem.title}
                        href={subItem.href}
                      >
                        {subItem.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <Link to={item.href}>
                <NavigationMenuLink className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-white/80 backdrop-blur-sm"
                )}>
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.title}
                  </span>
                </NavigationMenuLink>
              </Link>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})

export function Home() {
  const user = use$(auth$.user)
  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  );
}
