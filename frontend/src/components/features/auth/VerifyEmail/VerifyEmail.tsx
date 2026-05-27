"use client";

import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { useVerifyEmailQuery } from "@/lib/store/api/authApi";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";
import styles from "./VerifyEmail.module.css";

interface VerifyEmailProps {
  token: string;
}

export default function VerifyEmail({ token }: VerifyEmailProps) {
  const { isLoading, isSuccess, isError } = useVerifyEmailQuery(token);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <PageSpinner />
        <p className={styles.loadingText}>Перевірка email...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={styles.container}>
        <CheckCircle size={56} className={styles.successIcon} />
        <h2 className={styles.heading}>Email підтверджено!</h2>
        <p className={styles.text}>
          Ваш email успішно підтверджено. Тепер ви можете увійти до свого акаунту.
        </p>
        <Link href="/login" className={styles.button}>
          Перейти до входу
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <XCircle size={56} className={styles.errorIcon} />
        <h2 className={styles.heading}>Помилка підтвердження</h2>
        <p className={styles.text}>
          Посилання для підтвердження недійсне або застаріло. Спробуйте
          зареєструватися знову або зверніться до підтримки.
        </p>
        <Link href="/register" className={styles.button}>
          Зареєструватися знову
        </Link>
      </div>
    );
  }

  return null;
}
