import { baseApi } from "./baseApi";
import type { User } from "@/types/user";

interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/v1/auth/login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
        credentials: "include",
      }),
      invalidatesTags: ["Auth"],
    }),

    // POST /api/v1/auth/register
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    // POST /api/auth/logout  (Next.js route — proxies to backend + clears cookie)
    // NOTE: called via direct fetch in Header, not through baseApi
    // This mutation is kept for completeness but uses the Next.js proxy route
    logoutUser: builder.mutation<void, void>({
      queryFn: async () => {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        return { data: undefined };
      },
      invalidatesTags: ["Auth", "User"],
    }),

    // POST /api/v1/auth/refresh - uses cookie automatically
    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
        credentials: "include",
      }),
    }),

    // POST /api/v1/auth/forgot-password  body: { email }
    forgotPassword: builder.mutation<void, string>({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    // POST /api/v1/auth/reset-password  body: { token, newPassword }
    resetPassword: builder.mutation<void, { token: string; newPassword: string }>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    // GET /api/v1/auth/verify-email?token=
    verifyEmail: builder.query<void, string>({
      query: (token) => `/auth/verify-email?token=${token}`,
    }),

    // POST /api/v1/auth/resend-verification  body: { email }
    resendVerification: builder.mutation<void, string>({
      query: (email) => ({
        url: "/auth/resend-verification",
        method: "POST",
        body: { email },
      }),
    }),

    // GET /api/v1/users/me
    getMe: builder.query<User, void>({
      query: () => "/users/me",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutUserMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailQuery,
  useResendVerificationMutation,
  useGetMeQuery,
} = authApi;
