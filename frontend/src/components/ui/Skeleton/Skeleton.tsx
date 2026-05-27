import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
}

export default function Skeleton({
  width,
  height,
  variant = 'rectangular',
  className = '',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
}

// Preset skeleton components
export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <Skeleton height={200} variant="rectangular" />
      <div className={styles.cardContent}>
        <Skeleton height={24} width="70%" variant="text" />
        <Skeleton height={16} width="90%" variant="text" />
        <Skeleton height={16} width="60%" variant="text" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <Skeleton height={20} width="100%" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.tableRow}>
          <Skeleton height={16} width="100%" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className={styles.list}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className={styles.listItem}>
          <Skeleton variant="circular" width={48} height={48} />
          <div className={styles.listItemContent}>
            <Skeleton height={20} width="40%" variant="text" />
            <Skeleton height={16} width="70%" variant="text" />
          </div>
        </div>
      ))}
    </div>
  );
}
