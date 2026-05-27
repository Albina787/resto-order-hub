"use client";

import { useState } from "react";
import { Radio } from "lucide-react";
import { useGetOrdersByRestaurantQuery, useUpdateOrderStatusMutation } from "@/lib/store/api/orderApi";
import { useStaffRestaurant } from "@/lib/hooks/useStaffRestaurant";
import { useToast } from "@/lib/hooks/useToast";
import { formatCurrency, formatDateTime } from "@/lib/utils/formatters";
import OrderStatusBadge from "@/components/features/orders/OrderStatusBadge/OrderStatusBadge";
import OrderTimer from "@/components/shared/OrderTimer/OrderTimer";
import WaiterNotifications from "@/components/features/dashboard/waiter/WaiterNotifications/WaiterNotifications";
import Button from "@/components/ui/Button/Button";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import type { OrderStatus } from "@/types/order";
import styles from "./WaiterOrders.module.css";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  READY: "SERVED",
  SERVED: "COMPLETED",
};

const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: "Підтвердити",
  CONFIRMED: "Передати на кухню",
  READY: "Подано",
  SERVED: "Завершити",
};

export default function WaiterOrders() {
  const { restaurantId, isLoading: isLoadingRestaurant } = useStaffRestaurant();
  const toast = useToast();

  const { data: orders, isLoading, isError, refetch } = useGetOrdersByRestaurantQuery(
    { restaurantId: restaurantId! },
    { skip: !restaurantId, pollingInterval: 15000 }
  );

  const [updateStatus] = useUpdateOrderStatusMutation();

  if (isLoadingRestaurant) {
    return <div className={styles.container}><div className={styles.skeleton} /></div>;
  }

  if (!restaurantId) {
    return (
      <div className={styles.container}>
        <EmptyState title="Ресторан не знайдено. Зверніться до адміністратора." />
      </div>
    );
  }

  const activeOrders = (orders ?? [])
    .filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Замовлення</h1>
          <span className={styles.pollingBadge}><Radio size={12} /> Оновлення кожні 15с</span>
        </div>
        <WaiterNotifications />
      </div>

      {isLoading && <div className={styles.skeleton} />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && activeOrders.length === 0 && (
        <EmptyState title="Активних замовлень немає" />
      )}

      {!isLoading && !isError && activeOrders.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Столик</th>
                <th>Статус</th>
                <th>Сума</th>
                <th>Час</th>
                <th>Таймер</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {activeOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.orderNumber}</td>
                  <td>{order.tableNumber || "—"}</td>
                  <td><OrderStatusBadge status={order.status} /></td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>
                    <OrderTimer 
                      createdAt={order.createdAt}
                      preparationTime={30}
                      status={order.status}
                    />
                  </td>
                  <td>
                    {NEXT_STATUS[order.status] && (
                      <button
                        className={styles.statusBtn}
                        onClick={async () => {
                          try {
                            await updateStatus({ orderId: order.id, status: NEXT_STATUS[order.status]! }).unwrap();
                            toast.success("Статус оновлено", `Замовлення переведено в статус "${NEXT_STATUS_LABEL[order.status]}"`);
                          } catch (error) {
                            toast.error("Помилка", "Не вдалося оновити статус замовлення");
                          }
                        }}
                      >
                        {NEXT_STATUS_LABEL[order.status]}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
