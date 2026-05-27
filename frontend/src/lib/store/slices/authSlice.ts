import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { baseApi } from "../api/baseApi";
import type { AppDispatch } from "../store";
import type { User } from "@/types/user";

const ACCESS_TOKEN_KEY = "access_token";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Read access token from localStorage on init (client-side only)
function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: null,
  accessToken: readStoredToken(),
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user?: User }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      // Persist access token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(ACCESS_TOKEN_KEY, action.payload.accessToken);
      }
      // NOTE: refresh token is set as HttpOnly cookie by the server — never touch it from JS
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          // Also clear sessionStorage to ensure complete cleanup
          sessionStorage.clear();
        } catch (error) {
          console.error("Failed to clear storage:", error);
        }
      }
      // HttpOnly cookie is cleared by the server on /auth/logout
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, setUser, logout, setLoading } = authSlice.actions;

export const logoutAndClearCache = () => (dispatch: AppDispatch) => {
  // 1. Clear auth state
  dispatch(logout());
  
  // 2. Reset entire RTK Query cache (removes all cached data)
  dispatch(baseApi.util.resetApiState());
  
  // 3. Clear cart and order slices
  // Import actions dynamically to avoid circular dependencies
  dispatch({ type: "cart/resetCart" });
  dispatch({ type: "order/resetOrder" });
  dispatch({ type: "restaurant/resetRestaurant" });
  
  // 4. Clear localStorage and sessionStorage completely
  if (typeof window !== "undefined") {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }

    // 5. Clear the HttpOnly refreshToken cookie via the logout API route.
    // This is critical when called due to token expiry (not explicit logout),
    // because without clearing the cookie, Next.js middleware will keep
    // blocking the /login page thinking the user is still authenticated.
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(
      () => {
        // Ignore errors — cookie cleanup is best-effort here
      }
    );
  }
};

export default authSlice.reducer;
