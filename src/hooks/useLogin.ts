import { authProvider } from "@/providers/auth-provider";
import { type RefineError, type AuthActionResponse, useInvalidateAuthStore, useGo, useParsed, useNotification, useKeys, type OpenNotificationParams, type SuccessNotificationResponse } from "@refinedev/core";
import type { UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import React from "react";

export type TLoginData = void | false | string | object;

export type UseLoginProps<TVariables> = {
  onSuccess?: (data: AuthActionResponse) => Promise<void>;
  onError?: (error: Error | RefineError) => Promise<void>;
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

export type UseLoginCombinedProps<TVariables> = {
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

export type UseLoginReturnType<TVariables> = UseMutationResult<
  AuthActionResponse,
  Error | RefineError,
  TVariables,
  unknown
>;

export type UseLoginCombinedReturnType<TVariables> = UseMutationResult<
  AuthActionResponse | TLoginData,
  Error | RefineError,
  TVariables,
  unknown
>;


export function useLogin<TVariables = object>(
  props?: UseLoginProps<TVariables>,
): UseLoginReturnType<TVariables>;

export function useLogin<TVariables = object>(
  props?: UseLoginCombinedProps<TVariables>,
): UseLoginCombinedReturnType<TVariables>;

/**
 * `useLogin` calls `login` method from {@link https://refine.dev/docs/api-reference/core/providers/auth-provider `authProvider`} under the hood.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/auth/useLogin} for more details.
 *
 * @typeParam TData - Result data of the query
 * @typeParam TVariables - Values for mutation function. default `{}`
 *
 */
export function useLogin<TVariables = object>(
  props?: UseLoginProps<TVariables> | UseLoginCombinedProps<TVariables>
): UseLoginReturnType<TVariables> | UseLoginCombinedReturnType<TVariables> {
  const { mutationOptions, onError, onSuccess } = props || {};
  const invalidateAuthStore = useInvalidateAuthStore();
  const go = useGo();
  const parsed = useParsed();
  const { close, open } = useNotification();
  const { keys, preferLegacyKeys } = useKeys();

  const to = React.useMemo(() => {
    return parsed.params?.to;
  }, [parsed.params]);

  const mutation = useMutation<
    AuthActionResponse,
    Error | RefineError,
    TVariables,
    unknown
  >({
    mutationKey: keys().auth().action("login").get(preferLegacyKeys),
    mutationFn: authProvider.login,
    onSuccess: async ({ success, redirectTo, error, successNotification }) => {
      if (success) {
        close?.("login-error");

        if (successNotification) {
          open?.(buildSuccessNotification(successNotification));
        }

        await invalidateAuthStore();
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
        // if no redirectTo, go to home page
        go({ to: "/", type: "replace" });
      }

    //   setTimeout(() => {
        // await invalidateAuthStore();
    //   }, 32);
    },
    onError: async (error: RefineError | Error) => {
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
    message: error?.name || "Login Error",
    description: error?.message || "Invalid credentials",
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
