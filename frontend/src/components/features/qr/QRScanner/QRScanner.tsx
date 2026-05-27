"use client";

import { useState } from "react";
import { QrCode, Utensils } from "lucide-react";
import { useGetPublicRestaurantsQuery, useGetPublicRestaurantTablesQuery } from "@/lib/store/api/publicApi";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import styles from "./QRScanner.module.css";

interface QRScannerProps {
  onScan: (tableId: string, restaurantId: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const [showModal, setShowModal] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [selectedTableNumber, setSelectedTableNumber] = useState("");
  
  const { data: restaurants } = useGetPublicRestaurantsQuery({
    page: 0,
    size: 20,
  });

  const { data: tables } = useGetPublicRestaurantTablesQuery(selectedRestaurant, {
    skip: !selectedRestaurant,
  });

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    
    // Parse QR code format: resto:{restaurantId}:table:{tableId}
    const match = manualCode.match(/resto:([^:]+):table:([^:]+)/);
    if (match) {
      const [, restaurantId, tableId] = match;
      onScan(tableId, restaurantId);
      setShowModal(false);
      setManualCode("");
    } else {
      alert("Невірний формат QR-коду");
    }
  };

  const handleQuickSelect = () => {
    if (!selectedRestaurant || !selectedTableNumber) {
      alert("Оберіть ресторан та столик");
      return;
    }

    // Find table by table number
    const table = tables?.find(t => t.tableNumber === selectedTableNumber);
    if (!table) {
      alert(`Столик з номером "${selectedTableNumber}" не знайдено`);
      return;
    }

    onScan(table.id, selectedRestaurant);
    setShowModal(false);
    setSelectedRestaurant("");
    setSelectedTableNumber("");
  };

  return (
    <>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        <QrCode size={20} />
        Сканувати QR-код столика
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Вибір столика"
        size="md"
      >
        <div className={styles.modalContent}>
          {/* Quick Select Section */}
          <div className={styles.quickSelect}>
            <div className={styles.sectionHeader}>
              <Utensils size={20} />
              <h3>Швидкий вибір (для тестування)</h3>
            </div>
            
            <div className={styles.selectGroup}>
              <label htmlFor="restaurant" className={styles.label}>
                Оберіть ресторан
              </label>
              <select
                id="restaurant"
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className={styles.select}
              >
                <option value="">-- Оберіть ресторан --</option>
                {restaurants?.content.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.selectGroup}>
              <label htmlFor="table" className={styles.label}>
                Номер столика
              </label>
              <select
                id="table"
                value={selectedTableNumber}
                onChange={(e) => setSelectedTableNumber(e.target.value)}
                className={styles.select}
                disabled={!selectedRestaurant || !tables || tables.length === 0}
              >
                <option value="">-- Оберіть столик --</option>
                {tables?.map((table) => (
                  <option key={table.id} value={table.tableNumber}>
                    Столик #{table.tableNumber} ({table.capacity} місць)
                  </option>
                ))}
              </select>
              {selectedRestaurant && tables && tables.length === 0 && (
                <p className={styles.hint}>У цьому ресторані немає доступних столиків</p>
              )}
            </div>

            <Button 
              variant="primary" 
              fullWidth 
              onClick={handleQuickSelect}
              isDisabled={!selectedRestaurant || !selectedTableNumber}
            >
              Обрати столик
            </Button>
          </div>

          <div className={styles.divider}>
            <span>або</span>
          </div>

          {/* QR Scanner Placeholder */}
          <div className={styles.scannerPlaceholder}>
            <QrCode size={64} />
            <p className={styles.placeholderText}>
              Камера для сканування QR-коду буде доступна в наступній версії
            </p>
          </div>

          <div className={styles.divider}>
            <span>або</span>
          </div>

          {/* Manual Input Section */}
          <div className={styles.manualInput}>
            <label htmlFor="qrCode" className={styles.label}>
              Введіть код вручну
            </label>
            <input
              id="qrCode"
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="resto:xxx:table:yyy"
              className={styles.input}
            />
            <p className={styles.hint}>
              Формат: resto:restaurantId:table:tableId
            </p>
          </div>

          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Скасувати
            </Button>
            <Button 
              variant="primary" 
              onClick={handleManualSubmit}
              isDisabled={!manualCode.trim()}
            >
              Підтвердити код
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
