import { baseApi } from "./baseApi";
import type { Category, MenuItem } from "@/types/menu";

// Real backend response types
interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  restaurantId: string;
}

interface CreateCategoryRequest {
  name: string;
  description?: string;
  displayOrder?: number;
  restaurantId: string;
}

export const menuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/menu-items/restaurant/{restaurantId}  (via MenuItemController)
    getMenuItems: builder.query<MenuItem[], string>({
      query: (restaurantId) => `/menu-items/restaurant/${restaurantId}`,
      providesTags: ["MenuItem"],
    }),

    // GET /api/v1/menu-items/restaurant/{restaurantId}/available
    getAvailableMenuItems: builder.query<MenuItem[], string>({
      query: (restaurantId) => `/menu-items/restaurant/${restaurantId}/available`,
      providesTags: ["MenuItem"],
    }),

    // GET /api/v1/menu-items/restaurant/{restaurantId}/popular
    getPopularMenuItems: builder.query<MenuItem[], string>({
      query: (restaurantId) => `/menu-items/restaurant/${restaurantId}/popular`,
      providesTags: ["MenuItem"],
    }),

    // GET /api/v1/menu-items/{id}
    getMenuItem: builder.query<MenuItem, string>({
      query: (id) => `/menu-items/${id}`,
      providesTags: (_r, _e, id) => [{ type: "MenuItem", id }],
    }),

    // POST /api/v1/menu-items  body: CreateMenuItemRequest (includes restaurantId and categoryId)
    createMenuItem: builder.mutation<
      MenuItem,
      { restaurantId: string; categoryId: string; data: Partial<MenuItem> }
    >({
      query: ({ restaurantId, categoryId, data }) => ({
        url: "/menu-items",
        method: "POST",
        body: { ...data, restaurantId, categoryId },
      }),
      invalidatesTags: ["MenuItem"],
    }),

    // PUT /api/v1/menu-items/{id}  body: UpdateMenuItemRequest DTO
    updateMenuItem: builder.mutation<MenuItem, {
      id: string;
      data: {
        name?: string;
        description?: string;
        price?: number;
        images?: string[];
        ingredients?: string[];
        allergens?: string[];
        isVegetarian?: boolean;
        isVegan?: boolean;
        isGlutenFree?: boolean;
        spicyLevel?: string;
        preparationTime?: number;
        calories?: number;
        isAvailable?: boolean;
        isPopular?: boolean;
        displayOrder?: number;
        categoryId?: string;
      }
    }>({
      query: ({ id, data }) => ({
        url: `/menu-items/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["MenuItem"],
    }),

    // DELETE /api/v1/menu-items/{id}
    deleteMenuItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/menu-items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MenuItem"],
    }),

    // PATCH /api/v1/menu-items/{id}/toggle-availability
    toggleMenuItemAvailability: builder.mutation<MenuItem, string>({
      query: (id) => ({
        url: `/menu-items/${id}/toggle-availability`,
        method: "PATCH",
      }),
      invalidatesTags: ["MenuItem"],
    }),

    // PATCH /api/v1/menu-items/{id}/toggle-popular
    toggleMenuItemPopular: builder.mutation<MenuItem, string>({
      query: (id) => ({
        url: `/menu-items/${id}/toggle-popular`,
        method: "PATCH",
      }),
      invalidatesTags: ["MenuItem"],
    }),

    // GET /api/v1/categories/restaurant/{restaurantId}
    getCategories: builder.query<CategoryResponse[], string>({
      query: (restaurantId) => `/categories/restaurant/${restaurantId}`,
      providesTags: ["Category"],
    }),

    // GET /api/v1/categories/{id}
    getCategory: builder.query<CategoryResponse, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Category", id }],
    }),

    // POST /api/v1/categories  body: CreateCategoryRequest (includes restaurantId)
    createCategory: builder.mutation<CategoryResponse, CreateCategoryRequest>({
      query: (data) => ({
        url: "/categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    // PUT /api/v1/categories/{id}  body: CreateCategoryRequest
    updateCategory: builder.mutation<
      CategoryResponse,
      { id: string; data: CreateCategoryRequest }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    // DELETE /api/v1/categories/{id}
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    // PATCH /api/v1/categories/{id}/activate
    activateCategory: builder.mutation<CategoryResponse, string>({
      query: (id) => ({
        url: `/categories/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: ["Category"],
    }),

    // PATCH /api/v1/categories/{id}/deactivate
    deactivateCategory: builder.mutation<CategoryResponse, string>({
      query: (id) => ({
        url: `/categories/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetMenuItemsQuery,
  useGetAvailableMenuItemsQuery,
  useGetPopularMenuItemsQuery,
  useGetMenuItemQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useToggleMenuItemAvailabilityMutation,
  useToggleMenuItemPopularMutation,
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useActivateCategoryMutation,
  useDeactivateCategoryMutation,
} = menuApi;
