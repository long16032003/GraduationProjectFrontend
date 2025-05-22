import { type RefineError, type AuthActionResponse, useInvalidateAuthStore, useRouterType, useGo, useNotification, useKeys, type OpenNotificationParams, type SuccessNotificationResponse } from "@refinedev/core";
import type { UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { TLoginData } from "./useLogin";
import { authProvider } from "@/providers/auth-provider";

export type TRegisterData = void | false | string;

export type UseRegisterProps<TVariables> = {
  v3LegacyAuthProviderCompatible?: false;
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

export type UseRegisterCombinedProps<TVariables> = {
  v3LegacyAuthProviderCompatible: boolean;
  mutationOptions?: Omit<
    UseMutationOptions<
      AuthActionResponse | TRegisterData,
      Error | RefineError,
      TVariables,
      unknown
    >,
    "mutationFn"
  >;
};


export type UseRegisterReturnType<TVariables> = UseMutationResult<
  AuthActionResponse,
  Error | RefineError,
  TVariables,
  unknown
>;

export type UseRegisterCombinedReturnType<TVariables> = UseMutationResult<
  AuthActionResponse | TLoginData,
  Error | RefineError,
  TVariables,
  unknown
>;

export function useRegister<TVariables = object>(
  props?: UseRegisterProps<TVariables>,
): UseRegisterReturnType<TVariables>;

export function useRegister<TVariables = object>(
  props?: UseRegisterCombinedProps<TVariables>,
): UseRegisterCombinedReturnType<TVariables>;

/**
 * `useRegister` calls `register` method from {@link https://refine.dev/docs/api-reference/core/providers/auth-provider `authProvider`} under the hood.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/auth/useRegister} for more details.
 *
 * @typeParam TData - Result data of the query
 * @typeParam TVariables - Values for mutation function. default `{}`
 *
 */
export function useRegister<TVariables = object>(
  props: UseRegisterProps<TVariables> | UseRegisterCombinedProps<TVariables> = {},
): UseRegisterReturnType<TVariables> | UseRegisterCombinedReturnType<TVariables> {
  const { mutationOptions } = props || {};
  const invalidateAuthStore = useInvalidateAuthStore();
  const go = useGo();

  const registerFromContext = async (params: unknown) => {
    try {
      const result = await authProvider.register?.(params);

      return result;
    } catch (error) {
      console.warn(
        "Unhandled Error in register: refine always expects a resolved promise.",
        error,
      );
      return Promise.reject(error);
    }
  };

  const { close, open } = useNotification();

  const { keys, preferLegacyKeys } = useKeys();

  const mutation = useMutation<
    AuthActionResponse,
    Error | RefineError,
    TVariables,
    unknown
  >({
    mutationKey: keys().auth().action("register").get(preferLegacyKeys),
    mutationFn: registerFromContext,
    onSuccess: async ({ success, redirectTo, error, successNotification }) => {
      if (success) {
        close?.("register-error");

        if (successNotification) {
          open?.(buildSuccessNotification(successNotification));
        }

        await invalidateAuthStore();
      }

      if (error || !success) {
        open?.(buildNotification(error));
      }

      if (redirectTo) {
        go({ to: redirectTo, type: "replace" });
      } else {
        go({ to: '/', type: "replace" });
      }
    },
    onError: (error: any) => {
      open?.(buildNotification(error));
    },
    ...mutationOptions,
  });

  return mutation;
}

const buildNotification = (
  error?: Error | RefineError,
): OpenNotificationParams => {
  return {
    message: error?.name || "Register Error",
    description: error?.message || "Error while registering",
    key: "register-error",
    type: "error",
  };
};

const buildSuccessNotification = (
  successNotification: SuccessNotificationResponse,
): OpenNotificationParams => {
  return {
    message: successNotification.message,
    description: successNotification.description,
    key: "register-success",
    type: "success",
  };
};
