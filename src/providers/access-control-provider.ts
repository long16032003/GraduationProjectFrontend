import type { AccessControlProvider } from '@refinedev/core';
import auth$ from '@/stores/auth.ts';

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const user = auth$.user.peek();

    if (!user) {
      return {
        can: false,
        reason: "Unauthorized",
      };
    }

    if (user.superadmin) {
      return { can: true };
    }

    const permission = `${resource}:${action}`
    console.log(resource); // products, orders, etc.
    console.log(action); // list, edit, delete, etc.
    console.log(params); // { id: 1 }, { id: 2 }, etc.
    if (user?.permissions?.[permission]) {
      return { can: true };
    }

    return {
      can: false,
      reason: "Unauthorized",
    };
  },
};