"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setCredentials } from "@/lib/store/slices/authSlice";
import styles from "./page.module.css";

function OAuth2RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("Помилка авторизації. Спробуйте ще раз.");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    if (!token) {
      setError("Не вдалося отримати токен авторизації.");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    // Fetch user info with the access token
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const user = await response.json();

        // Store credentials in Redux
        dispatch(setCredentials({ 
          accessToken: token, 
          user 
        }));

        // Notify our API route about the successful OAuth login
        // The refresh token is already set as an HttpOnly cookie by the backend
        await fetch("/api/auth/oauth2-callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, user }),
        });

        // Redirect based on user role
        const redirectPath = user.role === "CLIENT" ? "/restaurants" : "/dashboard";
        router.push(redirectPath);
        router.refresh();
      } catch (err) {
        console.error("OAuth2 callback error:", err);
        setError("Помилка при отриманні даних користувача.");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    fetchUserInfo();
  }, [searchParams, router, dispatch]);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.errorIcon}><XCircle size={48} /></div>
          <h1 className={styles.title}>Помилка авторизації</h1>
          <p className={styles.message}>{error}</p>
          <p className={styles.redirect}>Перенаправлення на сторінку входу...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <h1 className={styles.title}>Авторизація...</h1>
        <p className={styles.message}>Будь ласка, зачекайте</p>
      </div>
    </div>
  );
}

export default function OAuth2RedirectPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.spinner} />
          <h1 className={styles.title}>Завантаження...</h1>
        </div>
      </div>
    }>
      <OAuth2RedirectContent />
    </Suspense>
  );
}
