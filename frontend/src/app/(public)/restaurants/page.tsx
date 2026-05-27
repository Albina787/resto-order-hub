import type { Metadata } from "next";
import RestaurantList from "@/components/features/restaurants/RestaurantList/RestaurantList";

export const metadata: Metadata = {
  title: "Ресторани",
  description: "Знайдіть найкращі ресторани та забронюйте столик онлайн. Перегляньте меню, ціни та відгуки.",
  openGraph: {
    title: "Ресторани - RestoOrderHub",
    description: "Знайдіть найкращі ресторани та забронюйте столик онлайн",
  },
};

export default function RestaurantsPage() {
  return <RestaurantList />;
}
