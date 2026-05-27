import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";

export const formatDate = (date: string | Date | number[]): string => {
  // Handle array format from backend: [2026, 4, 16] -> "2026-04-16"
  if (Array.isArray(date) && date.length >= 3) {
    const [year, month, day] = date;
    const d = new Date(year, month - 1, day);
    return format(d, "dd.MM.yyyy", { locale: uk });
  }
  const d = typeof date === "string" ? parseISO(date) : (date as Date);
  return format(d, "dd.MM.yyyy", { locale: uk });
};

export const formatTime = (time: string | Date | number[]): string => {
  // Handle array format from backend: [18, 30] or [18, 30, 45]
  if (Array.isArray(time)) {
    if (time.length >= 2) {
      return `${String(time[0]).padStart(2, '0')}:${String(time[1]).padStart(2, '0')}`;
    }
    return "00:00";
  }
  
  // Handle Date object
  if (time instanceof Date) {
    return format(time, "HH:mm", { locale: uk });
  }
  
  // Handle string
  const timeStr = String(time);
  
  // If it's an ISO string, parse it
  if (timeStr.includes('T') || timeStr.includes('-')) {
    try {
      const d = parseISO(timeStr);
      return format(d, "HH:mm", { locale: uk });
    } catch {
      // Continue to other formats
    }
  }
  
  // If time in format HH:MM:SS or HH:MM, return HH:MM
  if (timeStr.includes(':')) {
    return timeStr.slice(0, 5);
  }
  
  // If time in format HHMM (4 digits), add colon
  if (/^\d{4}$/.test(timeStr)) {
    const hours = timeStr.slice(0, 2);
    const minutes = timeStr.slice(2, 4);
    if (parseInt(hours) >= 24) {
      return "00:00";
    }
    return `${hours}:${minutes}`;
  }
  
  return "00:00";
};

export const formatDateTime = (date: string | Date | number[]): string => {
  // Handle array format from backend: [2026, 4, 16, 23, 14, 54] -> "2026-04-16T23:14:54"
  if (Array.isArray(date) && date.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = date;
    const d = new Date(year, month - 1, day, hour, minute, second);
    return format(d, "dd.MM.yyyy HH:mm", { locale: uk });
  }
  const d = typeof date === "string" ? parseISO(date) : (date as Date);
  return format(d, "dd.MM.yyyy HH:mm", { locale: uk });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPriceRange = (range: string): string => {
  const map: Record<string, string> = {
    BUDGET: "Бюджетний",
    MODERATE: "Середній",
    EXPENSIVE: "Дорогий",
    LUXURY: "Люкс",
  };
  return map[range] ?? range;
};

export const formatReservationStatus = (status: string): string => {
  const map: Record<string, string> = {
    PENDING: "Очікує",
    CONFIRMED: "Підтверджено",
    CANCELLED: "Скасовано",
    COMPLETED: "Завершено",
    NO_SHOW: "Не з'явився",
  };
  return map[status] ?? status;
};

export const formatOrderStatus = (status: string): string => {
  const map: Record<string, string> = {
    PENDING: "Очікує",
    CONFIRMED: "Підтверджено",
    PREPARING: "Готується",
    READY: "Готово",
    SERVED: "Подано",
    COMPLETED: "Завершено",
    CANCELLED: "Скасовано",
  };
  return map[status] ?? status;
};

export const formatUserRole = (role: string): string => {
  const map: Record<string, string> = {
    GUEST: "Гість",
    CLIENT: "Клієнт",
    WAITER: "Офіціант",
    CHEF: "Кухар",
    MANAGER: "Менеджер",
    OWNER: "Власник",
  };
  return map[role] ?? role;
};

export const formatDayOfWeek = (day: string): string => {
  const map: Record<string, string> = {
    MONDAY: "Понеділок",
    TUESDAY: "Вівторок",
    WEDNESDAY: "Середа",
    THURSDAY: "Четвер",
    FRIDAY: "П'ятниця",
    SATURDAY: "Субота",
    SUNDAY: "Неділя",
  };
  return map[day] ?? day;
};
