"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, AlertTriangle, Radio } from "lucide-react";
import { useGetKitchenOrdersQuery, useGetCriticalOrdersQuery } from "@/lib/store/api/orderApi";
import { useStaffRestaurant } from "@/lib/hooks/useStaffRestaurant";
import KitchenOrderCard from "@/components/features/dashboard/kitchen/KitchenOrderCard/KitchenOrderCard";
import KitchenStats from "@/components/features/dashboard/kitchen/KitchenStats/KitchenStats";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import type { Order } from "@/types/order";
import styles from "./KitchenBoard.module.css";

const COLUMNS: { title: string; statuses: string[]; key: string }[] = [
  { key: "pending", title: "Нові", statuses: ["PENDING"] },
  { key: "preparing", title: "Готується", statuses: ["CONFIRMED", "PREPARING"] },
  { key: "ready", title: "Готово", statuses: ["READY"] },
];

export default function KitchenBoard() {
  const { restaurantId, isLoading: isLoadingRestaurant } = useStaffRestaurant();
  const { data: orders, isLoading, isError, refetch } = useGetKitchenOrdersQuery(
    restaurantId ?? "",
    { skip: !restaurantId, pollingInterval: 15000 }
  );
  const { data: criticalOrders } = useGetCriticalOrdersQuery(restaurantId ?? "", {
    skip: !restaurantId,
    pollingInterval: 30000,
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCritical, setShowCritical] = useState(false);
  const [mounted, setMounted] = useState(false);
  const previousOrderCountRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fix hydration - only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize audio
  useEffect(() => {
    if (typeof Audio !== "undefined") {
      audioRef.current = new Audio("/notification.mp3");
    }
  }, []);

  // Play sound for new orders
  useEffect(() => {
    if (!orders || !soundEnabled || !mounted) return;

    const currentCount = orders.filter((o) => o.status === "PENDING").length;
    const previousCount = previousOrderCountRef.current;

    if (previousCount > 0 && currentCount > previousCount) {
      // New order arrived
      audioRef.current?.play().catch(() => {
        // Ignore if audio fails
      });
    }

    previousOrderCountRef.current = currentCount;
  }, [orders, soundEnabled, mounted]);

  const getColumnOrders = (statuses: string[]): Order[] => {
    const filtered = (orders ?? []).filter((o) => statuses.includes(o.status));
    // Sort by creation time (oldest first - most urgent)
    return filtered.sort((a, b) => {
      const dateA = Array.isArray(a.createdAt) 
        ? new Date(a.createdAt[0], a.createdAt[1] - 1, a.createdAt[2], a.createdAt[3] || 0, a.createdAt[4] || 0, a.createdAt[5] || 0)
        : new Date(a.createdAt);
      const dateB = Array.isArray(b.createdAt)
        ? new Date(b.createdAt[0], b.createdAt[1] - 1, b.createdAt[2], b.createdAt[3] || 0, b.createdAt[4] || 0, b.createdAt[5] || 0)
        : new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted || isLoadingRestaurant) {
    return <div className={styles.container}><div className={styles.skeleton} /></div>;
  }

  if (!restaurantId) {
    return (
      <div className={styles.container}>
        <EmptyState title="Ресторан не знайдено. Зверніться до адміністратора." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Кухня</h1>
          <span className={styles.pollingBadge}><Radio size={12} /> Оновлення кожні 15с</span>
        </div>
        <div className={styles.headerActions}>
          {criticalOrders && criticalOrders.length > 0 && (
            <button
              className={`${styles.criticalBtn} ${showCritical ? styles.criticalBtnActive : ""}`}
              onClick={() => setShowCritical(!showCritical)}
            >
              <AlertTriangle size={20} />
              <span>Критичні ({criticalOrders.length})</span>
            </button>
          )}
          <button
            className={styles.soundToggle}
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? "Вимкнути звук" : "Увімкнути звук"}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      <KitchenStats />

      {isLoading && <div className={styles.skeleton} />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {showCritical && criticalOrders && criticalOrders.length > 0 && (
        <div className={styles.criticalSection}>
          <h2 className={styles.criticalTitle}>
            <AlertTriangle size={20} />
            Критичні замовлення (очікують &gt; 30 хв)
          </h2>
          <div className={styles.criticalCards}>
            {criticalOrders.map((order) => (
              <KitchenOrderCard key={order.id} order={order} isCritical />
            ))}
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <div className={styles.kanban}>
          {COLUMNS.map((col) => {
            const colOrders = getColumnOrders(col.statuses);
            return (
              <div key={col.key} className={`${styles.column} ${styles[`column${col.key.charAt(0).toUpperCase() + col.key.slice(1)}`]}`}>
                <div className={styles.columnHeader}>
                  <span className={styles.columnTitle}>{col.title}</span>
                  <span className={styles.columnCount}>{colOrders.length}</span>
                </div>
                <div className={styles.cards}>
                  {colOrders.length === 0 ? (
                    <div className={styles.emptyColumn}>
                      <p className={styles.emptyText}>Немає замовлень</p>
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <KitchenOrderCard key={order.id} order={order} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
