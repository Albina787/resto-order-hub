'use client';

import { useEffect } from 'react';
import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>⚠️</div>
        <h1 className={styles.title}>Щось пішло не так</h1>
        <p className={styles.description}>
          Виникла непередбачена помилка. Спробуйте оновити сторінку або повернутися пізніше.
        </p>
        {error.message && (
          <details className={styles.details}>
            <summary>Технічні деталі</summary>
            <pre className={styles.errorMessage}>{error.message}</pre>
            {error.digest && (
              <p className={styles.digest}>ID помилки: {error.digest}</p>
            )}
          </details>
        )}
        <div className={styles.actions}>
          <button onClick={reset} className={styles.primaryButton}>
            Спробувати знову
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className={styles.secondaryButton}
          >
            На головну
          </button>
        </div>
      </div>
    </div>
  );
}
