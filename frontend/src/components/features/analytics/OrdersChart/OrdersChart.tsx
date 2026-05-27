"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./OrdersChart.module.css";

interface OrdersData {
  status: string;
  count: number;
  label: string;
}

interface OrdersChartProps {
  data: OrdersData[];
  isLoading?: boolean;
}

const COLORS = {
  PENDING: "#FFA500",
  CONFIRMED: "#4169E1",
  PREPARING: "#FFD700",
  READY: "#32CD32",
  SERVED: "#00CED1",
  COMPLETED: "#228B22",
  CANCELLED: "#DC143C",
};

export default function OrdersChart({ data, isLoading }: OrdersChartProps) {
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
      <h3 className={styles.title}>Замовлення за статусами</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }: { name?: string; percent?: number }) =>
              `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`
            }
            labelLine={{ stroke: "var(--color-text-secondary)" }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.status as keyof typeof COLORS] || "#8884d8"}
              />
            ))}
          </Pie>
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
              paddingTop: "var(--spacing-2)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
