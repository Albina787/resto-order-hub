import Badge from "@/components/ui/Badge/Badge";
import { formatReservationStatus } from "@/lib/utils/formatters";
import type { ReservationStatus } from "@/types/reservation";

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
}

type BadgeVariant = "pending" | "confirmed" | "cancelled" | "completed" | "no-show";

const STATUS_VARIANT_MAP: Record<ReservationStatus, BadgeVariant> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no-show",
};

export default function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT_MAP[status]}>
      {formatReservationStatus(status)}
    </Badge>
  );
}
