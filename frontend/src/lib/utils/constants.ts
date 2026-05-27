export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const PRICE_RANGES = ["BUDGET", "MODERATE", "EXPENSIVE", "LUXURY"] as const;

export const RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
] as const;

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "SERVED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const TABLE_LOCATIONS = ["INDOOR", "OUTDOOR", "TERRACE", "VIP"] as const;

export const SPICY_LEVELS = ["NONE", "MILD", "MEDIUM", "HOT", "EXTRA_HOT"] as const;

export const ROLE_DASHBOARD_ROUTES: Record<string, string> = {
  CLIENT: "/restaurants",
  MANAGER: "/dashboard/manager/reservations",
  CHEF: "/dashboard/kitchen/orders",
  WAITER: "/dashboard/waiter/tables",
  OWNER: "/dashboard/owner/analytics",
};

export const PROTECTED_ROUTES = [
  "/reservations",
  "/orders",
  "/profile",
  "/dashboard",
];

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_RESERVATION_DURATION = 120;
export const MIN_RESERVATION_HOURS_AHEAD = 1;
export const MAX_RESERVATION_DAYS_AHEAD = 90;
