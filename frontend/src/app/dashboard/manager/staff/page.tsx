import type { Metadata } from "next";
import ManagerStaff from "@/components/features/dashboard/manager/ManagerStaff/ManagerStaff";

export const metadata: Metadata = {
  title: "Менеджер — Персонал",
  description: "Управління персоналом ресторану: офіціанти, кухарі та інші співробітники.",
};

export default function ManagerStaffPage() {
  return <ManagerStaff />;
}
