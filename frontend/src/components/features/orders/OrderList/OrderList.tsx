"use client";

import { useState } from "react";
import { useGetMyOrdersQuery } from "@/lib/store/api/orderApi";
import { useAuth } from "@/lib/hooks/useAuth";
import OrderCard from "@/components/features/orders/OrderCard/OrderCard";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import type { OrderStatus } from "@/types/order";
import styles from "./OrderList.module.css";

const STATUS_TABS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "Всі", value: "ALL" },
  { label: "Очікує", value: "PENDING" },
  { label: "Підтверджено", value: "CONFIRMED" },
  { label: "Готується", value: "PREPARING" },
  { label: "Готово", value: "READY" },
  { label: "Подано", value: "SERVED" },
  { label: "Завершено", value: "COMPLETED" },
  { label: "Скасовано", value: "CANCELLED" },
];

export default function OrderList() {
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");
  const { isAuthenticated } = useAuth();
  const { data: ordersData, isLoading, isError, refetch } = useGetMyOrdersQuery(
    {
      status: activeTab === "ALL" ? undefined : activeTab,
      page: 0,
      size: 20,
    },
    { skip: !isAuthenticated }
  );

  const orders = ordersData?.content ?? [];

  // Sort orders by createdAt (newest first)
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = Array.isArray(a.createdAt) 
      ? new Date(a.createdAt[0], a.createdAt[1] - 1, a.createdAt[2], a.createdAt[3] || 0, a.createdAt[4] || 0, a.createdAt[5] || 0)
      : new Date(a.createdAt);
    const dateB = Array.isArray(b.createdAt)
      ? new Date(b.createdAt[0], b.createdAt[1] - 1, b.createdAt[2], b.createdAt[3] || 0, b.createdAt[4] || 0, b.createdAt[5] || 0)
      : new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  const filtered = sortedOrders;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мої замовлення</h1>
      </div>

      <div className={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`${styles.tab} ${activeTab === tab.value ? styles.active : ""}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      )}

      {isError && (
        <ErrorMessage title="Не вдалося завантажити замовлення" onRetry={refetch} />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title="Замовлень не знайдено"
          description={
            activeTab === "ALL"
              ? "У вас ще немає замовлень"
              : "Немає замовлень з таким статусом"
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className={styles.list}>
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
