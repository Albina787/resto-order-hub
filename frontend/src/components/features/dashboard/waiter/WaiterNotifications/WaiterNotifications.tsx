"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useStaffRestaurant } from "@/lib/hooks/useStaffRestaurant";
import styles from "./WaiterNotifications.module.css";

interface Notification {
  id: string;
  tableNumber: string;
  message: string;
  timestamp: Date;
  type: "call" | "order";
}

export default function WaiterNotifications() {
  const { restaurantId } = useStaffRestaurant();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Simulate receiving notifications (in real app, this would be WebSocket or polling)
  useEffect(() => {
    if (!restaurantId) return;

    // Simulate random notifications for demo
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 30 seconds
        const tableNumber = Math.floor(Math.random() * 20 + 1).toString();
        const newNotification: Notification = {
          id: Date.now().toString(),
          tableNumber,
          message: `Столик #${tableNumber} викликає офіціанта`,
          timestamp: new Date(),
          type: "call",
        };
        setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
        setIsOpen(true);

        // Play notification sound (optional)
        if (typeof Audio !== "undefined") {
          const audio = new Audio("/notification.mp3");
          audio.play().catch(() => {
            // Ignore if audio fails
          });
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [restaurantId]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.length;

  if (!restaurantId) return null;

  return (
    <div className={styles.container}>
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Нотифікації"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3 className={styles.title}>Виклики</h3>
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Закрити"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>
                <Bell size={32} />
                <p>Немає нових викликів</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className={styles.notification}>
                  <div className={styles.notificationContent}>
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                    <p className={styles.notificationTime}>
                      {notification.timestamp.toLocaleTimeString("uk-UA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    className={styles.dismissBtn}
                    onClick={() => dismissNotification(notification.id)}
                    aria-label="Відхилити"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
