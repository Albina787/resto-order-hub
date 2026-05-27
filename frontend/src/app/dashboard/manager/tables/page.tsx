import type { Metadata } from "next";
import ManagerTables from "@/components/features/dashboard/manager/ManagerTables/ManagerTables";

export const metadata: Metadata = {
  title: "Менеджер — Столики",
  description: "Управління столиками та схемою залу ресторану.",
};

export default function ManagerTablesPage() {
  return <ManagerTables />;
}
