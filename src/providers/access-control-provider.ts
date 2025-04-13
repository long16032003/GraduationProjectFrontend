import { AccessControlProvider } from "@refinedev/core";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    console.log(resource); // products, orders, etc.
    console.log(action); // list, edit, delete, etc.
    console.log(params); // { id: 1 }, { id: 2 }, etc.
    const meetSomeCondition = true
    if (meetSomeCondition) {
      return { can: true };
    }

    return {
      can: false,
      reason: "Unauthorized",
    };
  },
};