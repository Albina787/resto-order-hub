import { baseApi } from "./baseApi";
import type { Restaurant, WorkingHours, RestaurantTable } from "@/types/restaurant";

interface GetRestaurantsParams {
  page?: number;
  size?: number;
  city?: string;
  cuisineType?: string;
  search?: string;
  priceRange?: string;
}

interface CreateRestaurantRequest {
  name: string;
  description?: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  cuisineType?: string;
  priceRange?: string;
  capacity: number;
  images?: string[];
}

interface UpdateRestaurantRequest {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  cuisineType?: string;
  priceRange?: string;
  capacity?: number;
  images?: string[];
  isActive?: boolean;
}

export const restaurantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/restaurants
    getRestaurants: builder.query<
      { content: Restaurant[]; totalElements: number; totalPages: number },
      GetRestaurantsParams
    >({
      query: (params = {}) => ({ url: "/restaurants", params }),
      providesTags: ["Restaurant"],
    }),

    getActiveRestaurants: builder.query<Restaurant[], void>({
      query: () => "/restaurants/active",
      providesTags: ["Restaurant"],
    }),

    getMyRestaurants: builder.query<Restaurant[], void>({
      query: () => "/restaurants/my-restaurants",
      providesTags: ["Restaurant"],
    }),

    getRestaurant: builder.query<Restaurant, string>({
      query: (id) => `/restaurants/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Restaurant", id }],
    }),

    // POST /api/v1/restaurants  body: CreateRestaurantRequest DTO
    createRestaurant: builder.mutation<Restaurant, CreateRestaurantRequest>({
      query: (data) => ({
        url: "/restaurants",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Restaurant"],
    }),

    // PUT /api/v1/restaurants/{id}  body: UpdateRestaurantRequest DTO
    updateRestaurant: builder.mutation<
      Restaurant,
      { id: string; data: UpdateRestaurantRequest }
    >({
      query: ({ id, data }) => ({
        url: `/restaurants/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Restaurant", id }, "Restaurant"],
    }),

    deleteRestaurant: builder.mutation<void, string>({
      query: (id) => ({ url: `/restaurants/${id}`, method: "DELETE" }),
      invalidatesTags: ["Restaurant"],
    }),

    activateRestaurant: builder.mutation<Restaurant, string>({
      query: (id) => ({ url: `/restaurants/${id}/activate`, method: "PATCH" }),
      invalidatesTags: ["Restaurant"],
    }),

    getRestaurantStats: builder.query<Record<string, unknown>, string>({
      query: (id) => `/restaurants/${id}/stats`,
    }),

    getWorkingHours: builder.query<WorkingHours[], string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/working-hours`,
      providesTags: ["WorkingHours"],
    }),

    // PUT /api/v1/restaurants/{id}/working-hours/{day}
    updateWorkingHoursForDay: builder.mutation<
      WorkingHours,
      { restaurantId: string; day: string; data: Partial<WorkingHours> }
    >({
      query: ({ restaurantId, day, data }) => ({
        url: `/restaurants/${restaurantId}/working-hours/${day}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["WorkingHours"],
    }),

    getTables: builder.query<RestaurantTable[], string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/tables`,
      providesTags: ["Table"],
    }),

    getAvailableTables: builder.query<RestaurantTable[], string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/tables/available`,
    }),

    getTable: builder.query<RestaurantTable, { restaurantId: string; id: string }>({
      query: ({ restaurantId, id }) => `/restaurants/${restaurantId}/tables/${id}`,
      providesTags: (_r, _e, { id }) => [{ type: "Table", id }],
    }),

    createTable: builder.mutation<
      RestaurantTable,
      { restaurantId: string; data: Partial<RestaurantTable> }
    >({
      query: ({ restaurantId, data }) => ({
        url: `/restaurants/${restaurantId}/tables`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Table"],
    }),

    updateTable: builder.mutation<
      RestaurantTable,
      { restaurantId: string; id: string; data: Partial<RestaurantTable> }
    >({
      query: ({ restaurantId, id, data }) => ({
        url: `/restaurants/${restaurantId}/tables/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Table"],
    }),

    deleteTable: builder.mutation<void, { restaurantId: string; id: string }>({
      query: ({ restaurantId, id }) => ({
        url: `/restaurants/${restaurantId}/tables/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Table"],
    }),

    updateTableStatus: builder.mutation<
      RestaurantTable,
      { restaurantId: string; id: string; isAvailable: boolean }
    >({
      query: ({ restaurantId, id, isAvailable }) => ({
        url: `/restaurants/${restaurantId}/tables/${id}/status`,
        method: "PATCH",
        params: { isAvailable },
      }),
      invalidatesTags: ["Table"],
    }),

    activateTable: builder.mutation<RestaurantTable, { restaurantId: string; id: string }>({
      query: ({ restaurantId, id }) => ({
        url: `/restaurants/${restaurantId}/tables/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: ["Table"],
    }),

    deactivateTable: builder.mutation<RestaurantTable, { restaurantId: string; id: string }>({
      query: ({ restaurantId, id }) => ({
        url: `/restaurants/${restaurantId}/tables/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: ["Table"],
    }),
  }),
});

export const {
  useGetRestaurantsQuery,
  useGetActiveRestaurantsQuery,
  useGetMyRestaurantsQuery,
  useGetRestaurantQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useActivateRestaurantMutation,
  useGetRestaurantStatsQuery,
  useGetWorkingHoursQuery,
  useUpdateWorkingHoursForDayMutation,
  useGetTablesQuery,
  useGetAvailableTablesQuery,
  useGetTableQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
  useUpdateTableStatusMutation,
  useActivateTableMutation,
  useDeactivateTableMutation,
} = restaurantApi;
