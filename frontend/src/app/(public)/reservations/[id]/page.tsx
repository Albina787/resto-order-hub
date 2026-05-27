import type { Metadata } from "next";
import ReservationDetail from "@/components/features/reservations/ReservationDetail/ReservationDetail";

export const metadata: Metadata = {
  title: "Деталі бронювання",
  description: "Перегляньте деталі вашого бронювання столика.",
};

interface ReservationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReservationDetailPage({ params }: ReservationDetailPageProps) {
  const { id } = await params;
  return <ReservationDetail reservationId={id} />;
}
