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
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';

export function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/03.png" alt="@shadcn" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">shadcn</p>
            <p className="text-xs leading-none text-muted-foreground">
              m@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Log out
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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
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


export function DefaultHeaderContent() {
  return (
    <Fragment>
      <div className="flex items-center gap-2 w-1/3 justify-start" data-element="header-start">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>
      <div className="flex items-center flex-1" data-element="header-center">
        <SearchForm className="w-full" />
      </div>
      <div className="flex items-center gap-3 w-1/3 justify-end" data-element="header-end">
        <NotificationNav />
        <UserNav />
      </div>
    </Fragment>
  );
}

export function AppHeader(props: React.ComponentProps<'header'>) {
  return (
    <header
      className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background z-10 h-12 overflow-hidden flex-wrap justify-between px-2">
      {props.children ?? <DefaultHeaderContent />}
    </header>
  );
}