import { Outlet } from 'react-router';

export function Guest () {
  return (
    <div className="guest-layout">
      <Outlet />
    </div>
  );
}