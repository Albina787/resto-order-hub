import type { Metadata } from "next";
import OrderDetail from "@/components/features/orders/OrderDetail/OrderDetail";

export const metadata: Metadata = {
  title: "Деталі замовлення",
  description: "Перегляньте деталі вашого замовлення, статус та позиції.",
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}
