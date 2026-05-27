import { z } from "zod";

export const orderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1, "Мінімум 1").max(99),
  specialInstructions: z.string().max(255).optional(),
});

export const createOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  reservationId: z.string().uuid().optional(),
  tableId: z.string().uuid().optional(),
  orderType: z.enum(["PRE_ORDER", "DINE_IN"]),
  notes: z.string().max(500).optional(),
  items: z.array(orderItemSchema).min(1, "Додайте хоча б одну страву"),
});

export type CreateOrderFormData = z.infer<typeof createOrderSchema>;
