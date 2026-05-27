import type { Metadata } from "next";
import WaiterTables from "@/components/features/dashboard/waiter/WaiterTables/WaiterTables";

export const metadata: Metadata = {
  title: "Офіціант — Столики",
  description: "Перегляд та управління столиками ресторану.",
};

export default function WaiterTablesPage() {
  return <WaiterTables />;
}
