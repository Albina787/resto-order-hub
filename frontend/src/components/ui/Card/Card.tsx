import styles from "./Card.module.css";

type CardPadding = "sm" | "md" | "lg" | "none";

interface CardProps {
  children: React.ReactNode;
  padding?: CardPadding;
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={`${styles.header} ${className ?? ""}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={`${styles.footer} ${className ?? ""}`}>{children}</div>;
}

export default function Card({
  children,
  padding = "md",
  hoverable = false,
  className,
  onClick,
}: CardProps) {
  const paddingClass = padding === "none" ? styles.noPadding : styles[padding];

  return (
    <div
      className={[
        styles.card,
        paddingClass,
        hoverable ? styles.hoverable : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {children}
    </div>
  );
}
