"use client";

import { useState, useMemo } from "react";
import {
  useGetStaffQuery,
  useAssignStaffMutation,
  useRemoveStaffMutation,
  useGetUsersByRoleQuery,
} from "@/lib/store/api/userApi";
import { useStaffRestaurant } from "@/lib/hooks/useStaffRestaurant";
import { useToast } from "@/lib/hooks/useToast";
import { formatUserRole } from "@/lib/utils/formatters";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import RestaurantSelector from "@/components/features/dashboard/RestaurantSelector/RestaurantSelector";
import styles from "./ManagerStaff.module.css";

const POSITIONS = ["WAITER", "CHEF", "MANAGER"] as const;

export default function ManagerStaff() {
  const { restaurantId, isLoading: isLoadingRestaurant, restaurants, selectRestaurant } =
    useStaffRestaurant();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [position, setPosition] = useState<string>("WAITER");

  const { data: staff, isLoading, isError, refetch } = useGetStaffQuery(restaurantId!, {
    skip: !restaurantId,
  });

  // Load all users (any role) for assignment dropdown
  const { data: allUsers, isLoading: isLoadingUsers } = useGetUsersByRoleQuery("CLIENT", {
    skip: !restaurantId,
  });

  const [assignStaff, { isLoading: isAssigning }] = useAssignStaffMutation();
  const [removeStaff] = useRemoveStaffMutation();

  const assignedUserIds = useMemo(() => {
    return new Set(staff?.map((s) => s.userId) || []);
  }, [staff]);

  const unassignedUsers = useMemo(() => {
    return allUsers?.filter((user) => !assignedUserIds.has(user.id)) || [];
  }, [allUsers, assignedUserIds]);

  const handleAssign = async () => {
    if (!restaurantId || !selectedUserId) return;
    try {
      await assignStaff({ restaurantId, userId: selectedUserId, position }).unwrap();
      toast.success("Співробітника додано", "Новий співробітник успішно призначений");
      setModalOpen(false);
      setSelectedUserId("");
      setPosition("WAITER");
    } catch {
      toast.error("Помилка", "Не вдалося додати співробітника");
    }
  };

  const handleRemove = async (id: string) => {
    if (!restaurantId) return;
    try {
      await removeStaff({ restaurantId, id }).unwrap();
      toast.success("Співробітника видалено", "Співробітник успішно видалений");
    } catch {
      toast.error("Помилка", "Не вдалося видалити співробітника");
    }
  };

  if (isLoadingRestaurant) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!restaurantId && restaurants && restaurants.length > 0) {
    return (
      <div className={styles.container}>
        <div className={styles.restaurantPrompt}>
          <p className={styles.promptTitle}>Оберіть ресторан для управління</p>
          <div className={styles.restaurantList}>
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className={styles.restaurantCard}
                onClick={() => selectRestaurant(restaurant.id)}
              >
                <h3>{restaurant.name}</h3>
                <p>{restaurant.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className={styles.container}>
        <EmptyState title="Ресторан не знайдено" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Персонал</h1>
        <div className={styles.headerActions}>
          <RestaurantSelector />
          <Button onClick={() => setModalOpen(true)}>Додати співробітника</Button>
        </div>
      </div>

      {isLoading && <div className={styles.skeleton} />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && (!staff || staff.length === 0) && (
        <EmptyState title="Персоналу не знайдено" />
      )}

      {!isLoading && !isError && staff && staff.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Користувач</th>
                <th>Посада</th>
                <th>Активний</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div>
                      <div className={styles.userName}>
                        {s.userFirstName} {s.userLastName}
                      </div>
                      <div className={styles.userEmail}>{s.userEmail}</div>
                    </div>
                  </td>
                  <td>{formatUserRole(s.position)}</td>
                  <td>
                    <span className={s.isActive ? styles.activeYes : styles.activeNo}>
                      {s.isActive ? "Так" : "Ні"}
                    </span>
                  </td>
                  <td>
                    <button className={styles.removeBtn} onClick={() => handleRemove(s.id)}>
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Додати співробітника"
        size="sm"
      >
        <div className={styles.modalContent}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Користувач</label>
            <select
              className={styles.nativeSelect}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Оберіть користувача</option>
              {unassignedUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {isLoadingUsers && <div className={styles.loadingText}>Завантаження...</div>}
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Посада</label>
            <select
              className={styles.nativeSelect}
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            >
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {formatUserRole(p)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Скасувати
            </Button>
            <Button isLoading={isAssigning} isDisabled={!selectedUserId} onClick={handleAssign}>
              Додати
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
