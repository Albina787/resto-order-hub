import type { Metadata } from "next";
import OwnerRestaurants from "@/components/features/dashboard/owner/OwnerRestaurants/OwnerRestaurants";

export const metadata: Metadata = {
  title: "Власник — Ресторани",
  description: "Управління мережею ресторанів: додавання, редагування та налаштування.",
};

export default function OwnerRestaurantsPage() {
  return <OwnerRestaurants />;
}
