import type { ReactNode } from "react";
import { UtensilsCrossed } from "lucide-react";
import styles from "./layout.module.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden="true"><UtensilsCrossed size={32} /></span>
          <h1 className={styles.brandTitle}>RestoOrderHub</h1>
          <p className={styles.brandTagline}>
            Платформа для бронювання столиків та управління замовленнями у ресторанах
          </p>
        </div>
        <div className={styles.formArea}>{children}</div>
      </div>
    </div>
  );
}
