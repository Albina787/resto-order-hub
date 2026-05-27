"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import styles from "./OrderTimer.module.css";

interface OrderTimerProps {
  createdAt: string;
  preparationTime?: number; // Expected preparation time in minutes
  status: string;
}

function getElapsedMinutes(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}хв`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}год ${mins}хв`;
}

export default function OrderTimer({
  createdAt,
  preparationTime = 30,
  status,
}: OrderTimerProps) {
  const [elapsed, setElapsed] = useState(getElapsedMinutes(createdAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(getElapsedMinutes(createdAt));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [createdAt]);

  // Don't show timer for completed orders
  if (["COMPLETED", "CANCELLED", "SERVED"].includes(status)) {
    return null;
  }

  const percentage = (elapsed / preparationTime) * 100;
  let urgency: "normal" | "warning" | "urgent" = "normal";

  if (percentage >= 100) {
    urgency = "urgent";
  } else if (percentage >= 75) {
    urgency = "warning";
  }

  return (
    <div className={`${styles.timer} ${styles[urgency]}`}>
      <Clock size={14} className={styles.icon} />
      <span className={styles.time}>{formatTime(elapsed)}</span>
      {preparationTime && (
        <span className={styles.expected}>/ {preparationTime}хв</span>
      )}
    </div>
  );
}
