import { baseApi } from "./baseApi";
import type { User, StaffAssignment } from "@/types/user";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/users/me
    getProfile: builder.query<User, void>({
      query: () => "/users/me",
      providesTags: ["User"],
    }),

    // PUT /api/v1/users/me  body: User entity
    updateProfile: builder.mutation<
      User,
      { firstName?: string; lastName?: string; phone?: string; avatar?: string }
    >({
      query: (data) => ({
        url: "/users/me",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // PUT /api/v1/users/me/password
    changePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
      query: (data) => ({
        url: "/users/me/password",
        method: "PUT",
        body: data,
      }),
    }),

    // GET /api/v1/users/{id}
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
    }),

    // GET /api/v1/users/role/{role}
    getUsersByRole: builder.query<User[], string>({
      query: (role) => `/users/role/${role}`,
    }),

    // DELETE /api/v1/users/{id}  (deactivates)
    deleteAccount: builder.mutation<void, void>({
      query: () => ({
        url: "/users/me",
        method: "DELETE",
      }),
    }),

    // GET /api/v1/restaurants/{restaurantId}/floor-plans
    getFloorPlans: builder.query<unknown[], string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/floor-plans`,
    }),

    // POST /api/v1/restaurants/{restaurantId}/floor-plans
    createFloorPlan: builder.mutation<unknown, { restaurantId: string; data: unknown }>({
      query: ({ restaurantId, data }) => ({
        url: `/restaurants/${restaurantId}/floor-plans`,
        method: "POST",
        body: data,
      }),
    }),

    // PUT /api/v1/restaurants/{restaurantId}/floor-plans/{id}
    updateFloorPlan: builder.mutation<unknown, { restaurantId: string; id: string; data: unknown }>({
      query: ({ restaurantId, id, data }) => ({
        url: `/restaurants/${restaurantId}/floor-plans/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    // DELETE /api/v1/restaurants/{restaurantId}/floor-plans/{id}
    deleteFloorPlan: builder.mutation<void, { restaurantId: string; id: string }>({
      query: ({ restaurantId, id }) => ({
        url: `/restaurants/${restaurantId}/floor-plans/${id}`,
        method: "DELETE",
      }),
    }),

    // GET /api/v1/restaurants/{restaurantId}/staff
    getStaff: builder.query<StaffAssignment[], string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/staff`,
      providesTags: ["Staff"],
    }),

    // GET /api/v1/restaurants/{restaurantId}/staff/active
    getActiveStaff: builder.query<StaffAssignment[], string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/staff/active`,
      providesTags: ["Staff"],
    }),

    // POST /api/v1/restaurants/{restaurantId}/staff  body: AssignStaffRequest
    assignStaff: builder.mutation<
      StaffAssignment,
      { restaurantId: string; userId: string; position: string }
    >({
      query: ({ restaurantId, userId, position }) => ({
        url: `/restaurants/${restaurantId}/staff`,
        method: "POST",
        body: { userId, position },
      }),
      invalidatesTags: ["Staff"],
    }),

    // DELETE /api/v1/restaurants/{restaurantId}/staff/{id}
    removeStaff: builder.mutation<void, { restaurantId: string; id: string }>({
      query: ({ restaurantId, id }) => ({
        url: `/restaurants/${restaurantId}/staff/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff"],
    }),

    // PATCH /api/v1/restaurants/{restaurantId}/staff/{id}/deactivate
    deactivateStaff: builder.mutation<
      StaffAssignment,
      { restaurantId: string; id: string }
    >({
      query: ({ restaurantId, id }) => ({
        url: `/restaurants/${restaurantId}/staff/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: ["Staff"],
    }),

    // PATCH /api/v1/restaurants/{restaurantId}/staff/{id}/activate
    activateStaff: builder.mutation<
      StaffAssignment,
      { restaurantId: string; id: string }
    >({
      query: ({ restaurantId, id }) => ({
        url: `/restaurants/${restaurantId}/staff/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetUserByIdQuery,
  useGetUsersByRoleQuery,
  useDeleteAccountMutation,
  useGetStaffQuery,
  useGetActiveStaffQuery,
  useAssignStaffMutation,
  useRemoveStaffMutation,
  useDeactivateStaffMutation,
  useActivateStaffMutation,
  useGetFloorPlansQuery,
  useCreateFloorPlanMutation,
  useUpdateFloorPlanMutation,
  useDeleteFloorPlanMutation,
} = userApi;
