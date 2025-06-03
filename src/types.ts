export interface LoginFormValues {
  email: string;
  password: string;
  redirectPath?: string;
  remember?: boolean;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  redirectPath?: string;
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

export interface Staff {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface DishCategory {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Dish {
  id: number;
  creator_id: number;
  name: string;
  description: string | null;
  image_id: number | null;
  price: string;
  category_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  dish_categories?: DishCategory;
  creator?: User;
  image?: Media;
}

export interface Media {
  id: number;
  title: string;
  path: string;
  type: string;
  size: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  summary: string;
  content: string;
  created_at: string;
}

