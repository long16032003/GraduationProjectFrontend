import { $http } from '@/utils/http';
import type { AuthProvider } from '@refinedev/core';
import { FetchError } from 'ofetch';

type Credentials = {
  email: string;
  password: string;
};

export const authProvider: AuthProvider = {
  // check: {},
  // forgotPassword: undefined,
  // getIdentity: undefined,
  // getPermissions: undefined,
  // logout: {},
  // onError: {},
  // register: undefined,
  // updatePassword: undefined,
  login: async (params: Credentials) => {
    try {
      await $http('login', { method: 'post', body: params })
      const response = await $http('@me');
      const user = await response.json();

      if (user) {
        localStorage.setItem("auth", JSON.stringify(user));
        return {
          success: true,
          redirectTo: "/admin",
          successNotification: {
            message: "Login Successful",
            description: "Welcome back!",
          }
        };
      }

      return {
        success: false,
        error: {
          message: "Login Error",
          name: "Invalid response",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as FetchError,
      };
    }
  }
};