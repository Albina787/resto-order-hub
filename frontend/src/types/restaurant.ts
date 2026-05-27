export type PriceRange = "BUDGET" | "MODERATE" | "EXPENSIVE" | "LUXURY";
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";
export type TableLocation = "INDOOR" | "OUTDOOR" | "TERRACE" | "VIP";
export type TableShape = "SQUARE" | "ROUND" | "RECTANGULAR";

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  cuisineType?: string;
  priceRange?: PriceRange;
  capacity: number;
  images: string[];
  isActive: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  id: string;
  restaurantId: string;
  dayOfWeek: DayOfWeek;
  openTime?: string;
  closeTime?: string;
  isClosed: boolean;
}

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  minCapacity: number;
  maxCapacity: number;
  location?: TableLocation;
  shape?: TableShape;
  positionX?: number;
  positionY?: number;
  isActive: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FloorPlan {
  id: string;
  restaurantId: string;
  name: string;
  width: number;
  height: number;
  backgroundImage?: string;
  isActive: boolean;
}

export interface RestaurantStats {
  totalReservations: number;
  totalOrders: number;
  totalRevenue: number;
  averageCheck: number;
}
