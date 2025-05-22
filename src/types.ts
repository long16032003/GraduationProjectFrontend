export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface User {
  id?: number;
  uuid?: string;
  email: string;
  name: string;
}

// Define the action interface
export interface PermissionAction {
  name: string;
  description: string;
  permission: string;
  type: 'action';
}

// Define the resource interface
export interface PermissionResource {
  type: 'resource';
  name: string;
  description: string;
  actions: {
    [key: string]: PermissionAction;
  };
  children: any[]; // This is an empty array in the example
}

// Define the group interface
export interface PermissionGroup {
  type: 'group';
  name: string;
  description: string;
  actions: any[]; // This is an empty array in the example
  children: {
    [key: string]: PermissionResource;
  };
}

export interface PermissionsTree {
  [key: string]: PermissionGroup;
}

// Define the tree structure
export interface PermissionsResponse {
  tree: PermissionsTree;
  flat: string[];
}

