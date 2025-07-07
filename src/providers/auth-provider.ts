import { httpClient } from '@/utils/http';
import type { AuthActionResponse, AuthProvider, CheckResponse, IdentityResponse, OnErrorResponse, PermissionResponse } from '@refinedev/core';
import { FetchError } from 'ofetch';
import auth$ from '@/stores/auth.ts';
import type { Customer, LoginFormValues, PermissionsResponse, RegisterFormValues, Staff } from '@/types';
import HttpStatusCode from '@/utils/http-status-codes.ts';
import { message } from 'antd';
import { DEFAULT_ERROR_MESSAGES } from '@/utils/error-handler';

export const authProvider: AuthProvider = {
  check: async (): Promise<CheckResponse> => {
    const user = auth$.user.get();
    return { authenticated: Boolean(user) };
  },
  logout: async (): Promise<AuthActionResponse> => {
    auth$.user.set(null)
    const guard = auth$.guard.peek()
    console.log(guard);
    httpClient(guard === 'staff' ? 'logout' : 'logout-customer', { method: 'post' })
      .catch((error: FetchError) => {
        // Handle the error if needed
        if (error instanceof FetchError) {
          if (error.statusCode === HttpStatusCode.UNAUTHORIZED) {
            // 401: Already logged out
            auth$.user.set(null)
            message.success('Bạn đã bị đăng xuất');
          }
        } else {
          console.error('Logout error:', error);
        }
      })
    // We're returning success: true to indicate that the logout operation was successful.
    return { success: true };
  },
  getIdentity: async (): Promise<IdentityResponse> => {
    try {
      const user: Staff = await httpClient('@me');
      auth$.user.set(user)
      return user;
    } catch (error) {
      return null;
    }
  },
  getPermissions: async (): Promise<PermissionResponse> => {
    return await httpClient('permissions', { method: 'get' }) as PermissionsResponse;
  },
  register: async ({ redirectPath, ...rest }: RegisterFormValues): Promise<AuthActionResponse> => {
    await httpClient('register', { method: 'post', body: rest });

    return {
      success: true,
      redirectTo: redirectPath,
      successNotification: {
        message: "Registration Successful",
        // description: "You have successfully registered.",
      },
    };
  },
  login: async ({ redirectPath, ...rest }: LoginFormValues): Promise<AuthActionResponse> => {
    await httpClient('login', { method: 'post', body: rest });
    // After a successful login, we can fetch the user data
    const user = await httpClient('@me');
    console.log("login: ", user);
    // Set the user data in the auth store
    auth$.user.set(user)
    auth$.guard.set('staff')
    // Return a success response
    return {
      success: true,
      redirectTo: redirectPath,
      successNotification: {
        message: "Đăng nhập thành công",
        // description: "You have successfully logged in.",
      },
    };
  },
  // forgotPassword: undefined,
  // updatePassword: undefined,
  onError: async (error: Error | FetchError): Promise<OnErrorResponse> => {
    console.log('[authProvider] onError', error);
    if (error instanceof FetchError) {
      // Logout the user if the error is 401 Unauthorized
      if (error.status === HttpStatusCode.UNAUTHORIZED) {
        auth$.user.set(null)
        return {
          redirectTo: '/login',
          logout: true,
          error: {
            name: 'Phiên đăng nhập hết hạn',
            message: DEFAULT_ERROR_MESSAGES.UNAUTHORIZED,
          },
        };
      }
    }

    return {
      error
    }
  },
};