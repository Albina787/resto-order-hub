import type { Metadata } from "next";
import ManagerSettings from "@/components/features/dashboard/manager/ManagerSettings/ManagerSettings";

export const metadata: Metadata = {
  title: "Менеджер — Налаштування",
  description: "Налаштування ресторану: графік роботи, контакти та інші параметри.",
};

export default function ManagerSettingsPage() {
  return <ManagerSettings />;
}
