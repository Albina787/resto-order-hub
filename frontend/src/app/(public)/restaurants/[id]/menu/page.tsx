import type { Metadata } from "next";
import RestaurantMenu from "@/components/features/menu/RestaurantMenu/RestaurantMenu";

export const metadata: Metadata = {
  title: "Меню ресторану",
  description: "Перегляньте повне меню ресторану з цінами, описами та фото страв.",
};

export default async function RestaurantMenuPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <RestaurantMenu restaurantId={id} />;
}
