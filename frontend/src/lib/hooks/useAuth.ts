"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCredentials, setUser, logoutAndClearCache, setLoading } from "@/lib/store/slices/authSlice";
import { useGetMeQuery } from "@/lib/store/api/authApi";
import type { UserRole } from "@/types/user";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, accessToken, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

  const { data: meData, isSuccess, isError } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });

  useEffect(() => {
    if (isSuccess && meData) {
      dispatch(setUser(meData));
    }
    if (isError) {
      dispatch(setLoading(false));
    }
  }, [isSuccess, isError, meData, dispatch]);

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  };

  const isManager = hasRole(["MANAGER", "OWNER"]);
  const isOwner = hasRole("OWNER");
  const isChef = hasRole("CHEF");
  const isWaiter = hasRole(["WAITER", "MANAGER", "OWNER"]);
  const isStaff = hasRole(["WAITER", "CHEF", "MANAGER", "OWNER"]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    hasRole,
    isManager,
    isOwner,
    isChef,
    isWaiter,
    isStaff,
  };
};

export const useInitAuth = () => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const initialized = useRef(false);

  useEffect(() => {
    // Run only once
    if (initialized.current) return;
    initialized.current = true;

    // If we already have an access token in Redux (restored from localStorage),
    // just mark loading as done — useGetMeQuery will validate it
    if (accessToken) {
      dispatch(setLoading(false));
      return;
    }

    // No access token — try to get a new one using the HttpOnly refresh token cookie.
    // The cookie is sent automatically by the browser (credentials: "include").
    // We call our Next.js API route which proxies to the backend.
    fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Refresh failed");
        return res.json();
      })
      .then((data: { accessToken: string; user?: import("@/types/user").User }) => {
        dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
      })
      .catch(() => {
        // No valid refresh token — user is logged out
        dispatch(logoutAndClearCache() as any);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
