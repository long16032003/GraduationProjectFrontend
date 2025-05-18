import { httpClient } from '@/utils/http';
import type { AuthProvider } from '@refinedev/core';
import { FetchError } from 'ofetch';
import auth$ from '@/stores/auth.ts';

type Credentials = {
  email: string;
  password: string;
};

export const authProvider: AuthProvider = {
  check: async () => {
    const user = auth$.user.get();

    return { authenticated: Boolean(user) };
  },
  logout: async () => {
    try {
      await httpClient('logout', { method: 'post'});
      auth$.user.set(null)
      // We're returning success: true to indicate that the logout operation was successful.
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Whoops, something went wrong.',
          name: 'Logout Error',
        },
      };
    }
  },
  getIdentity: async () => {
    try {
      const user = await httpClient('@me');
      auth$.user.set(user)
      return user;
    } catch (error) {
      return null;
    }
  },
  // forgotPassword: undefined,
  // getIdentity: undefined,
  // getPermissions: undefined,
  // logout: {},
  // onError: {},
  register:  async (params) => {
    try {
      await httpClient('register', { method: 'post', body: params });

      return {
        success: true,
        redirectTo: '/login',
        successNotification: {
          message: 'Login Successful',
          description: 'Welcome back!',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as FetchError,
      };
    }
  },
  // updatePassword: undefined,
  login: async (params: Credentials) => {
    try {
      await httpClient('login', { method: 'post', body: params });
      const user = await httpClient('@me');

      if (user) {
        auth$.user.set(user)
        return {
          success: true,
          redirectTo: '/admin',
          successNotification: {
            message: 'Login Successful',
            description: 'Welcome back!',
          },
        };
      }

      return {
        success: false,
        error: {
          message: 'Invalid response',
          name: 'Login Error',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as FetchError,
      };
    }
  },
};