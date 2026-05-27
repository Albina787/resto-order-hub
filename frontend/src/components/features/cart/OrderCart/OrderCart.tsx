"use client";

import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { updateItemQuantity, removeItem, clearCart } from "@/lib/store/slices/cartSlice";
import { useCreateOrderMutation } from "@/lib/store/api/orderApi";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import Button from "@/components/ui/Button/Button";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import styles from "./OrderCart.module.css";

export default function OrderCart() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { items, restaurantId, tableId } = useAppSelector((state) => state.cart);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (menuItemId: string, delta: number) => {
    const item = items.find((i) => i.menuItemId === menuItemId);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      dispatch(removeItem(menuItemId));
    } else {
      dispatch(updateItemQuantity({ menuItemId, quantity: newQuantity }));
    }
  };

  const handleCreateOrder = async () => {
    if (!user?.id || !restaurantId || !tableId) {
      showToast({ type: "error", title: "Помилка", message: "Відсутні дані користувача або столика" });
      return;
    }

    try {
      await createOrder({
        restaurantId,
        orderType: "DINE_IN",
        tableId,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
      }).unwrap();
      
      showToast({ type: "success", title: "Успіх", message: "Замовлення успішно створено!" });
      dispatch(clearCart());
    } catch {
      showToast({ type: "error", title: "Помилка", message: "Не вдалося створити замовлення" });
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <EmptyState
          icon={<ShoppingCart size={48} />}
          title="Кошик порожній"
          description="Додайте страви з меню"
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <ShoppingCart size={24} />
          Ваше замовлення
        </h2>
        <button onClick={() => dispatch(clearCart())} className={styles.clearButton}>
          Очистити
        </button>
      </div>

      <div className={styles.items}>
        {items.map((item) => (
          <div key={item.menuItemId} className={styles.item}>
            <div className={styles.itemInfo}>
              <h3 className={styles.itemName}>{item.menuItemName}</h3>
              <p className={styles.itemPrice}>{item.price} грн</p>
            </div>

            <div className={styles.itemActions}>
              <div className={styles.quantityControl}>
                <button
                  onClick={() => handleQuantityChange(item.menuItemId, -1)}
                  className={styles.quantityButton}
                  aria-label="Зменшити кількість"
                >
                  <Minus size={16} />
                </button>
                <span className={styles.quantity}>{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.menuItemId, 1)}
                  className={styles.quantityButton}
                  aria-label="Збільшити кількість"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={() => dispatch(removeItem(item.menuItemId))}
                className={styles.removeButton}
                aria-label="Видалити"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className={styles.itemSubtotal}>
              {(item.price * item.quantity).toFixed(2)} грн
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.total}>
          <span className={styles.totalLabel}>Разом:</span>
          <span className={styles.totalAmount}>{total.toFixed(2)} грн</span>
        </div>

        <Button
          variant="primary"
          onClick={handleCreateOrder}
          isLoading={isLoading}
          className={styles.orderButton}
        >
          Оформити замовлення
        </Button>
      </div>
    </div>
  );
}
