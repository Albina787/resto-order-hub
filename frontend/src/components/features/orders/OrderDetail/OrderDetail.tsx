"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useGetOrderByIdQuery, useCancelOrderMutation } from "@/lib/store/api/orderApi";
import { formatCurrency, formatDateTime } from "@/lib/utils/formatters";
import OrderStatusBadge from "@/components/features/orders/OrderStatusBadge/OrderStatusBadge";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";
import styles from "./OrderDetail.module.css";

interface OrderDetailProps {
  orderId: string;
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  PRE_ORDER: "Попереднє замовлення",
  DINE_IN: "В ресторані",
};

export default function OrderDetail({ orderId }: OrderDetailProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { data: order, isLoading, isError, refetch } = useGetOrderByIdQuery(orderId);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const handleCancel = async () => {
    try {
      await cancelOrder(orderId).unwrap();
      setShowCancelModal(false);
    } catch {
      // handled by RTK Query
    }
  };

  if (isLoading) return <PageSpinner />;
  if (isError || !order) {
    return (
      <div className={styles.container}>
        <ErrorMessage title="Замовлення не знайдено" onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/orders" className={styles.backLink}>
        <ArrowLeft size={16} />
        Назад до замовлень
      </Link>

      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Замовлення</h1>
          <span className={styles.orderNumber}>#{order.orderNumber}</span>
        </div>
        <div>
          <Badge variant="info">{ORDER_TYPE_LABELS[order.orderType] ?? order.orderType}</Badge>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Items */}
      {order.items && order.items.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Позиції замовлення</h2>
          <div className={styles.itemsList}>
            {order.items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.menuItemName ?? `Позиція #${item.menuItemId.slice(0, 8)}`}</p>
                  <p className={styles.itemQty}>x{item.quantity} &times; {formatCurrency(item.price)}</p>
                </div>
                <span className={styles.itemPrice}>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Разом</span>
            <span className={styles.totalValue}>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      )}

      {/* Details */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Деталі замовлення</h2>
        <div className={styles.detailGrid}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Дата створення</span>
            <span className={styles.detailValue}>{formatDateTime(order.createdAt)}</span>
          </div>
          {order.completedAt && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Завершено</span>
              <span className={styles.detailValue}>{formatDateTime(order.completedAt)}</span>
            </div>
          )}
          {order.notes && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Примітки</span>
              <span className={styles.detailValue}>{order.notes}</span>
            </div>
          )}
        </div>
      </div>

      {order.status === "PENDING" && (
        <div className={styles.actions}>
          <Button variant="danger" onClick={() => setShowCancelModal(true)}>
            Скасувати замовлення
          </Button>
        </div>
      )}

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Скасування замовлення"
        size="sm"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalText}>
            Ви впевнені, що хочете скасувати це замовлення?
          </p>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
              Ні
            </Button>
            <Button variant="danger" isLoading={isCancelling} onClick={handleCancel}>
              Так, скасувати
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
