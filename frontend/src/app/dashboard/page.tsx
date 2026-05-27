"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/utils/constants";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const route = ROLE_DASHBOARD_ROUTES[user.role] ?? "/restaurants";
      router.replace(route);
    } else if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  return <PageSpinner />;
}
