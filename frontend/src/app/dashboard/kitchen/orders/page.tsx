import type { Metadata } from "next";
import KitchenBoard from "@/components/features/dashboard/kitchen/KitchenBoard/KitchenBoard";

export const metadata: Metadata = {
  title: "Кухня — Замовлення",
  description: "Панель кухні для відстеження та управління замовленнями в реальному часі.",
};

export default function KitchenOrdersPage() {
  return <KitchenBoard />;
}
