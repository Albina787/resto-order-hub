import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Сторінку не знайдено</h2>
        <p className={styles.description}>
          На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primaryButton}>
            На головну
          </Link>
          <Link href="/restaurants" className={styles.secondaryButton}>
            До ресторанів
          </Link>
        </div>
      </div>
    </div>
  );
}
