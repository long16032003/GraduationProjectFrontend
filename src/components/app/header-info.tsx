import React, { useState, useEffect } from 'react';
import { Clock, Users, UtensilsCrossed, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import { useBreadcrumb } from '@refinedev/core';
import auth$ from '@/stores/auth';

const HeaderInfo = ({ className }: { className?: string }) => {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const { breadcrumbs } = useBreadcrumb();
  const user = auth$.user.peek();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentPageTitle = () => {
    if (breadcrumbs.length > 0) {
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      return lastBreadcrumb.label.charAt(0).toUpperCase() + lastBreadcrumb.label.slice(1);
    }
    return 'Quản lý nhà hàng';
  };

  const getGreeting = () => {
    const hour = currentTime.hour();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      {/* Left - Current Page & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-foreground">
            {getCurrentPageTitle()}
          </h2>
          <p className="text-xs text-muted-foreground">
            {getGreeting()}, {user?.name}
          </p>
        </div>
      </div>

      {/* Center - Quick Stats */}
      <div className="hidden md:flex items-center gap-4 px-4">
        <div className="flex items-center gap-2 text-xs">
          <Clock className="h-3 w-3 text-blue-500" />
          <span className="text-muted-foreground">
            {currentTime.format('HH:mm:ss')}
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="h-3 w-3 text-green-500" />
          <span className="text-muted-foreground">
            {currentTime.format('DD/MM/YYYY')}
          </span>
        </div>
      </div>

      {/* Right - System Status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-muted-foreground hidden sm:inline">
            Hoạt động
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeaderInfo; 