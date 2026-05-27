"use client";

import { useState } from "react";
import { useStaffRestaurant } from "@/lib/hooks/useStaffRestaurant";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import styles from "./RestaurantSelector.module.css";

interface RestaurantSelectorProps {
  showInHeader?: boolean;
}

export default function RestaurantSelector({ showInHeader = true }: RestaurantSelectorProps) {
  const { restaurant, restaurants, canSelectRestaurant, selectRestaurant } = useStaffRestaurant();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!canSelectRestaurant || restaurants.length <= 1) {
    return null;
  }

  const handleSelectRestaurant = (restaurantId: string) => {
    selectRestaurant(restaurantId);
    setIsModalOpen(false);
  };

  if (!showInHeader) {
    return null;
  }

  return (
    <>
      <Button variant="secondary" size="sm" onPress={() => setIsModalOpen(true)}>
        Змінити ресторан
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Оберіть ресторан"
        size="md"
      >
        <div className={styles.modalContent}>
          <p className={styles.currentRestaurant}>
            Поточний: <strong>{restaurant?.name}</strong>
          </p>
          <div className={styles.restaurantList}>
            {restaurants.map((r) => (
              <button
                key={r.id}
                className={`${styles.restaurantCard} ${r.id === restaurant?.id ? styles.active : ""}`}
                onClick={() => handleSelectRestaurant(r.id)}
              >
                <h3 className={styles.restaurantName}>{r.name}</h3>
                <p className={styles.restaurantAddress}>{r.address}</p>
                {r.id === restaurant?.id && (
                  <span className={styles.activeBadge}>Обрано</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
