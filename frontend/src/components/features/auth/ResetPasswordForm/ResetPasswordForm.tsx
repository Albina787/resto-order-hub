"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/schemas/authSchema";
import { useResetPasswordMutation } from "@/lib/store/api/authApi";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import styles from "./ResetPasswordForm.module.css";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { control, handleSubmit } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);
    try {
      await resetPassword({ token, newPassword: data.newPassword }).unwrap();
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setServerError(
        apiErr?.data?.message ??
          "Помилка скидання пароля. Посилання може бути застарілим."
      );
    }
  };

  if (success) {
    return (
      <div className={styles.success}>
        <CheckCircle size={48} className={styles.successIcon} />
        <h2 className={styles.heading}>Пароль змінено!</h2>
        <p className={styles.successText}>
          Ваш пароль успішно змінено. Зараз вас буде перенаправлено на сторінку
          входу.
        </p>
        <Link href="/login" className={styles.backLink}>
          Перейти до входу
        </Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <h2 className={styles.heading}>Новий пароль</h2>
        <p className={styles.subheading}>Введіть новий пароль для вашого акаунту</p>
      </div>

      {serverError && (
        <div className={styles.serverError} role="alert">
          {serverError}
        </div>
      )}

      <div className={styles.fields}>
        <div className={styles.passwordWrapper}>
          <Controller
            name="newPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Новий пароль"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Приховати пароль" : "Показати пароль"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className={styles.passwordWrapper}>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Підтвердіть пароль"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Приховати пароль" : "Показати пароль"}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        Змінити пароль
      </Button>
    </form>
  );
}
