"use client";

import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { uk } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { Reservation } from "@/types/reservation";
import styles from "./ReservationCalendar.module.css";

const locales = {
  uk: uk,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ReservationCalendarProps {
  reservations: Reservation[];
  onSelectReservation: (reservation: Reservation) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Reservation;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#FFA500",
  CONFIRMED: "#4169E1",
  CANCELLED: "#DC143C",
  COMPLETED: "#228B22",
  NO_SHOW: "#808080",
};

export default function ReservationCalendar({
  reservations,
  onSelectReservation,
}: ReservationCalendarProps) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  const events: CalendarEvent[] = useMemo(() => {
    return reservations.map((reservation) => {
      // Parse date + time together to avoid UTC offset issues
      // reservationDate: "2025-04-16", reservationTime: "19:00:00"
      const [year, month, day] = reservation.reservationDate.split("-").map(Number);
      const [hours, minutes] = (reservation.reservationTime ?? "00:00:00").split(":").map(Number);

      const startDate = new Date(year, month - 1, day, hours, minutes, 0);
      const endDate = new Date(startDate.getTime() + (reservation.duration ?? 120) * 60 * 1000);

      return {
        id: reservation.id,
        title: `${reservation.customerName} (${reservation.guestCount} ос.)`,
        start: startDate,
        end: endDate,
        resource: reservation,
      };
    });
  }, [reservations]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = STATUS_COLORS[event.resource.status] || "#4169E1";
    
    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
        fontSize: "12px",
        padding: "2px 4px",
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    onSelectReservation(event.resource);
  };

  return (
    <div className={styles.container}>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: STATUS_COLORS.PENDING }} />
          <span>Очікує</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: STATUS_COLORS.CONFIRMED }} />
          <span>Підтверджено</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: STATUS_COLORS.COMPLETED }} />
          <span>Завершено</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: STATUS_COLORS.CANCELLED }} />
          <span>Скасовано</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: STATUS_COLORS.NO_SHOW }} />
          <span>Не з&apos;явились</span>
        </div>
      </div>

      <div className={styles.calendarWrapper}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          messages={{
            next: "Наступний",
            previous: "Попередній",
            today: "Сьогодні",
            month: "Місяць",
            week: "Тиждень",
            day: "День",
            agenda: "Список",
            date: "Дата",
            time: "Час",
            event: "Подія",
            noEventsInRange: "Немає бронювань у цьому періоді",
            showMore: (total) => `+${total} ще`,
          }}
          culture="uk"
        />
      </div>
    </div>
  );
}
