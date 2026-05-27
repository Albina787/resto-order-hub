import { baseApi } from "./baseApi";
import type { Restaurant } from "@/types/restaurant";
import type { MenuItem, Category } from "@/types/menu";
import type { Reservation } from "@/types/reservation";

export interface PublicRestaurantFilters {
  city?: string;
  cuisineType?: string;
  priceRange?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
  remainingTables: number;
}

export interface CreateReservationRequest {
  restaurantId: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  specialRequests?: string;
}

export const publicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Список ресторанів (публічний)
    getPublicRestaurants: builder.query<PaginatedResponse<Restaurant>, PublicRestaurantFilters>({
      query: (filters) => ({
        url: "/restaurants",
        params: { ...filters, page: filters.page || 0, size: filters.size || 12 },
      }),
      providesTags: ["Restaurant"],
    }),

    // Деталі ресторану (публічний)
    getPublicRestaurant: builder.query<Restaurant, string>({
      query: (id) => `/restaurants/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Restaurant", id }],
    }),

    // GET /api/v1/menu-items/restaurant/{restaurantId}  (public, via MenuItemController)
    getPublicRestaurantMenu: builder.query<MenuItem[], string>({
      query: (restaurantId) => `/menu-items/restaurant/${restaurantId}/available`,
      providesTags: (_result, _error, restaurantId) => [
        { type: "MenuItem", id: restaurantId },
      ],
    }),

    // GET /api/v1/categories/restaurant/{restaurantId}  (public, via CategoryController)
    getPublicRestaurantCategories: builder.query<Category[], string>({
      query: (restaurantId) => `/categories/restaurant/${restaurantId}`,
      providesTags: (_result, _error, restaurantId) => [
        { type: "Category", id: restaurantId },
      ],
    }),

    // GET /api/v1/restaurants/{restaurantId}/tables/available (public)
    getPublicRestaurantTables: builder.query<import("@/types/restaurant").RestaurantTable[], string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/tables/available`,
      providesTags: (_result, _error, restaurantId) => [
        { type: "Table", id: restaurantId },
      ],
    }),

    // Доступні слоти для бронювання
    getAvailableSlots: builder.query<
      {
        available: boolean;
        availableTablesCount: number;
        availableTables: import("@/types/restaurant").RestaurantTable[];
        optimalTable: import("@/types/restaurant").RestaurantTable | null;
      },
      { restaurantId: string; date: string; time: string; guestCount: number; duration?: number }
    >({
      query: ({ restaurantId, ...params }) => ({
        url: `/restaurants/${restaurantId}/availability`,
        params,
      }),
    }),

    // GET /api/v1/restaurants/{restaurantId}/availability/time-slots
    // NOTE: defined in reservationApi to avoid duplicate endpoint name
    // Use useGetAvailableTimeSlotsQuery from reservationApi instead

    // Створення бронювання (публічний)
    createPublicReservation: builder.mutation<
      Reservation,
      CreateReservationRequest
    >({
      query: (data) => ({
        url: "/reservations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Reservation"],
    }),
  }),
});

export const {
  useGetPublicRestaurantsQuery,
  useGetPublicRestaurantQuery,
  useGetPublicRestaurantMenuQuery,
  useGetPublicRestaurantCategoriesQuery,
  useGetPublicRestaurantTablesQuery,
  useGetAvailableSlotsQuery,
  useCreatePublicReservationMutation,
} = publicApi;

// Re-export from reservationApi for convenience
export { useGetAvailableTimeSlotsQuery } from "./reservationApi";
