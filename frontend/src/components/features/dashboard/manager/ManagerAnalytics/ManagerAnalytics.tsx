"use client";

import { useState } from "react";
import {
  useGetReservationAnalyticsQuery,
  useGetOrderAnalyticsQuery,
  useGetPopularItemsQuery,
  useGetRestaurantOverviewQuery,
} from "@/lib/store/api/analyticsApi";
import { useStaffRestaurant } from "@/lib/hooks/useStaffRestaurant";
import { formatCurrency } from "@/lib/utils/formatters";
import StatCard from "@/components/features/dashboard/StatCard/StatCard";
import RevenueChart from "@/components/features/analytics/RevenueChart/RevenueChart";
import OrdersChart from "@/components/features/analytics/OrdersChart/OrdersChart";
import ReservationsChart from "@/components/features/analytics/ReservationsChart/ReservationsChart";
import DateRangeSelector, { DateRange } from "@/components/features/analytics/DateRangeSelector/DateRangeSelector";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import RestaurantSelector from "@/components/features/dashboard/RestaurantSelector/RestaurantSelector";
import styles from "./ManagerAnalytics.module.css";

export default function ManagerAnalytics() {
  const { restaurantId, isLoading: isLoadingRestaurant, restaurants, selectRestaurant } =
    useStaffRestaurant();

  const [dateRange, setDateRange] = useState<DateRange>({
    label: "Останні 30 днів",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: overviewData,    isLoading: ovLoading  } = useGetRestaurantOverviewQuery(restaurantId!, { skip: !restaurantId });
  const { data: reservationData, isLoading: resLoading } = useGetReservationAnalyticsQuery(
    { restaurantId: restaurantId!, startDate: dateRange.startDate, endDate: dateRange.endDate },
    { skip: !restaurantId }
  );
  const { data: orderData,    isLoading: ordLoading } = useGetOrderAnalyticsQuery(restaurantId!, { skip: !restaurantId });
  const { data: popularItems, isLoading: popLoading } = useGetPopularItemsQuery(restaurantId!, { skip: !restaurantId });

  if (isLoadingRestaurant) {
    return <div className={styles.container}><div className={styles.skeleton} /></div>;
  }

  if (!restaurantId && restaurants && restaurants.length > 0) {
    return (
      <div className={styles.container}>
        <div className={styles.restaurantPrompt}>
          <p className={styles.promptTitle}>Оберіть ресторан для управління</p>
          <div className={styles.restaurantList}>
            {restaurants.map((r) => (
              <div key={r.id} className={styles.restaurantCard} onClick={() => selectRestaurant(r.id)}>
                <h3>{r.name}</h3>
                <p>{r.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurantId) {
    return <div className={styles.container}><EmptyState title="Ресторан не знайдено" /></div>;
  }

  const isLoading = ovLoading || resLoading || ordLoading || popLoading;

  // Typed access to backend Map<String, Object> responses
  const overview    = overviewData    as Record<string, unknown> | undefined;
  const reservations = reservationData as Record<string, unknown> | undefined;
  const orders      = orderData       as Record<string, unknown> | undefined;
  const popular     = popularItems    as Record<string, unknown> | undefined;

  // Stats — prefer period-specific (reservations/orders) over all-time (overview)
  const totalReservations     = Number(reservations?.totalReservations     ?? overview?.totalReservations     ?? 0);
  const confirmedReservations = Number(reservations?.confirmedReservations ?? overview?.confirmedReservations ?? 0);
  const completedReservations = Number(reservations?.completedReservations ?? overview?.completedReservations ?? 0);
  const cancelledReservations = Number(reservations?.cancelledReservations ?? overview?.cancelledReservations ?? 0);
  const noShowReservations    = Number(reservations?.noShowReservations    ?? overview?.noShowReservations    ?? 0);

  const totalOrders  = Number(orders?.totalOrders      ?? overview?.totalOrders  ?? 0);
  const totalRevenue = Number(orders?.totalRevenue      ?? overview?.totalRevenue  ?? 0);
  const averageCheck = Number(orders?.averageOrderValue ?? overview?.averageCheck  ?? 0);

  // Popular items — backend: { items: [{id, name, price, count}] }
  const popularItemsList = Array.isArray(popular?.items)
    ? (popular.items as { name: string; count: number }[])
    : [];

  // Orders by status for chart
  const ordersStatusData = [
    { status: "COMPLETED", count: Number(orders?.completedOrders  ?? 0), label: "Завершено"  },
    { status: "PREPARING", count: Number(orders?.preparingOrders  ?? 0), label: "Готується"  },
    { status: "READY",     count: Number(orders?.readyOrders      ?? 0), label: "Готово"     },
    { status: "PENDING",   count: Number(orders?.pendingOrders    ?? 0), label: "Очікує"     },
    { status: "CANCELLED", count: Number(orders?.cancelledOrders  ?? 0), label: "Скасовано"  },
  ];

  // Reservations by status for chart
  const reservationsChartData = [
    { date: "Період", confirmed: confirmedReservations, cancelled: cancelledReservations, completed: completedReservations },
  ];

  // Revenue chart — use daily data from revenueAnalytics if available, else placeholder
  const revenueData = [
    { date: dateRange.label, revenue: totalRevenue, orders: totalOrders },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Аналітика</h1>
        <div className={styles.headerActions}>
          <RestaurantSelector />
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {isLoading && <div className={styles.skeleton} />}

      {!isLoading && (
        <>
          {/* KPI Cards */}
          <div className={styles.statsGrid}>
            <StatCard label="Всього бронювань" value={String(totalReservations)} />
            <StatCard label="Підтверджено"     value={String(confirmedReservations)} />
            <StatCard label="Всього замовлень" value={String(totalOrders)} />
            <StatCard label="Виручка"          value={formatCurrency(totalRevenue)} />
            <StatCard label="Середній чек"     value={formatCurrency(averageCheck)} />
          </div>

          <div className={styles.chartsGrid}>
            {/* Revenue Chart */}
            <div className={styles.chartCard}>
              <RevenueChart data={revenueData} isLoading={ovLoading} />
            </div>

            {/* Orders by status */}
            <div className={styles.chartCard}>
              <OrdersChart data={ordersStatusData} isLoading={ordLoading} />
            </div>

            {/* Reservations by status */}
            <div className={styles.chartCard}>
              <ReservationsChart data={reservationsChartData} isLoading={resLoading} />
            </div>

            {/* Popular Items */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Популярні страви</h3>
              {popLoading ? (
                <div className={styles.skeleton} />
              ) : popularItemsList.length > 0 ? (
                <div className={styles.popularList}>
                  {popularItemsList.slice(0, 5).map((item, i) => (
                    <div key={i} className={styles.popularItem}>
                      <span className={styles.popularItemName}>{item.name}</span>
                      <span className={styles.popularItemCount}>{item.count} замовлень</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  Немає даних
                </p>
              )}
            </div>

            {/* Reservation stats breakdown */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Статистика бронювань</h3>
              <div className={styles.popularList}>
                <div className={styles.popularItem}>
                  <span className={styles.popularItemName}>Підтверджено</span>
                  <span className={styles.popularItemCount}>{confirmedReservations}</span>
                </div>
                <div className={styles.popularItem}>
                  <span className={styles.popularItemName}>Завершено</span>
                  <span className={styles.popularItemCount}>{completedReservations}</span>
                </div>
                <div className={styles.popularItem}>
                  <span className={styles.popularItemName}>Скасовано</span>
                  <span className={styles.popularItemCount}>{cancelledReservations}</span>
                </div>
                <div className={styles.popularItem}>
                  <span className={styles.popularItemName}>Не з&apos;явились</span>
                  <span className={styles.popularItemCount}>{noShowReservations}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
