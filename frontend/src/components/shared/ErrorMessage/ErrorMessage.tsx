import { AlertCircle } from "lucide-react";
import styles from "./ErrorMessage.module.css";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({
  title = "Сталася помилка",
  message = "Спробуйте ще раз або зверніться до підтримки.",
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className={styles.container} role="alert">
      <AlertCircle size={24} className={styles.icon} />
      <div>
        <p className={styles.title}>{title}</p>
        <p className={styles.message}>{message}</p>
        {onRetry && (
          <button className={styles.retry} onClick={onRetry}>
            Спробувати ще раз
          </button>
        )}
      </div>
    </div>
  );
}
