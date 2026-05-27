"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import ReservationList from "@/components/features/reservations/ReservationList/ReservationList";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";

export default function ReservationsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <PageSpinner />;
  if (!isAuthenticated) return null;

  return <ReservationList />;
}
