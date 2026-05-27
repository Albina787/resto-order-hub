import type { Metadata } from "next";
import ManagerAnalytics from "@/components/features/dashboard/manager/ManagerAnalytics/ManagerAnalytics";

export const metadata: Metadata = {
  title: "Менеджер — Аналітика",
  description: "Аналітика продажів, замовлень та бронювань ресторану.",
};

export default function ManagerAnalyticsPage() {
  return <ManagerAnalytics />;
}
