import type { Metadata } from "next";
import OrdersPage from "@/components/features/orders/OrdersPage/OrdersPage";

export const metadata: Metadata = {
  title: "Замовлення в ресторані",
  description: "Скануйте QR-код столика, переглядайте меню та робіть замовлення онлайн.",
};

export default function OrdersPageRoute() {
  return <OrdersPage />;
}
