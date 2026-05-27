"use client";

import { useState } from "react";
import { useGetMyReservationsQuery } from "@/lib/store/api/reservationApi";
import { useAuth } from "@/lib/hooks/useAuth";
import ReservationCard from "@/components/features/reservations/ReservationCard/ReservationCard";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import type { ReservationStatus } from "@/types/reservation";
import styles from "./ReservationList.module.css";

const STATUS_TABS: { label: string; value: ReservationStatus | "ALL" }[] = [
  { label: "Всі", value: "ALL" },
  { label: "Очікує", value: "PENDING" },
  { label: "Підтверджено", value: "CONFIRMED" },
  { label: "Завершено", value: "COMPLETED" },
  { label: "Скасовано", value: "CANCELLED" },
  { label: "Не з'явився", value: "NO_SHOW" },
];

export default function ReservationList() {
  const [activeTab, setActiveTab] = useState<ReservationStatus | "ALL">("ALL");
  const { isAuthenticated } = useAuth();
  const { data: reservationsData, isLoading, isError, refetch } = useGetMyReservationsQuery(
    {},
    { skip: !isAuthenticated }
  );

  const reservations = Array.isArray(reservationsData)
    ? reservationsData
    : (reservationsData as { content: import("@/types/reservation").Reservation[] } | undefined)?.content ?? [];

  const filtered =
    activeTab === "ALL"
      ? reservations
      : reservations.filter((r) => r.status === activeTab);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мої бронювання</h1>
      </div>

      <div className={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`${styles.tab} ${activeTab === tab.value ? styles.active : ""}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      )}

      {isError && (
        <ErrorMessage
          title="Не вдалося завантажити бронювання"
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title="Бронювань не знайдено"
          description={
            activeTab === "ALL"
              ? "У вас ще немає бронювань"
              : "Немає бронювань з таким статусом"
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className={styles.list}>
          {filtered.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      )}
    </div>
  );
}
