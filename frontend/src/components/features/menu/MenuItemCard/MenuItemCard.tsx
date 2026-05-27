"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import type { MenuItem } from "@/types/menu";
import { formatCurrency } from "@/lib/utils/formatters";
import { getFirstImage, resolveImageUrl, PLACEHOLDER_IMAGE } from "@/lib/utils/imageUrl";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addItem } from "@/lib/store/slices/cartSlice";
import { useToast } from "@/lib/hooks/useToast";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import styles from "./MenuItemCard.module.css";

interface MenuItemCardProps {
  item: MenuItem;
}

const SPICY_LABELS: Record<string, string> = {
  NONE: "",
  MILD: "🌶 Слабко гостре",
  MEDIUM: "🌶🌶 Середньо гостре",
  HOT: "🌶🌶🌶 Гостре",
  EXTRA_HOT: "🌶🌶🌶🌶 Дуже гостре",
};

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { tableId } = useAppSelector((state) => state.cart);
  const [quantity, setQuantity] = useState(1);
  
  const spicyLabel = SPICY_LABELS[item.spicyLevel];
  const coverImage = getFirstImage(item.images) || resolveImageUrl(PLACEHOLDER_IMAGE);

  const handleAddToCart = () => {
    if (!tableId) {
      showToast({ type: "error", title: "Помилка", message: "Спочатку відскануйте QR-код столика" });
      return;
    }

    dispatch(
      addItem({
        menuItemId: item.id,
        menuItemName: item.name,
        price: item.price,
        quantity,
      })
    );
    showToast({ type: "success", title: "Успіх", message: `${item.name} додано до кошика` });
    setQuantity(1);
  };

  return (
    <article
      className={`${styles.card} ${!item.isAvailable ? styles.unavailable : ""}`}
      aria-label={item.name}
    >
      <div className={styles.imageWrapper}>
        <Image
          src={coverImage}
          alt={item.name}
          fill
          className={styles.image}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          <h4 className={styles.name}>{item.name}</h4>
          <span className={styles.price}>{formatCurrency(item.price)}</span>
        </div>

        {item.description && (
          <p className={styles.description}>{item.description}</p>
        )}

        <div className={styles.meta}>
          <div className={styles.badges}>
            {item.isVegetarian && (
              <Badge variant="success">🥦 Вегетаріанське</Badge>
            )}
            {item.isVegan && (
              <Badge variant="success">🌱 Веганське</Badge>
            )}
            {item.isGlutenFree && (
              <Badge variant="info">🌾 Без глютену</Badge>
            )}
            {item.isPopular && (
              <Badge variant="warning">⭐ Популярне</Badge>
            )}
            {spicyLabel && (
              <Badge variant="error">{spicyLabel}</Badge>
            )}
            {!item.isAvailable && (
              <Badge variant="default">Недоступно</Badge>
            )}
          </div>

          {item.preparationTime && (
            <span className={styles.prepTime}>
              ⏱ {item.preparationTime} хв
            </span>
          )}
        </div>

        {item.isAvailable && tableId && (
          <div className={styles.actions}>
            <div className={styles.quantityControl}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className={styles.quantityButton}
                aria-label="Зменшити кількість"
              >
                -
              </button>
              <span className={styles.quantity}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className={styles.quantityButton}
                aria-label="Збільшити кількість"
              >
                +
              </button>
            </div>
            <Button variant="primary" onClick={handleAddToCart} className={styles.addButton}>
              <Plus size={16} />
              Додати
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
