import type { Bill } from "@/types";

export const caculateTotalAmount = (bill: Bill) => {
    return bill.orders?.reduce((acc, order) => {
      return acc + (order.order_dishes?.reduce((acc, dish) => acc + dish.price_at_order_time * dish.quantity, 0) || 0);
    }, 0) || 0;
  }