import styles from "./Spinner.module.css";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

export default function Spinner({ size = "md", className, label = "Завантаження..." }: SpinnerProps) {
  return (
    <span
      className={`${styles.spinner} ${styles[size]} ${className ?? ""}`}
      role="status"
      aria-label={label}
    />
  );
}

export function PageSpinner() {
  return (
    <div className={styles.page}>
      <Spinner size="lg" />
    </div>
  );
}
