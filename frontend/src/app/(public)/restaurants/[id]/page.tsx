import type { Metadata } from "next";
import RestaurantDetail from "@/components/features/restaurants/RestaurantDetail/RestaurantDetail";

export const metadata: Metadata = {
  title: "Деталі ресторану",
  description: "Перегляньте інформацію про ресторан, меню та забронюйте столик онлайн.",
};

export default async function RestaurantPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <RestaurantDetail restaurantId={id} />;
}
