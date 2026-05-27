"use client";

import { useState } from "react";
import {
  useGetRestaurantReservationsQuery,
  useConfirmReservationMutation,
  useCancelReservationByManagerMutation,
  useAssignTableMutation,
} from "@/lib/store/api/reservationApi";
import { useGetTablesQuery } from "@/lib/store/api/restaurantApi";
import { useStaffRestaurant } from "@/lib/hooks/useStaffRestaurant";
import { useToast } from "@/lib/hooks/useToast";
import { formatDate, formatTime } from "@/lib/utils/formatters";
import ReservationStatusBadge from "@/components/features/reservations/ReservationStatusBadge/ReservationStatusBadge";
import ReservationCalendar from "@/components/features/dashboard/manager/ReservationCalendar/ReservationCalendar";
import RestaurantSelector from "@/components/features/dashboard/RestaurantSelector/RestaurantSelector";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";
import type { ReservationStatus, Reservation } from "@/types/reservation";
import styles from "./ManagerReservations.module.css";

const STATUS_TABS: { label: string; value: ReservationStatus | "ALL" }[] = [
  { label: "Всі", value: "ALL" },
  { label: "Очікує", value: "PENDING" },
  { label: "Підтверджено", value: "CONFIRMED" },
  { label: "Завершено", value: "COMPLETED" },
  { label: "Скасовано", value: "CANCELLED" },
];

type ViewMode = "list" | "calendar";

// ─── Inner component — rendered only when restaurantId is known ───────────────
function ReservationsContent({ restaurantId }: { restaurantId: string }) {
  const { restaurant, restaurants, canSelectRestaurant, selectRestaurant } = useStaffRestaurant();
  const toast = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [dateFilter, setDateFilter] = useState("");
  const [activeTab, setActiveTab] = useState<ReservationStatus | "ALL">("ALL");
  const [cancelModal, setCancelModal] = useState<{ id: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [assignModal, setAssignModal] = useState<{ id: string } | null>(null);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [, setSelectedReservation] = useState<Reservation | null>(null);

  const { data: reservationsData, isLoading, isError, refetch } =
    useGetRestaurantReservationsQuery(
      {
        restaurantId,
        ...(dateFilter && { date: dateFilter }),
        ...(activeTab !== "ALL" && { status: activeTab }),
      },
      { skip: !restaurantId }
    );

  const reservations = Array.isArray(reservationsData)
    ? reservationsData
    : (reservationsData as { content: Reservation[] } | undefined)?.content ?? [];

  const { data: tables } = useGetTablesQuery(restaurantId, { skip: !restaurantId });

  const [confirmReservation] = useConfirmReservationMutation();
  const [cancelByManager, { isLoading: isCancelling }] = useCancelReservationByManagerMutation();
  const [assignTable, { isLoading: isAssigning }] = useAssignTableMutation();

  const handleConfirm = async (id: string) => {
    try {
      await confirmReservation(id).unwrap();
      toast.success("Бронювання підтверджено", "Клієнту надіслано email-повідомлення");
    } catch {
      toast.error("Помилка", "Не вдалося підтвердити бронювання");
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    try {
      await cancelByManager({
        id: cancelModal.id,
        reason: cancelReason || "Скасовано менеджером",
      }).unwrap();
      toast.warning("Бронювання скасовано", "Клієнту надіслано повідомлення");
      setCancelModal(null);
      setCancelReason("");
    } catch {
      toast.error("Помилка", "Не вдалося скасувати бронювання");
    }
  };

  const handleAssignTable = async () => {
    if (!assignModal || !selectedTableId) return;
    try {
      await assignTable({ id: assignModal.id, tableId: selectedTableId }).unwrap();
      toast.success("Столик призначено", "Бронювання оновлено");
      setAssignModal(null);
      setSelectedTableId("");
    } catch {
      toast.error("Помилка", "Не вдалося призначити столик");
    }
  };

  const filtered = reservations.filter((r) =>
    activeTab === "ALL" ? true : r.status === activeTab
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Бронювання</h1>
          {restaurant && <p className={styles.subtitle}>{restaurant.name}</p>}
        </div>
        <RestaurantSelector />
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Дата:</span>
          <input
            type="date"
            className={styles.nativeInput}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === "list" ? styles.active : ""}`}
            onClick={() => setViewMode("list")}
          >
            📋 Список
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === "calendar" ? styles.active : ""}`}
            onClick={() => setViewMode("calendar")}
          >
            📅 Календар
          </button>
        </div>
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

      {isLoading && <div className={styles.skeleton} />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState title="Бронювань не знайдено" />
      )}

      {!isLoading && !isError && filtered.length > 0 && viewMode === "list" && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Час</th>
                <th>Клієнт</th>
                <th>Гостей</th>
                <th>Статус</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.reservationDate)}</td>
                  <td>{formatTime(r.reservationTime)}</td>
                  <td>
                    <div>{r.customerName}</div>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      {r.customerPhone}
                    </div>
                  </td>
                  <td>{r.guestCount}</td>
                  <td><ReservationStatusBadge status={r.status} /></td>
                  <td>
                    <div className={styles.actions}>
                      {r.status === "PENDING" && (
                        <button
                          className={`${styles.actionBtn} ${styles.confirmBtn}`}
                          onClick={() => handleConfirm(r.id)}
                        >
                          Підтвердити
                        </button>
                      )}
                      {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                        <button
                          className={`${styles.actionBtn} ${styles.cancelBtn}`}
                          onClick={() => setCancelModal({ id: r.id })}
                        >
                          Скасувати
                        </button>
                      )}
                      {r.status === "CONFIRMED" && !r.tableId && (
                        <button
                          className={`${styles.actionBtn} ${styles.assignBtn}`}
                          onClick={() => setAssignModal({ id: r.id })}
                        >
                          Столик
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && viewMode === "calendar" && (
        <ReservationCalendar
          reservations={filtered}
          onSelectReservation={(reservation) => setSelectedReservation(reservation)}
        />
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={!!cancelModal}
        onClose={() => { setCancelModal(null); setCancelReason(""); }}
        title="Скасування бронювання"
        size="sm"
      >
        <div className={styles.modalContent}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Причина скасування</label>
            <input
              type="text"
              className={styles.nativeInput}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Вкажіть причину..."
            />
          </div>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setCancelModal(null)}>Скасувати</Button>
            <Button variant="danger" isLoading={isCancelling} onClick={handleCancel}>
              Підтвердити
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Table Modal */}
      <Modal
        isOpen={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Призначити столик"
        size="sm"
      >
        <div className={styles.modalContent}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Столик</label>
            <select
              className={styles.nativeSelect}
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
            >
              <option value="">Оберіть столик...</option>
              {(tables ?? []).filter((t) => t.isAvailable).map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.tableNumber} — {t.capacity} місць
                </option>
              ))}
            </select>
          </div>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setAssignModal(null)}>Скасувати</Button>
            <Button isLoading={isAssigning} isDisabled={!selectedTableId} onClick={handleAssignTable}>
              Призначити
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Outer shell — handles loading/empty states before restaurantId is known ──
export default function ManagerReservations() {
  const { restaurantId, restaurants, isLoading, canSelectRestaurant, selectRestaurant } =
    useStaffRestaurant();

  if (isLoading) {
    return <PageSpinner />;
  }

  if (restaurants.length === 0) {
    return (
      <div className={styles.container}>
        <EmptyState
          title="Немає доступних ресторанів"
          description="Ви не призначені до жодного ресторану. Зверніться до адміністратора."
        />
      </div>
    );
  }

  // Owner hasn't selected a restaurant yet
  if (canSelectRestaurant && !restaurantId) {
    return (
      <div className={styles.container}>
        <div className={styles.restaurantPrompt}>
          <p className={styles.promptTitle}>Оберіть ресторан для управління</p>
          <div className={styles.restaurantList}>
            {restaurants.map((r) => (
              <button
                key={r.id}
                className={styles.restaurantCard}
                onClick={() => selectRestaurant(r.id)}
              >
                <h3>{r.name}</h3>
                <p>{r.address}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurantId) {
    return <PageSpinner />;
  }

  // restaurantId is guaranteed here — render the full content
  return <ReservationsContent restaurantId={restaurantId} />;
}
