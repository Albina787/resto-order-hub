"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { registerSchema, type RegisterFormData } from "@/lib/schemas/authSchema";
import { useRegisterMutation } from "@/lib/store/api/authApi";
import { setCredentials } from "@/lib/store/slices/authSlice";
import { useAppDispatch } from "@/lib/store/hooks";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/utils/constants";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import OAuthButtons from "@/components/features/auth/OAuthButtons/OAuthButtons";
import styles from "./RegisterForm.module.css";

export default function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _confirmPassword, ...payload } = data;
      const result = await register({
        ...payload,
        phone: payload.phone || undefined,
      }).unwrap();
dispatch(
        setCredentials({
          accessToken: result.accessToken,
          user: result.user,
        })
      );
      const redirectTo =
        ROLE_DASHBOARD_ROUTES[result.user.role] ?? "/restaurants";
      router.push(redirectTo);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setServerError(
        apiErr?.data?.message ?? "Помилка реєстрації. Спробуйте ще раз."
      );
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <h2 className={styles.heading}>Реєстрація</h2>
        <p className={styles.subheading}>Створіть новий акаунт</p>
      </div>

      {serverError && (
        <div className={styles.serverError} role="alert">
          {serverError}
        </div>
      )}

      <div className={styles.fields}>
        <div className={styles.row}>
          <Controller
            name="firstName"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Ім'я"
                placeholder="Іван"
                autoComplete="given-name"
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Прізвище"
                placeholder="Петренко"
                autoComplete="family-name"
                errorMessage={fieldState.error?.message}
              />
            )}
          />
        </div>

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

        <Controller
          name="phone"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Телефон (необов'язково)"
              type="tel"
              placeholder="+380501234567"
              autoComplete="tel"
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <div className={styles.passwordWrapper}>
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Пароль"
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
        Зареєструватися
      </Button>

      <OAuthButtons />

      <p className={styles.footer}>
        Вже є акаунт?{" "}
        <Link href="/login" className={styles.link}>
          Увійти
        </Link>
      </p>
    </form>
  );
}
