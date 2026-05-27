import { baseApi } from "./baseApi";

// Backend returns Map<String, Object> — use Record<string, unknown>
type AnalyticsData = Record<string, unknown>;

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/restaurants/{restaurantId}/analytics/overview
    getRestaurantOverview: builder.query<AnalyticsData, string>({
      query: (restaurantId) =>
        `/restaurants/${restaurantId}/analytics/overview`,
      providesTags: ["Analytics"],
    }),

    // GET /api/v1/restaurants/{restaurantId}/analytics/reservations?startDate=&endDate=
    getReservationAnalytics: builder.query<
      AnalyticsData,
      { restaurantId: string; startDate: string; endDate: string }
    >({
      query: ({ restaurantId, startDate, endDate }) => ({
        url: `/restaurants/${restaurantId}/analytics/reservations`,
        params: { startDate, endDate },
      }),
      providesTags: ["Analytics"],
    }),

    // GET /api/v1/restaurants/{restaurantId}/analytics/orders
    getOrderAnalytics: builder.query<AnalyticsData, string>({
      query: (restaurantId) =>
        `/restaurants/${restaurantId}/analytics/orders`,
      providesTags: ["Analytics"],
    }),

    // GET /api/v1/restaurants/{restaurantId}/analytics/popular-items
    getPopularItems: builder.query<AnalyticsData, string>({
      query: (restaurantId) =>
        `/restaurants/${restaurantId}/analytics/popular-items`,
      providesTags: ["Analytics"],
    }),

    // GET /api/v1/restaurants/{restaurantId}/analytics/occupancy?date=
    getOccupancyAnalytics: builder.query<
      AnalyticsData,
      { restaurantId: string; date: string }
    >({
      query: ({ restaurantId, date }) => ({
        url: `/restaurants/${restaurantId}/analytics/occupancy`,
        params: { date },
      }),
      providesTags: ["Analytics"],
    }),

    // GET /api/v1/analytics/network/overview  (OWNER only)
    getNetworkOverview: builder.query<AnalyticsData, void>({
      query: () => "/analytics/network/overview",
      providesTags: ["Analytics"],
    }),

    // GET /api/v1/analytics/network/comparison?startDate=&endDate=
    getNetworkComparison: builder.query<
      AnalyticsData,
      { startDate: string; endDate: string }
    >({
      query: (params) => ({ url: "/analytics/network/comparison", params }),
      providesTags: ["Analytics"],
    }),

    // GET /api/v1/analytics/network/trends?days=
    getNetworkTrends: builder.query<AnalyticsData, { days?: number }>({
      query: (params) => ({ url: "/analytics/network/trends", params }),
      providesTags: ["Analytics"],
    }),

    // GET /api/v1/restaurants/{restaurantId}/analytics/revenue?startDate=&endDate=
    getRevenueAnalytics: builder.query<
      AnalyticsData,
      { restaurantId: string; startDate: string; endDate: string }
    >({
      query: ({ restaurantId, startDate, endDate }) => ({
        url: `/restaurants/${restaurantId}/analytics/revenue`,
        params: { startDate, endDate },
      }),
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  useGetRestaurantOverviewQuery,
  useGetReservationAnalyticsQuery,
  useGetOrderAnalyticsQuery,
  useGetPopularItemsQuery,
  useGetOccupancyAnalyticsQuery,
  useGetNetworkOverviewQuery,
  useGetNetworkComparisonQuery,
  useGetNetworkTrendsQuery,
  useGetRevenueAnalyticsQuery,
} = analyticsApi;
