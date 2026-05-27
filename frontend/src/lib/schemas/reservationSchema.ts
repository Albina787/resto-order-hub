import { z } from "zod";

export const preOrderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  menuItemName: z.string(),
  price: z.number(),
  quantity: z.number().int().min(1),
  specialInstructions: z.string().optional(),
});

export const reservationSchema = z.object({
  restaurantId: z.string().uuid("Некоректний ID ресторану"),
  guestCount: z
    .number({ error: (issue) => issue.input === undefined ? "Введіть кількість гостей" : "Введіть число" })
    .int()
    .min(1, "Мінімум 1 гість")
    .max(50, "Максимум 50 гостей"),
  reservationDate: z.string().min(1, "Оберіть дату"),
  reservationTime: z.union([
    z.string().min(1, "Оберіть час"),
    z.array(z.number())
  ]).refine((val) => {
    if (Array.isArray(val)) return val.length === 2;
    return val.length >= 1;
  }, "Оберіть час"),
  specialRequests: z.string().max(500, "Максимум 500 символів").optional(),
  customerName: z.string().min(2, "Ім'я мінімум 2 символи").max(255),
  customerPhone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Введіть коректний номер телефону"),
  customerEmail: z.string().email("Введіть коректний email"),
  preOrderItems: z.array(preOrderItemSchema).optional(),
});

export type PreOrderItem = z.infer<typeof preOrderItemSchema>;
export type ReservationFormData = z.infer<typeof reservationSchema>;
