"use client";

import { useState, useMemo } from "react";
import { useAssignStaffMutation, useGetUsersByRoleQuery } from "@/lib/store/api/userApi";
import { useToast } from "@/lib/hooks/useToast";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import styles from "./AssignManagerModal.module.css";

interface AssignManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
}

export default function AssignManagerModal({
  isOpen,
  onClose,
  restaurantId,
  restaurantName,
}: AssignManagerModalProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();
  const [assignStaff, { isLoading }] = useAssignStaffMutation();
  
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersByRoleQuery("CLIENT");

  const filteredUsers = useMemo(() => {
    if (!usersData) return [];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return usersData.filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }
    
    return usersData;
  }, [usersData, searchQuery]);

  const handleAssign = async () => {
    if (!selectedUserId) {
      showToast({ type: "error", title: "Помилка", message: "Оберіть користувача" });
      return;
    }

    try {
      await assignStaff({
        restaurantId,
        userId: selectedUserId,
        position: "MANAGER",
      }).unwrap();
      
      showToast({ type: "success", title: "Успіх", message: "Менеджера успішно призначено" });
      setSelectedUserId("");
      setSearchQuery("");
      onClose();
    } catch {
      showToast({ type: "error", title: "Помилка", message: "Не вдалося призначити менеджера" });
    }
  };

  const handleClose = () => {
    setSelectedUserId("");
    setSearchQuery("");
    onClose();
  };

  const selectedUser = usersData?.find((u) => u.id === selectedUserId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Призначити менеджера: ${restaurantName}`}
      size="sm"
    >
      <div className={styles.content}>
        <p className={styles.description}>
          Оберіть користувача, якого потрібно призначити менеджером цього ресторану.
        </p>

        <div className={styles.formGroup}>
          <label htmlFor="userSearch" className={styles.label}>
            Пошук користувача
          </label>
          <input
            id="userSearch"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введіть ім'я або email..."
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="userId" className={styles.label}>
            Користувач
          </label>
          {isLoadingUsers ? (
            <p className={styles.hint}>Завантаження користувачів...</p>
          ) : (
            <select
              id="userId"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className={styles.select}
            >
              <option value="">-- Оберіть користувача --</option>
              {filteredUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          )}
          {selectedUser && (
            <p className={styles.hint}>
              {selectedUser.firstName} {selectedUser.lastName} отримає роль MANAGER для цього ресторану
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleClose}>
            Скасувати
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            isLoading={isLoading}
            isDisabled={!selectedUserId || isLoadingUsers}
          >
            Призначити
          </Button>
        </div>
      </div>
    </Modal>
  );
}
