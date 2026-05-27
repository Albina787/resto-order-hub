import React from 'react';
import styles from './VisuallyHidden.module.css';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Компонент для приховування контенту візуально, але залишаючи його доступним для скрін-рідерів
 */
export default function VisuallyHidden({
  children,
  as: Component = 'span',
}: VisuallyHiddenProps) {
  return <Component className={styles.visuallyHidden}>{children}</Component>;
}
