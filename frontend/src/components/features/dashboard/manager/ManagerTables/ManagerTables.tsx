"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/lib/hooks/useToast";
import {
  useGetTablesQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
} from "@/lib/store/api/restaurantApi";
import { useStaffRestaurant } from "@/lib/hooks/useStaffRestaurant";
import { TABLE_LOCATIONS } from "@/lib/utils/constants";
import type { RestaurantTable } from "@/types/restaurant";
import RestaurantSelector from "@/components/features/dashboard/RestaurantSelector/RestaurantSelector";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import styles from "./ManagerTables.module.css";

const tableSchema = z.object({
  tableNumber: z.string().min(1, "Обов'язкове поле"),
  capacity: z.number().int().min(1).max(50),
  minCapacity: z.number().int().min(1),
  maxCapacity: z.number().int().min(1),
  location: z.enum(["INDOOR", "OUTDOOR", "TERRACE", "VIP"]).optional(),
});

type TableFormData = z.infer<typeof tableSchema>;

export default function ManagerTables() {
  const { restaurantId, isLoading: isLoadingRestaurant, restaurants, selectRestaurant } = useStaffRestaurant();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);

  const { data: tables, isLoading, isError, refetch } = useGetTablesQuery(restaurantId!, {
    skip: !restaurantId,
  });
  const [createTable, { isLoading: isCreating }] = useCreateTableMutation();
  const [updateTable, { isLoading: isUpdating }] = useUpdateTableMutation();
  const [deleteTable] = useDeleteTableMutation();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: { tableNumber: "", capacity: 4, minCapacity: 1, maxCapacity: 6 },
  });

  const openCreate = () => {
    setEditingTable(null);
    reset({ tableNumber: "", capacity: 4, minCapacity: 1, maxCapacity: 6 });
    setModalOpen(true);
  };

  const openEdit = (table: RestaurantTable) => {
    setEditingTable(table);
    reset({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      minCapacity: table.minCapacity,
      maxCapacity: table.maxCapacity,
      location: table.location,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: TableFormData) => {
    if (!restaurantId) return;
    try {
      if (editingTable) {
        await updateTable({ restaurantId, id: editingTable.id, data }).unwrap();
        toast.success("Столик оновлено", "Зміни успішно збережено");
      } else {
        await createTable({ restaurantId, data }).unwrap();
        toast.success("Столик додано", "Новий столик успішно створено");
      }
      setModalOpen(false);
      reset();
    } catch (error) {
      toast.error("Помилка", "Не вдалося зберегти столик");
    }
  };

  if (isLoadingRestaurant) {
    return <div className={styles.container}><div className={styles.skeleton} /></div>;
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
        <h1 className={styles.title}>Столики</h1>
        <div className={styles.headerActions}>
          <RestaurantSelector />
          <Button onClick={openCreate}>Додати столик</Button>
        </div>
      </div>

      {isLoading && <div className={styles.skeleton} />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && (!tables || tables.length === 0) && (
        <EmptyState title="Столиків не знайдено" />
      )}

      {!isLoading && !isError && tables && tables.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Місткість</th>
                <th>Мін/Макс</th>
                <th>Розташування</th>
                <th>Статус</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t.id}>
                  <td>#{t.tableNumber}</td>
                  <td>{t.capacity}</td>
                  <td>{t.minCapacity}–{t.maxCapacity}</td>
                  <td>{t.location ?? "—"}</td>
                  <td>
                    <span className={`${styles.availableBadge} ${t.isAvailable ? styles.available : styles.unavailable}`}>
                      {t.isAvailable ? "Вільний" : "Зайнятий"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(t)}>Редагувати</button>
                      <button
                        className={styles.deleteBtn}
                        onClick={async () => {
                          try {
                            await deleteTable({ restaurantId: restaurantId!, id: t.id }).unwrap();
                            toast.success("Столик видалено", "Столик успішно видалено");
                          } catch (error) {
                            toast.error("Помилка", "Не вдалося видалити столик");
                          }
                        }}
                      >
                        Видалити
                      </button>
                    </div>
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
        title={editingTable ? "Редагувати столик" : "Додати столик"}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.modalContent}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>Номер столика</label>
                <Controller
                  name="tableNumber"
                  control={control}
                  render={({ field }) => (
                    <input type="text" className={styles.nativeInput} {...field} />
                  )}
                />
                {errors.tableNumber && <span className={styles.fieldError}>{errors.tableNumber.message}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Місткість</label>
                <Controller
                  name="capacity"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      className={styles.nativeInput}
                      min={1}
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  )}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Розташування</label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <select className={styles.nativeSelect} value={field.value ?? ""} onChange={field.onChange}>
                      <option value="">Не вказано</option>
                      {TABLE_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Мін. гостей</label>
                <Controller
                  name="minCapacity"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      className={styles.nativeInput}
                      min={1}
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  )}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Макс. гостей</label>
                <Controller
                  name="maxCapacity"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      className={styles.nativeInput}
                      min={1}
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  )}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Скасувати
              </Button>
              <Button type="submit" isLoading={isCreating || isUpdating}>
                {editingTable ? "Зберегти" : "Додати"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
