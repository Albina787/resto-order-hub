"use client";

import Link from "next/link";
import { Calendar, Clock, Users } from "lucide-react";
import type { Reservation } from "@/types/reservation";
import { formatDate, formatTime } from "@/lib/utils/formatters";
import ReservationStatusBadge from "@/components/features/reservations/ReservationStatusBadge/ReservationStatusBadge";
import styles from "./ReservationCard.module.css";

interface ReservationCardProps {
  reservation: Reservation;
}

function canCancel(reservation: Reservation): boolean {
  if (reservation.status !== "PENDING" && reservation.status !== "CONFIRMED") return false;
  const reservationDateTime = new Date(
    `${reservation.reservationDate}T${reservation.reservationTime}`
  );
  const now = new Date();
  const diffHours = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours > 24;
}

export default function ReservationCard({ reservation }: ReservationCardProps) {
  const cancellable = canCancel(reservation);

  return (
    <Link href={`/reservations/${reservation.id}`} className={styles.card}>
      <div className={styles.header}>
        <span className={styles.restaurantName}>
          {reservation.restaurantName || "Ресторан"}
        </span>
        <ReservationStatusBadge status={reservation.status} />
      </div>

      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <Calendar size={14} className={styles.metaIcon} />
          {formatDate(reservation.reservationDate)}
        </span>
        <span className={styles.metaItem}>
          <Clock size={14} className={styles.metaIcon} />
          {formatTime(reservation.reservationTime)}
        </span>
        <span className={styles.metaItem}>
          <Users size={14} className={styles.metaIcon} />
          {reservation.guestCount} гостей
        </span>
      </div>

      <div className={styles.footer}>
        <span className={styles.customerName}>{reservation.customerName}</span>
        {cancellable && (
          <button
            className={styles.cancelButton}
            onClick={(e) => {
              e.preventDefault();
              // Navigate to detail page for cancellation
            }}
          >
            Скасувати
          </button>
        )}
      </div>
    </Link>
  );
}
