import type { Role } from '@/pages/admin/role/.form/schema.ts';

export interface LoginFormValues {
  email: string;
  password: string;
  redirectPath?: string;
  remember?: boolean;
  guard?: 'web' | 'customer'| null;
}

export interface LoginCustomerFormValues {
  phone: string;
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

export interface Staff {
  id?: number;
  uuid?: string;
  email: string;
  name: string;
  phone: string;
  superadmin?: boolean;
  roles?: Role[] | undefined
  permissions?: Record<string, number> | undefined
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: number;
  uuid: string;
  name: string;
  phone: string;
  email: string;
  point: number;
  created_at: string;
  updated_at: string;
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
  id: number;
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
  price: number;
  category_id: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  dish_categories?: DishCategory;
  creator?: Staff;
  image?: Media;
  // rating?: number;
  is_featured?: number;
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
  creator_id: number;
  title: string;
  summary: string;
  content: string;
  created_at: string;
  status?: 'published' | 'locked' | 'draft';
  creator: Staff;
}

export interface TableModel {
  id: number;
  creator_id: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  area: '1st floor' | '2nd floor' | '3rd floor' | 'rooftop';
  created_at: string;
  updated_at: string;
  creator?: Staff;
}

export interface Reservation {
  id: number;
  table_id: number;
  customer_id: number;
  phone: string;
  name: string;
  reservation_date: number;
  number_of_guests: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | null;
  notes?: string;
  creator_id: number;
  creator_type: 'staff' | 'customer';
  created_at: string;
  updated_at: string;
  customer?: Staff;
  table?: TableModel;
}

export interface BillItem {
  dish_id: number;
  dish_name: string;
  quantity: number;
  unit_price: number;
}

export interface Bill {
  id: number;
  creator_id: number;
  customer_id: number;
  customer_name?: string;
  customer_phone?: string;
  customer?: Customer;
  customer_by_phone?: Customer;
  table_id: number;
  total_amount: number;
  discount_amount?: number;
  created_at: string;
  payment_method: 'cash' | 'credit_card' | 'momo' | 'vnpay' | 'bank_transfer' | null;
  status: 'paid' | 'unpaid' | 'cancelled';
  items?: BillItem[];
  tax_amount?: number;
  service_charge?: number;
  notes?: string;
  has_new_orders?: boolean;
  // Relations
  table?: TableModel;
  orders?: Order[];
}

export interface Order {
  id: number;
  table_id: number;
  table?: {
    id: number;
    name: string;
    number: number;
  };
  bill_id: number;
  creator_id: number;
  order_time: string;
  note?: string;
  status: 'init' | 'processing' | 'finished process' | 'not completed' | 'done' | 'cancelled';
  priority?: number;
  cancelled_reason?: string;
  cancelled_by?: number;
  cancelled_at?: string;
  order_dishes: OrderDish[];
  created_at?: string;
  updated_at?: string;
}

export interface OrderDish {
  dish_id: number;
  order_id: number;
  quantity: number;
  price_at_order_time: number;
  cancelled_reason?: string;
  cancelled_by?: number;
  cancelled_at?: string;
  is_available?: number | null;
  note?: string;
  status?: 'active' | 'cancelled';
  // Relations
  dish?: Dish;
  order?: Order;
}

// Promotion interfaces based on database schema
export interface Promotion {
  id: number;
  creator_id: number;
  name: string;
  description: string | null;
  discount_percentage: number | null;
  discount_amount: number | null;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  discount_type: 'percentage' | 'fixed';
  required_points: number;
  limit: number;
  image_id?: number | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  // Relations
  creator?: Staff;
  promotion_codes?: PromotionCode[];
  image?: Media;
}

export interface PromotionCode {
  id: number;
  code: string;
  promotion_id: number;
  customer_id: number | null;
  used_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  promotion?: Promotion;
  customer?: Customer;
}

export interface PromotionFormData {
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_percentage?: number;
  discount_amount?: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  required_points: number;
  limit: number;
  start_date: string;
  end_date: string;
  image_id?: string;
}
