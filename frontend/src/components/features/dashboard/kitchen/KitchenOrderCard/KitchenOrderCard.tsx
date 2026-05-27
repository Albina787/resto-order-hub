"use client";

import { useUpdateOrderItemStatusMutation, useMarkAllItemsReadyMutation } from "@/lib/store/api/orderApi";
import { useToast } from "@/lib/hooks/useToast";
import OrderTimer from "@/components/shared/OrderTimer/OrderTimer";
import { CheckCircle } from "lucide-react";
import type { Order, OrderItemStatus } from "@/types/order";
import styles from "./KitchenOrderCard.module.css";

interface KitchenOrderCardProps {
  order: Order;
  isCritical?: boolean;
}

const NEXT_ITEM_STATUS: Partial<Record<OrderItemStatus, OrderItemStatus>> = {
  PENDING: "PREPARING",
  PREPARING: "READY",
};

const NEXT_ITEM_LABEL: Partial<Record<OrderItemStatus, string>> = {
  PENDING: "Готувати",
  PREPARING: "Готово",
};

const STATUS_LABELS: Record<OrderItemStatus, string> = {
  PENDING: "Очікує",
  PREPARING: "Готується",
  READY: "Готово",
  SERVED: "Подано",
};

export default function KitchenOrderCard({ order, isCritical = false }: KitchenOrderCardProps) {
  const [updateItemStatus] = useUpdateOrderItemStatusMutation();
  const [markAllReady, { isLoading: isMarkingAllReady }] = useMarkAllItemsReadyMutation();
  const { showToast } = useToast();

  const handleStatusUpdate = async (orderId: string, itemId: string, status: OrderItemStatus) => {
    try {
      await updateItemStatus({ orderId, itemId, status }).unwrap();
      showToast({ type: "success", title: "Успіх", message: `Статус оновлено: ${STATUS_LABELS[status]}` });
    } catch {
      showToast({ type: "error", title: "Помилка", message: "Не вдалося оновити статус" });
    }
  };

  const handleMarkAllReady = async () => {
    try {
      await markAllReady(order.id).unwrap();
      showToast({ type: "success", title: "Успіх", message: "Всі страви позначено як готові" });
    } catch {
      showToast({ type: "error", title: "Помилка", message: "Не вдалося оновити статус" });
    }
  };

  const hasUnreadyItems = (order.items ?? []).some(
    (item) => item.status !== "READY" && item.status !== "SERVED"
  );

  return (
    <div className={`${styles.card} ${isCritical ? styles.cardCritical : ""}`}>
      <div className={styles.header}>
        <span className={styles.orderNumber}>#{order.orderNumber}</span>
        <OrderTimer 
          createdAt={order.createdAt}
          preparationTime={30}
          status={order.status}
        />
      </div>

      {order.tableId && (
        <p className={styles.tableInfo}>Столик: {order.tableNumber || order.tableId.slice(0, 8)}</p>
      )}

      {order.notes && (
        <p className={styles.notes}>📝 {order.notes}</p>
      )}

      <div className={styles.itemsList}>
        {(order.items ?? []).map((item) => {
          const nextStatus = NEXT_ITEM_STATUS[item.status];
          const nextLabel = NEXT_ITEM_LABEL[item.status];
          return (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>
                  {item.menuItemName ?? `Позиція #${item.menuItemId.slice(0, 8)}`}
                </p>
                <div className={styles.itemMeta}>
                  <span className={styles.itemQty}>x{item.quantity}</span>
                  <span className={`${styles.itemStatus} ${styles[`status${item.status}`]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
                {item.specialInstructions && (
                  <p className={styles.specialInstructions}>
                    ⚠️ {item.specialInstructions}
                  </p>
                )}
              </div>
              {nextStatus && (
                <button
                  className={styles.advanceBtn}
                  onClick={() => handleStatusUpdate(order.id, item.id, nextStatus)}
                >
                  {nextLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {hasUnreadyItems && (
        <button
          className={styles.markAllReadyBtn}
          onClick={handleMarkAllReady}
          disabled={isMarkingAllReady}
        >
          <CheckCircle size={18} />
          <span>{isMarkingAllReady ? "Оновлення..." : "Все готово"}</span>
        </button>
      )}
    </div>
  );
}
