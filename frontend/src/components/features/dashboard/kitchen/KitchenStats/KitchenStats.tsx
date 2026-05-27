"use client";

import { useGetKitchenStatsQuery } from "@/lib/store/api/orderApi";
import { useStaffRestaurant } from "@/lib/hooks/useStaffRestaurant";
import { Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import styles from "./KitchenStats.module.css";

export default function KitchenStats() {
  const { restaurantId } = useStaffRestaurant();
  const { data: stats, isLoading } = useGetKitchenStatsQuery(restaurantId ?? "", {
    skip: !restaurantId,
    pollingInterval: 30000, // Оновлення кожні 30 секунд
  });

  if (isLoading || !stats) {
    return <div className={styles.skeleton} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <AlertCircle size={24} />
        </div>
        <div className={styles.statContent}>
          <p className={styles.statLabel}>Активні замовлення</p>
          <p className={styles.statValue}>{stats.activeOrders}</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <CheckCircle size={24} />
        </div>
        <div className={styles.statContent}>
          <p className={styles.statLabel}>Завершено сьогодні</p>
          <p className={styles.statValue}>{stats.completedOrders}</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <Clock size={24} />
        </div>
        <div className={styles.statContent}>
          <p className={styles.statLabel}>Середній час</p>
          <p className={styles.statValue}>{Math.round(stats.averagePreparationTime)} хв</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <TrendingUp size={24} />
        </div>
        <div className={styles.statContent}>
          <p className={styles.statLabel}>Всього сьогодні</p>
          <p className={styles.statValue}>{stats.totalOrders}</p>
        </div>
      </div>

      {stats.topItems && stats.topItems.length > 0 && (
        <div className={styles.topItemsCard}>
          <h3 className={styles.topItemsTitle}>Топ страв сьогодні</h3>
          <ul className={styles.topItemsList}>
            {stats.topItems.map((item, index) => (
              <li key={index} className={styles.topItem}>
                <span className={styles.topItemRank}>{index + 1}</span>
                <span className={styles.topItemName}>{item.name}</span>
                <span className={styles.topItemCount}>{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
