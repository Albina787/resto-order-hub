"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useGetReservationQuery, useCancelReservationMutation, useRescheduleReservationMutation } from "@/lib/store/api/reservationApi";
import { formatDate, formatTime, formatDateTime } from "@/lib/utils/formatters";
import ReservationStatusBadge from "@/components/features/reservations/ReservationStatusBadge/ReservationStatusBadge";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";
import { useToast } from "@/lib/hooks/useToast";
import styles from "./ReservationDetail.module.css";

interface ReservationDetailProps {
  reservationId: string;
}

function canCancel(status: string, reservationDate: string, reservationTime: string): boolean {
  if (status !== "PENDING" && status !== "CONFIRMED") return false;
  const dt = new Date(`${reservationDate}T${reservationTime}`);
  const diffHours = (dt.getTime() - Date.now()) / (1000 * 60 * 60);
  return diffHours > 24;
}

export default function ReservationDetail({ reservationId }: ReservationDetailProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const { showToast } = useToast();
  const { data: reservation, isLoading, isError, refetch } = useGetReservationQuery(reservationId);
  const [cancelReservation, { isLoading: isCancelling }] = useCancelReservationMutation();
  const [rescheduleReservation, { isLoading: isRescheduling }] = useRescheduleReservationMutation();

  const handleCancel = async () => {
    try {
      await cancelReservation({ id: reservationId }).unwrap();
      showToast({ type: "success", title: "Успіх", message: "Бронювання успішно скасовано" });
      setShowCancelModal(false);
    } catch {
      showToast({ type: "error", title: "Помилка", message: "Не вдалося скасувати бронювання" });
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      showToast({ type: "error", title: "Помилка", message: "Оберіть нову дату та час" });
      return;
    }
    try {
      await rescheduleReservation({ id: reservationId, newDate, newTime }).unwrap();
      showToast({ type: "success", title: "Успіх", message: "Бронювання успішно перенесено" });
      setShowRescheduleModal(false);
      setNewDate("");
      setNewTime("");
    } catch {
      showToast({ type: "error", title: "Помилка", message: "Не вдалося перенести бронювання" });
    }
  };

  if (isLoading) return <PageSpinner />;
  if (isError || !reservation) {
    return (
      <div className={styles.container}>
        <ErrorMessage title="Бронювання не знайдено" onRetry={refetch} />
      </div>
    );
  }

  const cancellable = canCancel(
    reservation.status,
    reservation.reservationDate,
    reservation.reservationTime
  );

  return (
    <div className={styles.container}>
      <Link href="/reservations" className={styles.backLink}>
        <ArrowLeft size={16} />
        Назад до бронювань
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Деталі бронювання</h1>
        <ReservationStatusBadge status={reservation.status} />
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Інформація про бронювання</h2>
        <div className={styles.detailGrid}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Дата</span>
            <span className={styles.detailValue}>{formatDate(reservation.reservationDate)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Час</span>
            <span className={styles.detailValue}>{formatTime(reservation.reservationTime)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Кількість гостей</span>
            <span className={styles.detailValue}>{reservation.guestCount}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Тривалість</span>
            <span className={styles.detailValue}>{reservation.duration} хв</span>
          </div>
          {reservation.specialRequests && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Побажання</span>
              <span className={styles.detailValue}>{reservation.specialRequests}</span>
            </div>
          )}
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Створено</span>
            <span className={styles.detailValue}>{formatDateTime(reservation.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Контактна інформація</h2>
        <div className={styles.detailGrid}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Ім&apos;я</span>
            <span className={styles.detailValue}>{reservation.customerName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Телефон</span>
            <span className={styles.detailValue}>{reservation.customerPhone}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{reservation.customerEmail}</span>
          </div>
        </div>
      </div>

      {reservation.preOrderItems && reservation.preOrderItems.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Попереднє замовлення</h2>
          <div className={styles.preOrderList}>
            {reservation.preOrderItems.map((item) => (
              <div key={item.menuItemId} className={styles.preOrderItem}>
                <div className={styles.preOrderItemInfo}>
                  <span className={styles.preOrderItemName}>{item.menuItemName}</span>
                  <span className={styles.preOrderItemQuantity}>x{item.quantity}</span>
                </div>
                <span className={styles.preOrderItemPrice}>
                  {(item.price * item.quantity).toFixed(2)} грн
                </span>
              </div>
            ))}
            <div className={styles.preOrderTotal}>
              <span className={styles.preOrderTotalLabel}>Разом:</span>
              <span className={styles.preOrderTotalAmount}>
                {reservation.preOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} грн
              </span>
            </div>
          </div>
        </div>
      )}

      {reservation.cancellationReason && (
        <div className={styles.cancellationReason}>
          <p className={styles.cancellationReasonTitle}>Причина скасування</p>
          <p className={styles.cancellationReasonText}>{reservation.cancellationReason}</p>
        </div>
      )}

      {cancellable && (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setShowRescheduleModal(true)}>
            Перенести бронювання
          </Button>
          <Button variant="danger" onClick={() => setShowCancelModal(true)}>
            Скасувати бронювання
          </Button>
        </div>
      )}

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Скасування бронювання"
        size="sm"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalText}>
            Ви впевнені, що хочете скасувати це бронювання? Цю дію неможливо відмінити.
          </p>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
              Ні, залишити
            </Button>
            <Button variant="danger" isLoading={isCancelling} onClick={handleCancel}>
              Так, скасувати
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Перенесення бронювання"
        size="sm"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalText}>
            Оберіть нову дату та час для бронювання
          </p>
          <div className={styles.rescheduleForm}>
            <div className={styles.formGroup}>
              <label htmlFor="newDate" className={styles.label}>Нова дата</label>
              <input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="newTime" className={styles.label}>Новий час</label>
              <input
                id="newTime"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setShowRescheduleModal(false)}>
              Скасувати
            </Button>
            <Button variant="primary" isLoading={isRescheduling} onClick={handleReschedule}>
              Перенести
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
