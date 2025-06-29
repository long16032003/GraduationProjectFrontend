import type { RouteObject } from 'react-router';
import { Auth } from '@/components/layouts/Auth.tsx';
import LoginPage from '@/pages/auth/login';
import { RegisterPage } from '@/pages/auth/register';
import { ForgotPassword } from '@/pages/auth/forgot-password';
import { UpdatePassword } from '@/pages/auth/update-password';
import LoginCustomerPage from '@/pages/auth/login/loginCustomerPage';
import InfoUserPage from '@/pages/auth/info-user';

// https://remix.run/blog/lazy-loading-routes
// https://reactrouter.com/start/data/route-object#lazy
// https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v750
// https://reactrouter.com/start/data/routing#layout-routes

export const routes: RouteObject[] = [
  {
    Component: Auth,
    children: [
      { path: 'login', Component: LoginPage },
      { path: 'login-customer', Component: LoginCustomerPage },
      { path: 'register', Component: RegisterPage },
      { path: 'forgot-password', Component: ForgotPassword },
      { path: 'update-password', Component: UpdatePassword },
      { path: 'info-user', Component: InfoUserPage },
    ],
  },
];