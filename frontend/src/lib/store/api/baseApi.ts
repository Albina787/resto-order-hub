import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { RootState } from "../store";
import { setCredentials, logoutAndClearCache } from "../slices/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  prepareHeaders: (headers, { getState, extra }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    // Don't set Content-Type for FormData — browser sets it with boundary automatically
    // fetchBaseQuery sets it to application/json by default for non-FormData bodies
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh using HttpOnly cookie (sent automatically)
    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        credentials: "include" as RequestCredentials,
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as { accessToken: string };
      api.dispatch(setCredentials({ accessToken: data.accessToken }));
      // Retry original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed - clear all state and cache consistently
      api.dispatch(logoutAndClearCache() as any);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "User",
    "Restaurant",
    "Table",
    "Reservation",
    "Category",
    "MenuItem",
    "Order",
    "Staff",
    "Analytics",
    "WorkingHours",
  ],
  endpoints: () => ({}),
});
