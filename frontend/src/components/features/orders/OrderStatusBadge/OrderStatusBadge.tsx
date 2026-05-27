import type { OrderStatus } from "@/types/order";
import styles from "./OrderStatusBadge.module.css";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Очікує", className: styles.pending },
  CONFIRMED: { label: "Підтверджено", className: styles.confirmed },
  PREPARING: { label: "Готується", className: styles.preparing },
  READY: { label: "Готово", className: styles.ready },
  SERVED: { label: "Подано", className: styles.served },
  COMPLETED: { label: "Завершено", className: styles.completed },
  CANCELLED: { label: "Скасовано", className: styles.cancelled },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`${styles.badge} ${config.className}`}>
      {config.label}
    </span>
  );
}
