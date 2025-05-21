export interface User {
  id?: number;
  uuid?: string;
  email: string;
  name: string;
}

// Define the action interface
interface PermissionAction {
  name: string;
  description: string;
  permission: string;
  type: 'action';
}

// Define the resource interface
interface PermissionResource {
  type: 'resource';
  name: string;
  description: string;
  actions: {
    [key: string]: PermissionAction;
  };
  children: any[]; // This is an empty array in the example
}

// Define the group interface
interface PermissionGroup {
  type: 'group';
  name: string;
  description: string;
  actions: any[]; // This is an empty array in the example
  children: {
    [key: string]: PermissionResource;
  };
}

// Define the tree structure
interface PermissionsTree {
  tree: {
    [key: string]: PermissionGroup;
  };
  flat: string[];
}

