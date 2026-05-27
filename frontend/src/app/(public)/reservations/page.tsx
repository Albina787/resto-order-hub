import type { Metadata } from "next";
import ReservationsPage from "@/components/features/reservations/ReservationsPage/ReservationsPage";

export const metadata: Metadata = {
  title: "Мої бронювання",
  description: "Перегляньте всі ваші бронювання столиків та їх статус.",
};

export default function ReservationsPageRoute() {
  return <ReservationsPage />;
}
