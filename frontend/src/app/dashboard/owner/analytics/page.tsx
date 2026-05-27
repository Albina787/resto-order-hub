import type { Metadata } from "next";
import OwnerAnalytics from "@/components/features/dashboard/owner/OwnerAnalytics/OwnerAnalytics";

export const metadata: Metadata = {
  title: "Власник — Аналітика",
  description: "Зведена аналітика по всіх ресторанах мережі.",
};

export default function OwnerAnalyticsPage() {
  return <OwnerAnalytics />;
}
