import { baseApi } from "./baseApi";
import type { Reservation, PreOrderItem } from "@/types/reservation";

// Request DTO for creating reservation
interface CreateReservationParams {
  restaurantId: string;
  guestCount: number;
  reservationDate: string; // ISO date: YYYY-MM-DD
  reservationTime: string; // ISO time: HH:mm:ss
  duration?: number;
  specialRequests?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  preOrderItems?: PreOrderItem[];
}

interface AvailabilityResponse {
  available: boolean;
  availableTablesCount: number;
  availableTables: import("@/types/restaurant").RestaurantTable[];
  optimalTable: import("@/types/restaurant").RestaurantTable | null;
}

export const reservationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/reservations  — current user's reservations (from JWT)
    getMyReservations: builder.query<
      { content: Reservation[]; totalElements: number } | Reservation[],
      { status?: string; page?: number; size?: number }
    >({
      query: (params) => ({ url: "/reservations", params }),
      providesTags: ["Reservation"],
    }),

    // GET /api/v1/reservations/{id}
    getReservation: builder.query<Reservation, string>({
      query: (id) => `/reservations/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Reservation", id }],
    }),

    // POST /api/v1/reservations  body: CreateReservationRequest
    createReservation: builder.mutation<Reservation, CreateReservationParams>({
      query: (body) => ({
        url: "/reservations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reservation"],
    }),

    // PUT /api/v1/reservations/{id}  body: CreateReservationRequest
    updateReservation: builder.mutation<
      Reservation,
      { id: string; data: {
        restaurantId: string;
        guestCount: number;
        reservationDate: string;
        reservationTime: string;
        duration?: number;
        specialRequests?: string;
        customerName: string;
        customerPhone: string;
        customerEmail: string;
      }}
    >({
      query: ({ id, data }) => ({
        url: `/reservations/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Reservation", id }, "Reservation"],
    }),

    // PATCH /api/v1/reservations/{id}/cancel?reason=
    cancelReservation: builder.mutation<Reservation, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/reservations/${id}/cancel`,
        method: "PATCH",
        params: reason ? { reason } : {},
      }),
      invalidatesTags: ["Reservation"],
    }),

    // PUT /api/v1/reservations/{id}/reschedule
    rescheduleReservation: builder.mutation<
      Reservation,
      { id: string; newDate: string; newTime: string }
    >({
      query: ({ id, newDate, newTime }) => ({
        url: `/reservations/${id}`,
        method: "PUT",
        body: { reservationDate: newDate, reservationTime: newTime },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Reservation", id }, "Reservation"],
    }),

    // GET /api/v1/reservations/restaurant/{restaurantId}  (staff)
    getRestaurantReservations: builder.query<
      Reservation[],
      { restaurantId: string; date?: string; status?: string }
    >({
      query: ({ restaurantId, date, status }) => {
        if (date) {
          return `/reservations/restaurant/${restaurantId}/date/${date}`;
        }
        if (status) {
          return `/reservations/restaurant/${restaurantId}/status/${status}`;
        }
        return `/reservations/restaurant/${restaurantId}`;
      },
      providesTags: ["Reservation"],
    }),

    // GET /api/v1/reservations/restaurant/{restaurantId}/date/{date}
    getReservationsByDate: builder.query<
      Reservation[],
      { restaurantId: string; date: string }
    >({
      query: ({ restaurantId, date }) =>
        `/reservations/restaurant/${restaurantId}/date/${date}`,
      providesTags: ["Reservation"],
    }),

    // PATCH /api/v1/reservations/{id}/confirm  — confirmedBy from JWT
    confirmReservation: builder.mutation<Reservation, string>({
      query: (id) => ({
        url: `/reservations/${id}/confirm`,
        method: "PATCH",
      }),
      invalidatesTags: ["Reservation"],
    }),

    // PATCH /api/v1/reservations/{id}/cancel?reason=  (manager version)
    cancelReservationByManager: builder.mutation<
      Reservation,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/reservations/${id}/cancel`,
        method: "PATCH",
        params: { reason },
      }),
      invalidatesTags: ["Reservation"],
    }),

    // PATCH /api/v1/reservations/{id}/complete
    completeReservation: builder.mutation<Reservation, string>({
      query: (id) => ({
        url: `/reservations/${id}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Reservation"],
    }),

    // PATCH /api/v1/reservations/{id}/no-show
    markNoShow: builder.mutation<Reservation, string>({
      query: (id) => ({
        url: `/reservations/${id}/no-show`,
        method: "PATCH",
      }),
      invalidatesTags: ["Reservation"],
    }),

    // PATCH /api/v1/reservations/{id}/assign-table?tableId=
    assignTable: builder.mutation<Reservation, { id: string; tableId: string }>({
      query: ({ id, tableId }) => ({
        url: `/reservations/${id}/assign-table`,
        method: "PATCH",
        params: { tableId },
      }),
      invalidatesTags: ["Reservation"],
    }),

    // GET /api/v1/restaurants/{restaurantId}/availability?date=&time=&guestCount=&duration=
    getAvailability: builder.query<
      AvailabilityResponse,
      { restaurantId: string; date: string; time: string; guestCount: number; duration?: number }
    >({
      query: ({ restaurantId, ...params }) => ({
        url: `/restaurants/${restaurantId}/availability`,
        params,
      }),
    }),

    // GET /api/v1/restaurants/{restaurantId}/availability/time-slots?date=&guestCount=&duration=
    getAvailableTimeSlots: builder.query<
      string[],
      { restaurantId: string; date: string; guestCount: number; duration?: number }
    >({
      query: ({ restaurantId, ...params }) => ({
        url: `/restaurants/${restaurantId}/availability/time-slots`,
        params,
      }),
    }),
  }),
});

export const {
  useGetMyReservationsQuery,
  useGetReservationQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useCancelReservationMutation,
  useRescheduleReservationMutation,
  useGetRestaurantReservationsQuery,
  useGetReservationsByDateQuery,
  useConfirmReservationMutation,
  useCancelReservationByManagerMutation,
  useCompleteReservationMutation,
  useMarkNoShowMutation,
  useAssignTableMutation,
  useGetAvailabilityQuery,
  useGetAvailableTimeSlotsQuery,
} = reservationApi;
