import type { Dish } from "@/types";

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
  id: number;
  dish_id: number;
  order_id: number;
  quantity: number;
  price_at_order_time: number;
  cancelled_reason?: string;
  cancelled_by?: number;
  cancelled_at?: string;
  is_available?: number | null;
  dish?: Dish;
  note?: string;
  order?: Order;
}

export interface DishGroup {
  dishId: number;
  dishName: string;
  totalQuantity: number;
  completedQuantity: number;
  remainingQuantity: number;
  orderDetails: {
    orderId: number;
    tableNumber: number;
    quantity: number;
    note?: string;
    orderTime: string;
    status: Order['status'];
    isCompleted: boolean;
    isCancelled: boolean;
  }[];
}

export interface OrderCounts {
  pending: number;
  cooking: number;
  ready: number;
  done: number;
  cancelled: number;
  all: number;
}

export type CancelType = 'out_of_stock' | 'kitchen_issue' | 'customer_request' | 'other';
export type KitchenViewMode = 'by-order' | 'by-dish'; 