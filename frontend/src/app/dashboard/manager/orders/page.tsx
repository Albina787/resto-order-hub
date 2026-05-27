import type { Metadata } from "next";
import ManagerOrders from "@/components/features/dashboard/manager/ManagerOrders/ManagerOrders";

export const metadata: Metadata = {
  title: "Менеджер — Замовлення",
  description: "Управління та моніторинг активних замовлень ресторану.",
};

export default function ManagerOrdersPage() {
  return <ManagerOrders />;
}
