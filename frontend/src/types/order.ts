export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "COMPLETED"
  | "CANCELLED";

export type OrderType = "PRE_ORDER" | "DINE_IN";

export type OrderItemStatus = "PENDING" | "PREPARING" | "READY" | "SERVED";

export interface CartItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  subtotal: number;
  status: OrderItemStatus;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  reservationId?: string;
  tableId?: string;
  tableNumber?: string;
  userId: string;
  orderNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  items: OrderItem[];
}

export interface CreateOrderItemRequest {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
}

export interface CreateOrderRequest {
  restaurantId: string;
  reservationId?: string;
  tableId?: string;
  orderType: OrderType;
  notes?: string;
  items: CreateOrderItemRequest[];
}
