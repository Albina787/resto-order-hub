import type { Metadata } from "next";
import ManagerReservations from "@/components/features/dashboard/manager/ManagerReservations/ManagerReservations";

export const metadata: Metadata = {
  title: "Менеджер — Бронювання",
  description: "Управління бронюваннями столиків ресторану.",
};

export default function ManagerReservationsPage() {
  return <ManagerReservations />;
}
