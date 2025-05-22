import { httpClient } from '@/utils/http';
import type { AuthActionResponse, AuthProvider, CheckResponse, IdentityResponse, OnErrorResponse, PermissionResponse } from '@refinedev/core';
import { FetchError } from 'ofetch';
import auth$ from '@/stores/auth.ts';
import type { LoginFormValues, RegisterFormValues, User } from '@/types';
import HttpStatusCode from '@/utils/http-status-codes.ts';

export const authProvider: AuthProvider = {
  check: async (): Promise<CheckResponse> => {
    const user = auth$.user.get() as User;
    return { authenticated: Boolean(user) };
  },
  logout: async (): Promise<AuthActionResponse> => {
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
  getIdentity: async (): Promise<IdentityResponse> => {
    try {
      const user = await httpClient('@me');
      auth$.user.set(user)
      return user;
    } catch (error) {
      return null;
    }
  },
  getPermissions: async (): Promise<PermissionResponse> => {
    const response = await httpClient('permissions', { method: 'get'});
    console.log('[authProvider] getPermissions', response);
    return response
  },
  register:  async (params: RegisterFormValues): Promise<AuthActionResponse> => {
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
  login: async (params: LoginFormValues): Promise<AuthActionResponse> => {
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
  // forgotPassword: undefined,
  // updatePassword: undefined,
  onError: async (error: Error|FetchError): Promise<OnErrorResponse>  => {
    console.log('[authProvider] onError', error);
    if (error instanceof FetchError) {
      if (error.status === HttpStatusCode.UNPROCESSABLE_ENTITY) {
        // 422: Validation error
        return {
          error: {
            name: 'Validation Error',
            message: 'Validation error',
          },
        };
      }

      if (error.status === HttpStatusCode.UNAUTHORIZED) {
        auth$.user.set(null)
        return {
          redirectTo: '/login',
          logout: true,
          error: {
            message: 'Unauthorized',
            name: 'Login Error',
          },
        };
      }
    }

    return {}
  },
};