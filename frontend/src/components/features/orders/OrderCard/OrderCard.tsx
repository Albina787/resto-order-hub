"use client";

import Link from "next/link";
import { Clock, MapPin, ShoppingBag } from "lucide-react";
import type { Order } from "@/types/order";
import { formatDateTime, formatCurrency } from "@/lib/utils/formatters";
import OrderStatusBadge from "@/components/features/orders/OrderStatusBadge/OrderStatusBadge";
import styles from "./OrderCard.module.css";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link href={`/orders/${order.id}`} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.orderNumber}>#{order.orderNumber}</span>
          <span className={styles.restaurantName}>
            {order.restaurantName || "Ресторан"}
          </span>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <Clock size={14} className={styles.metaIcon} />
          {formatDateTime(order.createdAt)}
        </span>
        {order.tableNumber && (
          <span className={styles.metaItem}>
            <MapPin size={14} className={styles.metaIcon} />
            Столик {order.tableNumber}
          </span>
        )}
        <span className={styles.metaItem}>
          <ShoppingBag size={14} className={styles.metaIcon} />
          {itemCount} {itemCount === 1 ? "позиція" : "позицій"}
        </span>
      </div>

      <div className={styles.footer}>
        <span className={styles.orderType}>
          {order.orderType === "PRE_ORDER" ? "Попереднє замовлення" : "Замовлення в ресторані"}
        </span>
        <span className={styles.totalAmount}>{formatCurrency(order.totalAmount)}</span>
      </div>
    </Link>
  );
}
