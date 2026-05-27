"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Minus, ShoppingCart, X } from "lucide-react";
import { useGetMenuItemsQuery } from "@/lib/store/api/menuApi";
import { useGetTableQuery } from "@/lib/store/api/restaurantApi";
import { useCreateOrderMutation } from "@/lib/store/api/orderApi";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { formatCurrency } from "@/lib/utils/formatters";
import Button from "@/components/ui/Button/Button";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";
import styles from "./CreateOrder.module.css";

interface CartItem {
  menuItemId: string;
  menuItemName: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export default function CreateOrder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const tableId = searchParams.get("tableId");
  const restaurantId = searchParams.get("restaurantId");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data: table, isLoading: tableLoading } = useGetTableQuery(
    { restaurantId: restaurantId!, id: tableId! },
    { skip: !restaurantId || !tableId }
  );

  const { data: menuItems, isLoading: itemsLoading, isError, refetch } = useGetMenuItemsQuery(
    restaurantId!,
    { skip: !restaurantId }
  );

  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  const categories = Array.from(
    new Set(menuItems?.map((item) => item.categoryId).filter(Boolean))
  );

  const filteredItems = (menuItems || []).filter((item) => {
    if (!item.isAvailable) return false;
    if (selectedCategory && item.categoryId !== selectedCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addToCart = (item: NonNullable<typeof menuItems>[0]) => {
    const existing = cart.find((c) => c.menuItemId === item.id);
    if (existing) {
      setCart(cart.map((c) =>
        c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, {
        menuItemId: item.id,
        menuItemName: item.name,
        price: item.price,
        quantity: 1,
      }]);
    }
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(cart.map((item) => {
      if (item.menuItemId === menuItemId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter((item) => item.menuItemId !== menuItemId));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCreateOrder = async () => {
    if (!user?.id || !restaurantId || !tableId || cart.length === 0) {
      showToast({ type: "error", title: "Помилка", message: "Додайте страви до замовлення" });
      return;
    }

    try {
      await createOrder({
        restaurantId,
        orderType: "DINE_IN",
        tableId,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
      }).unwrap();

      showToast({ type: "success", title: "Успіх", message: "Замовлення створено!" });
      router.push("/dashboard/waiter/orders");
    } catch {
      showToast({ type: "error", title: "Помилка", message: "Не вдалося створити замовлення" });
    }
  };

  if (!tableId || !restaurantId) {
    return (
      <div className={styles.container}>
        <EmptyState title="Невірні параметри" description="Оберіть столик для створення замовлення" />
      </div>
    );
  }

  if (tableLoading || itemsLoading) {
    return <PageSpinner />;
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <ErrorMessage onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Нове замовлення</h1>
          <p className={styles.subtitle}>
            Столик #{table?.tableNumber} • {table?.capacity} місць
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>
          Скасувати
        </Button>
      </div>

      <div className={styles.content}>
        {/* Menu Section */}
        <div className={styles.menuSection}>
          <div className={styles.menuHeader}>
            <input
              type="text"
              placeholder="Пошук страв..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.categories}>
            <button
              className={`${styles.categoryBtn} ${!selectedCategory ? styles.active : ""}`}
              onClick={() => setSelectedCategory("")}
            >
              Всі
            </button>
            {categories.map((catId) => {
              const item = menuItems?.find((i) => i.categoryId === catId);
              const catName = item?.categoryName || catId;
              return (
                <button
                  key={catId}
                  className={`${styles.categoryBtn} ${selectedCategory === catId ? styles.active : ""}`}
                  onClick={() => setSelectedCategory(catId!)}
                >
                  {catName}
                </button>
              );
            })}
          </div>

          <div className={styles.menuGrid}>
            {filteredItems.map((item) => (
              <div key={item.id} className={styles.menuItem}>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  {item.description && (
                    <p className={styles.itemDescription}>{item.description}</p>
                  )}
                  <p className={styles.itemPrice}>{formatCurrency(item.price)}</p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => addToCart(item)}
                  className={styles.addBtn}
                >
                  <Plus size={16} />
                </Button>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <EmptyState title="Страв не знайдено" description="Спробуйте змінити фільтри" />
          )}
        </div>

        {/* Cart Section */}
        <div className={styles.cartSection}>
          <div className={styles.cartHeader}>
            <h2 className={styles.cartTitle}>
              <ShoppingCart size={20} />
              Кошик
            </h2>
          </div>

          {cart.length === 0 ? (
            <EmptyState
              title="Кошик порожній"
              description="Додайте страви з меню"
            />
          ) : (
            <>
              <div className={styles.cartItems}>
                {cart.map((item) => (
                  <div key={item.menuItemId} className={styles.cartItem}>
                    <div className={styles.cartItemInfo}>
                      <p className={styles.cartItemName}>{item.menuItemName}</p>
                      <p className={styles.cartItemPrice}>{formatCurrency(item.price)}</p>
                    </div>

                    <div className={styles.cartItemActions}>
                      <div className={styles.quantityControl}>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, -1)}
                          className={styles.quantityBtn}
                        >
                          <Minus size={14} />
                        </button>
                        <span className={styles.quantity}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, 1)}
                          className={styles.quantityBtn}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.menuItemId)}
                        className={styles.removeBtn}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className={styles.cartItemTotal}>
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.cartFooter}>
                <div className={styles.total}>
                  <span className={styles.totalLabel}>Разом:</span>
                  <span className={styles.totalAmount}>{formatCurrency(total)}</span>
                </div>

                <Button
                  variant="primary"
                  onClick={handleCreateOrder}
                  isLoading={isCreating}
                  className={styles.createBtn}
                >
                  Створити замовлення
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
