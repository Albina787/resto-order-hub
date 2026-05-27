"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Plus } from "lucide-react";
import { useGetMyOrdersQuery } from "@/lib/store/api/orderApi";
import { useAuth } from "@/lib/hooks/useAuth";
import type { OrderStatus } from "@/types/order";
import OrderCard from "@/components/features/orders/OrderCard/OrderCard";
import Button from "@/components/ui/Button/Button";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import styles from "./page.module.css";

const STATUS_FILTERS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Всі" },
  { value: "PENDING", label: "Очікують" },
  { value: "CONFIRMED", label: "Підтверджені" },
  { value: "PREPARING", label: "Готуються" },
  { value: "READY", label: "Готові" },
  { value: "COMPLETED", label: "Завершені" },
];

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [showQRScanner, setShowQRScanner] = useState(false);

  const { data, isLoading, isError, refetch } = useGetMyOrdersQuery(
    {
      status: statusFilter === "ALL" ? undefined : statusFilter,
      page: 0,
      size: 20,
    },
    { skip: !isAuthenticated }
  );

  // Sort orders by createdAt (newest first)
  const sortedOrders = data?.content ? [...data.content].sort((a, b) => {
    const dateA = Array.isArray(a.createdAt) 
      ? new Date(a.createdAt[0], a.createdAt[1] - 1, a.createdAt[2], a.createdAt[3] || 0, a.createdAt[4] || 0, a.createdAt[5] || 0)
      : new Date(a.createdAt);
    const dateB = Array.isArray(b.createdAt)
      ? new Date(b.createdAt[0], b.createdAt[1] - 1, b.createdAt[2], b.createdAt[3] || 0, b.createdAt[4] || 0, b.createdAt[5] || 0)
      : new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  }) : [];

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <EmptyState
          title="Увійдіть в систему"
          description="Щоб переглядати замовлення, потрібно увійти в обліковий запис"
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мої замовлення</h1>
        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            onClick={() => setShowQRScanner(true)}
          >
            <QrCode size={18} />
            Сканувати QR
          </Button>
          <Button 
            onPress={() => router.push("/orders")}
          >
            <Plus size={18} />
            Нове замовлення
          </Button>
        </div>
      </div>

      <div className={styles.filters}>
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            className={`${styles.filterButton} ${
              statusFilter === filter.value ? styles.filterButtonActive : ""
            }`}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className={styles.skeleton}>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      )}

      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && sortedOrders.length === 0 && (
        <EmptyState
          title="Замовлень не знайдено"
          description={
            statusFilter === "ALL"
              ? "У вас ще немає замовлень. Створіть перше замовлення!"
              : `Немає замовлень зі статусом "${STATUS_FILTERS.find((f) => f.value === statusFilter)?.label}"`
          }
        />
      )}

      {!isLoading && !isError && sortedOrders.length > 0 && (
        <div className={styles.orderList}>
          {sortedOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {showQRScanner && (
        <div className={styles.modal} onClick={() => setShowQRScanner(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.qrPlaceholder}>
              <QrCode size={64} className={styles.qrIcon} />
              <h3 className={styles.qrTitle}>Сканування QR-коду</h3>
              <p className={styles.qrDescription}>
                Камера для сканування QR-коду буде доступна в наступній версії
              </p>
              <Button onClick={() => setShowQRScanner(false)}>Зрозуміло</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
