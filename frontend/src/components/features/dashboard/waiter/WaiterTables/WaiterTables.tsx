"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetTablesQuery } from "@/lib/store/api/restaurantApi";
import { useStaffRestaurant } from "@/lib/hooks/useStaffRestaurant";
import Button from "@/components/ui/Button/Button";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import styles from "./WaiterTables.module.css";

export default function WaiterTables() {
  const router = useRouter();
  const { restaurantId, isLoading: isLoadingRestaurant } = useStaffRestaurant();

  const { data: tables, isLoading, isError, refetch } = useGetTablesQuery(restaurantId!, {
    skip: !restaurantId,
  });

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Столики</h1>
      </div>

      {isLoading && <div className={styles.skeleton} />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && (!tables || tables.length === 0) && (
        <EmptyState title="Столиків не знайдено" />
      )}

      {!isLoading && !isError && tables && tables.length > 0 && (
        <div className={styles.grid}>
          {tables.map((table) => (
            <div
              key={table.id}
              className={`${styles.tableCard} ${table.isAvailable ? styles.available : styles.occupied}`}
              onClick={() => {
                if (table.isAvailable) {
                  router.push(`/dashboard/waiter/orders/new?tableId=${table.id}&restaurantId=${restaurantId}`);
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" && table.isAvailable) {
                  router.push(`/dashboard/waiter/orders/new?tableId=${table.id}&restaurantId=${restaurantId}`);
                }
              }}
            >
              <p className={styles.tableNumber}>#{table.tableNumber}</p>
              <p className={styles.tableCapacity}>{table.capacity} місць</p>
              <span className={`${styles.tableStatus} ${table.isAvailable ? styles.statusAvailable : styles.statusOccupied}`}>
                {table.isAvailable ? "Вільний" : "Зайнятий"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
