import type { Metadata } from "next";
import ReservationWizard from "@/components/features/reservations/ReservationWizard/ReservationWizard";

export const metadata: Metadata = {
  title: "Бронювання столика",
  description: "Забронюйте столик онлайн. Оберіть дату, час та кількість гостей.",
};

interface ReservePageProps {
  params: Promise<{ id: string }>;
}

export default async function ReservePage({ params }: ReservePageProps) {
  const { id } = await params;
  return <ReservationWizard restaurantId={id} />;
}
