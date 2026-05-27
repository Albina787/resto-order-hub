"use client";

import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useGetNetworkOverviewQuery } from "@/lib/store/api/analyticsApi";
import { formatCurrency } from "@/lib/utils/formatters";
import StatCard from "@/components/features/dashboard/StatCard/StatCard";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";
import styles from "./OwnerAnalytics.module.css";

interface RestaurantStats {
  id: string;
  name: string;
  reservations: number;
  orders: number;
  revenue: number;
}

export default function OwnerAnalytics() {
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");
  const { data: overview, isLoading, isError, refetch } = useGetNetworkOverviewQuery();

  if (isLoading) return <PageSpinner />;
  if (isError) return <ErrorMessage onRetry={refetch} />;
  if (!overview) return null;

  const totalRestaurants = Number(overview.totalRestaurants ?? 0);
  const totalReservations = Number(overview.totalReservations ?? 0);
  const totalOrders = Number(overview.totalOrders ?? 0);
  const totalRevenue = Number(overview.totalRevenue ?? 0);
  const restaurants = (overview.restaurants ?? []) as RestaurantStats[];

  // Prepare chart data
  const chartData = restaurants.map((r) => ({
    name: r.name.length > 15 ? r.name.substring(0, 15) + "..." : r.name,
    fullName: r.name,
    Бронювання: r.reservations,
    Замовлення: r.orders,
    Виручка: r.revenue,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мережева аналітика</h1>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Ресторанів" value={String(totalRestaurants)} />
        <StatCard label="Бронювань" value={String(totalReservations)} />
        <StatCard label="Замовлень" value={String(totalOrders)} />
        <StatCard label="Виручка" value={formatCurrency(totalRevenue)} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Порівняння ресторанів</h2>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleBtn} ${viewMode === "table" ? styles.active : ""}`}
              onClick={() => setViewMode("table")}
            >
              Таблиця
            </button>
            <button
              className={`${styles.toggleBtn} ${viewMode === "chart" ? styles.active : ""}`}
              onClick={() => setViewMode("chart")}
            >
              Графіки
            </button>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ресторан</th>
                  <th>Бронювань</th>
                  <th>Замовлень</th>
                  <th>Виручка</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.reservations}</td>
                    <td>{r.orders}</td>
                    <td>{formatCurrency(r.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Бронювання та Замовлення</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Бронювання" fill="#4169E1" />
                  <Bar dataKey="Замовлення" fill="#32CD32" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Виручка по ресторанах</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="Виручка" stroke="#FF6B6B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {restaurants.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Топ-ресторани</h2>
          <div className={styles.topRestaurants}>
            <div className={styles.topCard}>
              <p className={styles.topLabel}>🏆 Найбільше бронювань</p>
              <p className={styles.topValue}>
                {[...restaurants].sort((a, b) => b.reservations - a.reservations)[0]?.name}
              </p>
              <p className={styles.topCount}>
                {[...restaurants].sort((a, b) => b.reservations - a.reservations)[0]?.reservations} бронювань
              </p>
            </div>

            <div className={styles.topCard}>
              <p className={styles.topLabel}>📦 Найбільше замовлень</p>
              <p className={styles.topValue}>
                {[...restaurants].sort((a, b) => b.orders - a.orders)[0]?.name}
              </p>
              <p className={styles.topCount}>
                {[...restaurants].sort((a, b) => b.orders - a.orders)[0]?.orders} замовлень
              </p>
            </div>

            <div className={styles.topCard}>
              <p className={styles.topLabel}>💰 Найбільша виручка</p>
              <p className={styles.topValue}>
                {[...restaurants].sort((a, b) => b.revenue - a.revenue)[0]?.name}
              </p>
              <p className={styles.topCount}>
                {formatCurrency([...restaurants].sort((a, b) => b.revenue - a.revenue)[0]?.revenue ?? 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
