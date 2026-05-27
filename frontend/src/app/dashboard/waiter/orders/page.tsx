import type { Metadata } from "next";
import WaiterOrders from "@/components/features/dashboard/waiter/WaiterOrders/WaiterOrders";

export const metadata: Metadata = {
  title: "Офіціант — Замовлення",
  description: "Управління активними замовленнями столиків.",
};

export default function WaiterOrdersPage() {
  return <WaiterOrders />;
}
