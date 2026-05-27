"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./ReservationsChart.module.css";

interface ReservationData {
  date: string;
  confirmed: number;
  cancelled: number;
  completed: number;
}

interface ReservationsChartProps {
  data: ReservationData[];
  isLoading?: boolean;
}

export default function ReservationsChart({
  data,
  isLoading,
}: ReservationsChartProps) {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyState}>Немає даних для відображення</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Бронювання за днями</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            stroke="var(--color-text-secondary)"
            style={{ fontSize: "var(--font-size-xs)" }}
          />
          <YAxis
            stroke="var(--color-text-secondary)"
            style={{ fontSize: "var(--font-size-xs)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
            }}
          />
          <Legend
            wrapperStyle={{
              fontSize: "var(--font-size-sm)",
              paddingTop: "var(--spacing-4)",
            }}
          />
          <Bar dataKey="confirmed" fill="#4169E1" name="Підтверджено" />
          <Bar dataKey="completed" fill="#228B22" name="Завершено" />
          <Bar dataKey="cancelled" fill="#DC143C" name="Скасовано" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
