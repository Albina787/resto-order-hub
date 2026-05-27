export interface ReservationAnalytics {
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  noShowReservations: number;
  cancellationRate: number;
  byDate: { date: string; count: number }[];
}

export interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageProcessingTime: number;
  byDate: { date: string; count: number; revenue: number }[];
}

export interface PopularItem {
  menuItemId: string;
  menuItemName: string;
  orderCount: number;
  revenue: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  averageCheck: number;
  byDate: { date: string; revenue: number }[];
}

export interface OccupancyAnalytics {
  averageOccupancy: number;
  byDayOfWeek: { day: string; occupancy: number }[];
  byHour: { hour: number; occupancy: number }[];
}

export interface NetworkOverview {
  totalRestaurants: number;
  totalReservations: number;
  totalOrders: number;
  totalRevenue: number;
  restaurants: {
    id: string;
    name: string;
    revenue: number;
    reservations: number;
    orders: number;
  }[];
}
