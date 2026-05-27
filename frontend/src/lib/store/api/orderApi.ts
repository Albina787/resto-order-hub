import { baseApi } from "./baseApi";
import type { Order, CreateOrderRequest, OrderStatus, CreateOrderItemRequest, OrderItemStatus } from "@/types/order";

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface KitchenStats {
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  averagePreparationTime: number;
  topItems: Array<{ name: string; count: number }>;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/orders - get my orders
    getMyOrders: builder.query<
      PaginatedResponse<Order>,
      { status?: OrderStatus; page?: number; size?: number }
    >({
      query: ({ status, page = 0, size = 10 }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });
        if (status) params.append("status", status);
        return `/orders?${params.toString()}`;
      },
      providesTags: ["Order"],
    }),

    // GET /api/v1/orders/{id} - get order by id
    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),

    // POST /api/v1/orders - create order
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    // POST /api/v1/orders/{id}/items - add items to order
    addOrderItems: builder.mutation<Order, { orderId: string; items: CreateOrderItemRequest[] }>({
      query: ({ orderId, items }) => ({
        url: `/orders/${orderId}/items`,
        method: "POST",
        body: items,
      }),
      invalidatesTags: (_result, _error, { orderId }) => [{ type: "Order", id: orderId }],
    }),

    // DELETE /api/v1/orders/{id} - cancel order
    cancelOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Order", id }, "Order"],
    }),

    // GET /api/v1/orders/restaurant/{restaurantId} - get orders by restaurant (staff)
    getOrdersByRestaurant: builder.query<Order[], { restaurantId: string; status?: OrderStatus }>({
      query: ({ restaurantId, status }) => {
        const params = status ? `?status=${status}` : "";
        return `/orders/restaurant/${restaurantId}${params}`;
      },
      providesTags: ["Order"],
    }),

    // POST /api/v1/waiter-calls - call waiter
    callWaiter: builder.mutation<void, { restaurantId: string; tableId: string; message?: string }>({
      query: (body) => ({
        url: "/waiter-calls",
        method: "POST",
        body,
      }),
    }),

    // GET /api/v1/kitchen/orders - get active orders for kitchen (chef)
    getKitchenOrders: builder.query<Order[], string>({
      query: (restaurantId) => `/kitchen/orders?restaurantId=${restaurantId}`,
      providesTags: ["Order"],
    }),

    // GET /api/v1/kitchen/stats - get kitchen statistics
    getKitchenStats: builder.query<KitchenStats, string>({
      query: (restaurantId) => `/kitchen/stats?restaurantId=${restaurantId}`,
      providesTags: ["Order"],
    }),

    // GET /api/v1/kitchen/orders/critical - get critical orders (waiting > 30 min)
    getCriticalOrders: builder.query<Order[], string>({
      query: (restaurantId) => `/kitchen/orders/critical?restaurantId=${restaurantId}`,
      providesTags: ["Order"],
    }),

    // POST /api/v1/kitchen/orders/{orderId}/mark-all-ready - mark all items as ready
    markAllItemsReady: builder.mutation<Order, string>({
      query: (orderId) => ({
        url: `/kitchen/orders/${orderId}/mark-all-ready`,
        method: "POST",
      }),
      invalidatesTags: ["Order"],
    }),

    // POST /api/v1/kitchen/items/bulk-update - bulk update item statuses
    bulkUpdateItemStatus: builder.mutation<void, { itemIds: string[]; status: OrderItemStatus }>({
      query: (body) => ({
        url: `/kitchen/items/bulk-update`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    // PATCH /api/v1/kitchen/orders/{orderId}/items/{itemId}/status - update order item status
    updateOrderItemStatus: builder.mutation<
      Order,
      { orderId: string; itemId: string; status: OrderItemStatus }
    >({
      query: ({ orderId, itemId, status }) => ({
        url: `/kitchen/orders/${orderId}/items/${itemId}/status?status=${status}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Order"],
    }),

    // PATCH /api/v1/kitchen/orders/{orderId}/status - update order status
    updateOrderStatus: builder.mutation<Order, { orderId: string; status: OrderStatus }>({
      query: ({ orderId, status }) => ({
        url: `/kitchen/orders/${orderId}/status?status=${status}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useAddOrderItemsMutation,
  useCancelOrderMutation,
  useGetOrdersByRestaurantQuery,
  useCallWaiterMutation,
  useGetKitchenOrdersQuery,
  useGetKitchenStatsQuery,
  useGetCriticalOrdersQuery,
  useMarkAllItemsReadyMutation,
  useBulkUpdateItemStatusMutation,
  useUpdateOrderItemStatusMutation,
  useUpdateOrderStatusMutation,
} = orderApi;
