"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setTable } from "@/lib/store/slices/cartSlice";
import { useGetPublicRestaurantQuery } from "@/lib/store/api/publicApi";
import { useGetTableQuery } from "@/lib/store/api/restaurantApi";
import QRScanner from "@/components/features/qr/QRScanner/QRScanner";
import OrderCart from "@/components/features/cart/OrderCart/OrderCart";
import CallWaiterButton from "@/components/features/waiter/CallWaiterButton/CallWaiterButton";
import OrderList from "@/components/features/orders/OrderList/OrderList";
import Button from "@/components/ui/Button/Button";
import styles from "./OrdersPage.module.css";

export default function OrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { restaurantId, tableId } = useAppSelector((state) => state.cart);
  const [showOrders, setShowOrders] = useState(false);
  
  const { data: restaurant } = useGetPublicRestaurantQuery(restaurantId || "", {
    skip: !restaurantId,
  });

  const { data: table } = useGetTableQuery(
    { restaurantId: restaurantId || "", id: tableId || "" },
    { skip: !restaurantId || !tableId }
  );

  const handleScan = (scannedTableId: string, scannedRestaurantId: string) => {
    dispatch(setTable({ restaurantId: scannedRestaurantId, tableId: scannedTableId }));
  };

  const handleViewMenu = () => {
    if (restaurantId) {
      router.push(`/restaurants/${restaurantId}/menu`);
    }
  };

  if (!restaurantId || !tableId) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h1 className={styles.title}>Замовлення в ресторані</h1>
          <p className={styles.description}>
            Відскануйте QR-код на вашому столику, щоб почати замовлення
          </p>
          <QRScanner onScan={handleScan} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>
            {restaurant?.name || "Ресторан"}
          </h1>
          <p className={styles.tableInfo}>Столик #{table?.tableNumber || tableId}</p>
        </div>
        <div className={styles.headerActions}>
          <CallWaiterButton tableId={tableId} restaurantId={restaurantId} />
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${!showOrders ? styles.active : ""}`}
          onClick={() => setShowOrders(false)}
        >
          Кошик
        </button>
        <button
          className={`${styles.tab} ${showOrders ? styles.active : ""}`}
          onClick={() => setShowOrders(true)}
        >
          Мої замовлення
        </button>
      </div>

      {!showOrders ? (
        <div className={styles.content}>
          <OrderCart />
          <div className={styles.actions}>
            <Button variant="secondary" onClick={handleViewMenu}>
              Переглянути меню
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <OrderList />
        </div>
      )}
    </div>
  );
}

