import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Введіть коректний email"),
  password: z.string().min(1, "Пароль обов'язковий"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Ім'я мінімум 2 символи").max(100),
    lastName: z.string().min(2, "Прізвище мінімум 2 символи").max(100),
    email: z.string().email("Введіть коректний email"),
    password: z
      .string()
      .min(8, "Пароль мінімум 8 символів")
      .regex(/[A-Z]/, "Пароль повинен містити велику літеру")
      .regex(/[0-9]/, "Пароль повинен містити цифру")
      .regex(/[^A-Za-z0-9]/, "Пароль повинен містити спеціальний символ"),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, "Введіть коректний номер телефону")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролі не співпадають",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Введіть коректний email"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Пароль мінімум 8 символів")
      .regex(/[A-Z]/, "Пароль повинен містити велику літеру")
      .regex(/[0-9]/, "Пароль повинен містити цифру")
      .regex(/[^A-Za-z0-9]/, "Пароль повинен містити спеціальний символ"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Паролі не співпадають",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Введіть поточний пароль"),
    newPassword: z
      .string()
      .min(8, "Пароль мінімум 8 символів")
      .regex(/[A-Z]/, "Пароль повинен містити велику літеру")
      .regex(/[0-9]/, "Пароль повинен містити цифру")
      .regex(/[^A-Za-z0-9]/, "Пароль повинен містити спеціальний символ"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Паролі не співпадають",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
