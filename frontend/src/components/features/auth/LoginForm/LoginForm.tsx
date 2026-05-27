"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { loginSchema, type LoginFormData } from "@/lib/schemas/authSchema";
// Default test password for all seeded users: Password123!
import { setCredentials } from "@/lib/store/slices/authSlice";
import { baseApi } from "@/lib/store/api/baseApi";
import { useAppDispatch } from "@/lib/store/hooks";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import OAuthButtons from "@/components/features/auth/OAuthButtons/OAuthButtons";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setServerError(err?.message ?? "Невірний email або пароль.");
        return;
      }

      const { redirectTo, user, accessToken } = await res.json();

      // Update Redux store with credentials
      dispatch(setCredentials({ accessToken, user }));
      dispatch(baseApi.util.invalidateTags(["User", "Auth"]));

      // Navigate — cookie is set by backend and forwarded by route handler
      router.push(redirectTo);
      router.refresh();
    } catch {
      setServerError("Помилка з'єднання. Спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <h2 className={styles.heading}>Вхід</h2>
        <p className={styles.subheading}>Увійдіть до свого акаунту</p>
      </div>

      {serverError && (
        <div className={styles.serverError} role="alert">
          {serverError}
        </div>
      )}

      <div className={styles.fields}>
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

        <div>
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
                  autoComplete="current-password"
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
          <Link href="/forgot-password" className={styles.forgotLink}>
            Забули пароль?
          </Link>
        </div>
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        Увійти
      </Button>

      <OAuthButtons />

      <p className={styles.footer}>
        Немає акаунту?{" "}
        <Link href="/register" className={styles.link}>
          Зареєструватися
        </Link>
      </p>
    </form>
  );
}
