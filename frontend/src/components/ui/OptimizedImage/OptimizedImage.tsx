import Image from 'next/image';
import { useState } from 'react';
import styles from './OptimizedImage.module.css';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * Оптимізований компонент зображення з підтримкою lazy loading,
 * placeholder та обробкою помилок
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  objectFit = 'cover',
  sizes,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Fallback зображення
  const fallbackSrc = '/images/placeholder.jpg';

  if (hasError) {
    return (
      <div
        className={`${styles.placeholder} ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  const imageProps = {
    src: src || fallbackSrc,
    alt,
    quality,
    priority,
    className: `${styles.image} ${isLoading ? styles.loading : styles.loaded} ${className}`,
    onLoad: () => setIsLoading(false),
    onError: () => {
      setHasError(true);
      setIsLoading(false);
    },
    ...(fill
      ? { fill: true, style: { objectFit } }
      : { width, height, style: { objectFit } }),
    ...(sizes && { sizes }),
    ...(placeholder === 'blur' && blurDataURL && { placeholder, blurDataURL }),
  };

  return (
    <div className={styles.container}>
      <Image {...imageProps} alt={alt} />
      {isLoading && (
        <div className={styles.skeleton} aria-hidden="true" />
      )}
    </div>
  );
}
