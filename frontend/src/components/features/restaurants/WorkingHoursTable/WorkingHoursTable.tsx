"use client";

import { useGetWorkingHoursQuery } from "@/lib/store/api/restaurantApi";
import { formatDayOfWeek, formatTime } from "@/lib/utils/formatters";
import { DAYS_OF_WEEK } from "@/lib/utils/constants";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";
import styles from "./WorkingHoursTable.module.css";

interface WorkingHoursTableProps {
  restaurantId: string;
}

const DAY_INDEX: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

function getTodayDayOfWeek(): string {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ...
  return (
    Object.entries(DAY_INDEX).find(([, v]) => v === jsDay)?.[0] ?? "MONDAY"
  );
}

export default function WorkingHoursTable({ restaurantId }: WorkingHoursTableProps) {
  const { data: hours, isLoading } = useGetWorkingHoursQuery(restaurantId);
  const today = getTodayDayOfWeek();

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!hours || hours.length === 0) {
    return null;
  }

  // Build a map for quick lookup
  const hoursMap = Object.fromEntries(hours.map((h) => [h.dayOfWeek, h]));

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Години роботи</h2>
      <table className={styles.table}>
        <tbody>
          {DAYS_OF_WEEK.map((day) => {
            const entry = hoursMap[day];
            const isToday = day === today;

            return (
              <tr
                key={day}
                className={`${styles.row} ${isToday ? styles.today : ""}`}
              >
                <td className={styles.dayCell}>
                  <span className={styles.dayName}>{formatDayOfWeek(day)}</span>
                  {isToday && (
                    <span className={styles.todayBadge}>Сьогодні</span>
                  )}
                </td>
                <td className={styles.hoursCell}>
                  {!entry || entry.isClosed ? (
                    <span className={styles.closed}>Зачинено</span>
                  ) : (
                    <span className={styles.hours}>
                      {entry.openTime ? formatTime(entry.openTime) : "—"}
                      {" – "}
                      {entry.closeTime ? formatTime(entry.closeTime) : "—"}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
