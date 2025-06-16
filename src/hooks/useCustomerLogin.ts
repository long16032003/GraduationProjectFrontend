import { authProvider } from "@/providers/auth-provider";
import { type RefineError, type AuthActionResponse, useInvalidateAuthStore, useGo, useParsed, useNotification, useKeys, type OpenNotificationParams, type SuccessNotificationResponse } from "@refinedev/core";
import type { UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { httpClient } from "@/utils/http";
import type { LoginCustomerFormValues } from "@/types";
import auth$ from "@/stores/auth";

export type TLoginData = void | false | string | object;

export type UseCustomerLoginProps<TVariables> = {
  onSuccess?: (data: AuthActionResponse) => Promise<void>;
  onError?: (error: Error | RefineError) => Promise<void> | void;
  mutationOptions?: Omit<
    UseMutationOptions<
      AuthActionResponse,
      Error | RefineError,
      TVariables,
      unknown
    >,
    "mutationFn"
  >;
};

export type UseCustomerLoginCombinedProps<TVariables> = {
  onSuccess?: (data: AuthActionResponse) => Promise<void>;
  onError?: (error: Error | RefineError) => void;
  mutationOptions?: Omit<
    UseMutationOptions<
      AuthActionResponse | TLoginData,
      Error | RefineError,
      TVariables,
      unknown
    >,
    "mutationFn"
  >;
};

export type UseCustomerLoginReturnType<TVariables> = UseMutationResult<
  AuthActionResponse,
  Error | RefineError,
  TVariables,
  unknown
>;

export type UseCustomerLoginCombinedReturnType<TVariables> = UseMutationResult<
  AuthActionResponse | TLoginData,
  Error | RefineError,
  TVariables,
  unknown
>;

export function useCustomerLogin<TVariables = object>(
  props?: UseCustomerLoginProps<TVariables>,
): UseCustomerLoginReturnType<TVariables>;

export function useCustomerLogin<TVariables = object>(
  props?: UseCustomerLoginCombinedProps<TVariables>,
): UseCustomerLoginCombinedReturnType<TVariables>;

/**
 * `useCustomerLogin` is a custom hook for customer login that uses a different API endpoint.
 *
 * @typeParam TVariables - Values for mutation function. default `{}`
 *
 */
export function useCustomerLogin<TVariables = object>(
  props?: UseCustomerLoginProps<TVariables> | UseCustomerLoginCombinedProps<TVariables>
): UseCustomerLoginReturnType<TVariables> | UseCustomerLoginCombinedReturnType<TVariables> {
  const { mutationOptions, onError, onSuccess } = props || {};
  const invalidateAuthStore = useInvalidateAuthStore();
  const go = useGo();
  const parsed = useParsed();
  const { close, open } = useNotification();
  const { keys, preferLegacyKeys } = useKeys();

  const to = React.useMemo(() => {
    return parsed.params?.to;
  }, [parsed.params]);

  // Customer login function that calls the customer-specific endpoint
  const customerLogin = async (variables: TVariables) => {
    try {
      // Use the customer-specific endpoint
      const response = await httpClient('login-customer', { 
        method: 'post', 
        body: variables as Record<string, unknown>
      });
      
      // Get user data after login
      const user = await httpClient('@customer');
      
      // Set user data in auth store
      auth$.user.set(user);
      auth$.guard.set('customer');
      
      // Return success response with redirection to home page
      return {
        success: true,
        redirectTo: '/',
        successNotification: {
          message: "Đăng nhập thành công",
        },
      };
    } catch (error) {
      console.error("Customer login error:", error);
      throw error;
    }
  };

  const mutation = useMutation<
    AuthActionResponse,
    Error | RefineError,
    TVariables,
    unknown
  >({
    mutationKey: keys().auth().action("customer-login").get(preferLegacyKeys),
    mutationFn: customerLogin,
    onSuccess: async ({ success, redirectTo, error, successNotification }) => {
      if (success) {
        close?.("login-error");

        if (successNotification) {
          open?.(buildSuccessNotification(successNotification));
        }

        // await invalidateAuthStore();
      }

      await onSuccess?.({ success, redirectTo, error, successNotification });

      if (error || !success) {
        open?.(buildNotification(error));
      }

      if (to && success) {
        go({ to: to as string, type: "replace" });
      } else if (redirectTo) {
        go({ to: redirectTo, type: "replace" });
      } else {
        // If no redirectTo, go to home page instead of admin
        go({ to: "/", type: "replace" });
      }
    },
    onError: async (error: RefineError | Error) => {
      console.error("Customer login mutation error:", error);
      open?.(buildNotification(error));
      await onError?.(error);
    },
    ...mutationOptions,
  });

  return mutation;
}

export const buildNotification = (
  error?: Error | RefineError,
): OpenNotificationParams => {
  return {
    message: error?.name || "Lỗi đăng nhập",
    description: error?.message || "Thông tin đăng nhập không chính xác",
    key: "login-error",
    type: "error",
  };
};

export const buildSuccessNotification = (
  successNotification: SuccessNotificationResponse,
): OpenNotificationParams => {
  return {
    message: successNotification.message || "Đăng nhập thành công",
    description: successNotification.description || "Bạn đã đăng nhập thành công",
    key: "login-success",
    type: "success",
  };
}; 