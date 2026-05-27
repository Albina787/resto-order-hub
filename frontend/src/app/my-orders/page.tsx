import type { Metadata } from "next";
import MyOrdersPage from "@/components/features/orders/MyOrdersPage/MyOrdersPage";

export const metadata: Metadata = {
  title: "Мої замовлення",
  description: "Перегляньте історію ваших замовлень та їх поточний статус.",
};

export default function MyOrdersPageRoute() {
  return <MyOrdersPage />;
}
