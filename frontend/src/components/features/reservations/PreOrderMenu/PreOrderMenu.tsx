"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, Trash2, CheckCircle2, Leaf, Wheat, Star } from "lucide-react";
import { useGetPublicRestaurantMenuQuery } from "@/lib/store/api/publicApi";
import type { MenuItem } from "@/types/menu";
import { formatCurrency } from "@/lib/utils/formatters";
import { getFirstImage, resolveImageUrl, PLACEHOLDER_IMAGE } from "@/lib/utils/imageUrl";
import Button from "@/components/ui/Button/Button";
import Badge from "@/components/ui/Badge/Badge";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import { UtensilsCrossed } from "lucide-react";
import styles from "./PreOrderMenu.module.css";

export interface PreOrderItem {
  menuItemId: string;
  menuItemName: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

interface PreOrderMenuProps {
  restaurantId: string;
  selectedItems: PreOrderItem[];
  onItemsChange: (items: PreOrderItem[]) => void;
}

export default function PreOrderMenu({ restaurantId, selectedItems, onItemsChange }: PreOrderMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: menuItems, isLoading } = useGetPublicRestaurantMenuQuery(restaurantId);

  const addItem = (item: MenuItem) => {
    const existing = selectedItems.find((i) => i.menuItemId === item.id);
    if (existing) {
      onItemsChange(
        selectedItems.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      onItemsChange([
        ...selectedItems,
        {
          menuItemId: item.id,
          menuItemName: item.name,
          price: item.price,
          quantity: 1,
        },
      ]);
    }
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    const item = selectedItems.find((i) => i.menuItemId === menuItemId);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      onItemsChange(selectedItems.filter((i) => i.menuItemId !== menuItemId));
    } else {
      onItemsChange(
        selectedItems.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: newQuantity } : i
        )
      );
    }
  };

  const removeItem = (menuItemId: string) => {
    onItemsChange(selectedItems.filter((i) => i.menuItemId !== menuItemId));
  };

  const filteredItems = (menuItems || []).filter((item) => {
    if (!item.isAvailable) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isLoading) {
    return <div className={styles.loading}>Завантаження меню...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Попереднє замовлення (опціонально)</h3>
        <p className={styles.subtitle}>Оберіть страви, які ви хочете замовити заздалегідь</p>
      </div>

      {/* Selected items cart */}
      {selectedItems.length > 0 && (
        <div className={styles.cart}>
          <h4 className={styles.cartTitle}>Обрані страви ({selectedItems.length})</h4>
          <div className={styles.cartItems}>
            {selectedItems.map((item) => (
              <div key={item.menuItemId} className={styles.cartItem}>
                <div className={styles.cartItemInfo}>
                  <span className={styles.cartItemName}>{item.menuItemName}</span>
                  <span className={styles.cartItemPrice}>{formatCurrency(item.price)}</span>
                </div>
                <div className={styles.cartItemActions}>
                  <div className={styles.quantityControl}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.menuItemId, -1)}
                      className={styles.quantityButton}
                      aria-label="Зменшити кількість"
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.menuItemId, 1)}
                      className={styles.quantityButton}
                      aria-label="Збільшити кількість"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.menuItemId)}
                    className={styles.removeButton}
                    aria-label="Видалити"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className={styles.cartItemSubtotal}>
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.cartTotal}>
            <span className={styles.cartTotalLabel}>Разом:</span>
            <span className={styles.cartTotalAmount}>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className={styles.searchWrapper}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Пошук страви..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Menu items */}
      <div className={styles.menuGrid}>
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed size={48} />}
            title="Страв не знайдено"
            description="Спробуйте змінити пошуковий запит"
          />
        ) : (
          filteredItems.map((item) => {
            const coverImage = getFirstImage(item.images) || resolveImageUrl(PLACEHOLDER_IMAGE);
            const selectedItem = selectedItems.find((i) => i.menuItemId === item.id);
            
            return (
              <div key={item.id} className={styles.menuItem}>
                <div className={styles.menuItemImage}>
                  <Image
                    src={coverImage}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 200px"
                    className={styles.image}
                  />
                </div>
                <div className={styles.menuItemBody}>
                  <div className={styles.menuItemHeader}>
                    <h5 className={styles.menuItemName}>{item.name}</h5>
                    <span className={styles.menuItemPrice}>{formatCurrency(item.price)}</span>
                  </div>
                  {item.description && (
                    <p className={styles.menuItemDescription}>{item.description}</p>
                  )}
                  <div className={styles.menuItemBadges}>
                    {item.isVegetarian && <Badge variant="success"><Leaf size={12} /> Вегетаріанське</Badge>}
                    {item.isVegan && <Badge variant="success"><Leaf size={12} /> Веганське</Badge>}
                    {item.isGlutenFree && <Badge variant="info"><Wheat size={12} /> Без глютену</Badge>}
                    {item.isPopular && <Badge variant="warning"><Star size={12} /> Популярне</Badge>}
                  </div>
                  {selectedItem ? (
                    <div className={styles.menuItemSelected}>
                      <span className={styles.selectedBadge}><CheckCircle2 size={14} /> Додано ({selectedItem.quantity})</span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onPress={() => addItem(item)}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onPress={() => addItem(item)}
                      className={styles.addButton}
                    >
                      <Plus size={14} />
                      Додати
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
