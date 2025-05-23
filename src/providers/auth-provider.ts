import { httpClient } from '@/utils/http';
import type { AuthActionResponse, AuthProvider, CheckResponse, IdentityResponse, OnErrorResponse, PermissionResponse } from '@refinedev/core';
import { FetchError } from 'ofetch';
import auth$ from '@/stores/auth.ts';
import type { LoginFormValues, PermissionsResponse, RegisterFormValues, User } from '@/types';
import HttpStatusCode from '@/utils/http-status-codes.ts';

export const authProvider: AuthProvider = {
  check: async (): Promise<CheckResponse> => {
    const user = auth$.user.get();
    return { authenticated: Boolean(user) };
  },
  logout: async (): Promise<AuthActionResponse> => {
    auth$.user.set(null)
    httpClient('logout', { method: 'post' })
      .catch((error: FetchError) => {
        // Handle the error if needed
        if (error instanceof FetchError) {
          if (error.statusCode === HttpStatusCode.UNAUTHORIZED) {
            // 401: Already logged out
            auth$.user.set(null)
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
      const user: User = await httpClient('@me');
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
    // Set the user data in the auth store
    auth$.user.set(user)
    // Return a success response
    return {
      success: true,
      redirectTo: redirectPath,
      successNotification: {
        message: "Login Successful",
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
            name: 'Session Expired',
            message: 'Your session has expired. Please log in again.',
          },
        };
      }
    }

    return {
      error
    }
  },
};