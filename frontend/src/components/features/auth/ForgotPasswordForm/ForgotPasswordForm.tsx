"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { CheckCircle, ArrowLeft } from "lucide-react";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/schemas/authSchema";
import { useForgotPasswordMutation } from "@/lib/store/api/authApi";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import styles from "./ForgotPasswordForm.module.css";

export default function ForgotPasswordForm() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    try {
      await forgotPassword(data.email).unwrap();
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setServerError(
        apiErr?.data?.message ?? "Помилка. Спробуйте ще раз."
      );
    }
  };

  if (success) {
    return (
      <div className={styles.success}>
        <CheckCircle size={48} className={styles.successIcon} />
        <h2 className={styles.heading}>Перевірте пошту</h2>
        <p className={styles.successText}>
          Якщо акаунт з такою адресою існує, ми надіслали інструкції для
          відновлення пароля.
        </p>
        <Link href="/login" className={styles.backLink}>
          Повернутися до входу
        </Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <h2 className={styles.heading}>Відновлення пароля</h2>
        <p className={styles.subheading}>
          Введіть email і ми надішлемо посилання для відновлення пароля
        </p>
      </div>

      {serverError && (
        <div className={styles.serverError} role="alert">
          {serverError}
        </div>
      )}

      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            label="Email"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            errorMessage={fieldState.error?.message}
          />
        )}
      />

      <Button type="submit" fullWidth isLoading={isLoading}>
        Надіслати посилання
      </Button>

      <p className={styles.footer}>
        <Link href="/login" className={styles.link}>
          <ArrowLeft size={14} /> Повернутися до входу
        </Link>
      </p>
    </form>
  );
}
