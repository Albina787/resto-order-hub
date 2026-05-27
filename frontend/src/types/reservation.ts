export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";
export type ConfirmationType = "AUTO" | "MANUAL";

export interface PreOrderItem {
  menuItemId: string;
  menuItemName: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  userId: string;
  tableId?: string;
  tableNumber?: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  duration: number;
  status: ReservationStatus;
  confirmationType?: ConfirmationType;
  specialRequests?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  cancellationReason?: string;
  cancelledAt?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  createdAt: string;
  updatedAt: string;
  preOrderItems?: PreOrderItem[];
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
  availableTables: number;
}

export interface CreateReservationRequest {
  restaurantId: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  specialRequests?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  preOrderItems?: PreOrderItem[];
}

export interface UpdateReservationRequest {
  guestCount?: number;
  reservationDate?: string;
  reservationTime?: string;
  specialRequests?: string;
}
