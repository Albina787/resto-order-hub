"use client";

import { useEffect } from "react";
import { useGetOrderByIdQuery } from "@/lib/store/api/orderApi";
import { formatDateTime } from "@/lib/utils/formatters";
import OrderTimer from "@/components/shared/OrderTimer/OrderTimer";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import styles from "./OrderStatus.module.css";

interface OrderStatusProps {
  orderId: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Очікує підтвердження",
  CONFIRMED: "Підтверджено",
  PREPARING: "Готується",
  READY: "Готово",
  SERVED: "Подано",
  COMPLETED: "Завершено",
  CANCELLED: "Скасовано",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#FFA500",
  CONFIRMED: "#4169E1",
  PREPARING: "#FF8C00",
  READY: "#32CD32",
  SERVED: "#1E90FF",
  COMPLETED: "#228B22",
  CANCELLED: "#DC143C",
};

export default function OrderStatus({ orderId }: OrderStatusProps) {
  const { data: order, isLoading, isError, refetch } = useGetOrderByIdQuery(orderId, {
    pollingInterval: 15000, // Poll every 15 seconds
  });

  useEffect(() => {
    // Refetch on mount
    refetch();
  }, [refetch]);

  if (isLoading) return <PageSpinner />;
  if (isError || !order) {
    return <ErrorMessage title="Не вдалося завантажити замовлення" onRetry={refetch} />;
  }

  const statusColor = STATUS_COLORS[order.status] || "#666";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Замовлення #{order.orderNumber}</h2>
        <OrderTimer createdAt={order.createdAt} status={order.status} />
      </div>

      <div className={styles.statusCard}>
        <div className={styles.statusIndicator} style={{ background: statusColor }} />
        <div className={styles.statusInfo}>
          <h3 className={styles.statusLabel}>Статус</h3>
          <p className={styles.statusValue}>{STATUS_LABELS[order.status]}</p>
        </div>
      </div>

      <div className={styles.timeline}>
        <div className={`${styles.timelineItem} ${styles.completed}`}>
          <div className={styles.timelineDot} />
          <div className={styles.timelineContent}>
            <p className={styles.timelineLabel}>Створено</p>
            <p className={styles.timelineTime}>{formatDateTime(order.createdAt)}</p>
          </div>
        </div>

        <div
          className={`${styles.timelineItem} ${
            ["CONFIRMED", "PREPARING", "READY", "SERVED", "COMPLETED"].includes(order.status)
              ? styles.completed
              : ""
          }`}
        >
          <div className={styles.timelineDot} />
          <div className={styles.timelineContent}>
            <p className={styles.timelineLabel}>Підтверджено</p>
          </div>
        </div>

        <div
          className={`${styles.timelineItem} ${
            ["PREPARING", "READY", "SERVED", "COMPLETED"].includes(order.status)
              ? styles.completed
              : ""
          }`}
        >
          <div className={styles.timelineDot} />
          <div className={styles.timelineContent}>
            <p className={styles.timelineLabel}>Готується</p>
          </div>
        </div>

        <div
          className={`${styles.timelineItem} ${
            ["READY", "SERVED", "COMPLETED"].includes(order.status) ? styles.completed : ""
          }`}
        >
          <div className={styles.timelineDot} />
          <div className={styles.timelineContent}>
            <p className={styles.timelineLabel}>Готово</p>
          </div>
        </div>

        <div
          className={`${styles.timelineItem} ${
            ["SERVED", "COMPLETED"].includes(order.status) ? styles.completed : ""
          }`}
        >
          <div className={styles.timelineDot} />
          <div className={styles.timelineContent}>
            <p className={styles.timelineLabel}>Подано</p>
          </div>
        </div>

        <div className={`${styles.timelineItem} ${order.status === "COMPLETED" ? styles.completed : ""}`}>
          <div className={styles.timelineDot} />
          <div className={styles.timelineContent}>
            <p className={styles.timelineLabel}>Завершено</p>
            {order.completedAt && (
              <p className={styles.timelineTime}>{formatDateTime(order.completedAt)}</p>
            )}
          </div>
        </div>
      </div>

      {order.items && order.items.length > 0 && (
        <div className={styles.items}>
          <h3 className={styles.itemsTitle}>Страви</h3>
          {order.items.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{item.menuItemName}</p>
                <p className={styles.itemQuantity}>x{item.quantity}</p>
              </div>
              <p className={styles.itemPrice}>{item.subtotal.toFixed(2)} грн</p>
            </div>
          ))}
          <div className={styles.total}>
            <span className={styles.totalLabel}>Разом:</span>
            <span className={styles.totalAmount}>{order.totalAmount.toFixed(2)} грн</span>
          </div>
        </div>
      )}
    </div>
  );
}
