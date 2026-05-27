import type { Metadata } from "next";
import { Suspense } from "react";
import CreateOrder from "@/components/features/dashboard/waiter/CreateOrder/CreateOrder";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";

export const metadata: Metadata = {
  title: "Нове замовлення",
  description: "Створення нового замовлення для столика.",
};

export default function NewOrderPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <CreateOrder />
    </Suspense>
  );
}
