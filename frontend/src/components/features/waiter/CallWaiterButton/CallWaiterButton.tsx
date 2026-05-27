"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import { useToast } from "@/lib/hooks/useToast";
import { useCallWaiterMutation } from "@/lib/store/api/orderApi";
import styles from "./CallWaiterButton.module.css";

interface CallWaiterButtonProps {
  tableId?: string;
  restaurantId?: string;
}

export default function CallWaiterButton({ tableId, restaurantId }: CallWaiterButtonProps) {
  const [cooldown, setCooldown] = useState(false);
  const { showToast } = useToast();
  const [callWaiter, { isLoading }] = useCallWaiterMutation();

  const handleCallWaiter = async () => {
    if (!tableId || !restaurantId) {
      showToast({ type: "error", title: "Помилка", message: "Спочатку оберіть столик" });
      return;
    }
    if (cooldown) {
      showToast({ type: "info", title: "Зачекайте", message: "Офіціанта вже викликано" });
      return;
    }

    try {
      await callWaiter({ restaurantId, tableId }).unwrap();
      showToast({ type: "success", title: "Успіх", message: "Офіціанта викликано! Він підійде найближчим часом" });
      setCooldown(true);
      // Reset cooldown after 5 minutes
      setTimeout(() => setCooldown(false), 5 * 60 * 1000);
    } catch {
      showToast({ type: "error", title: "Помилка", message: "Не вдалося викликати офіціанта" });
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleCallWaiter}
      isLoading={isLoading}
      isDisabled={cooldown}
      className={styles.button}
    >
      <Bell size={20} />
      {cooldown ? "Офіціанта викликано" : "Викликати офіціанта"}
    </Button>
  );
}
