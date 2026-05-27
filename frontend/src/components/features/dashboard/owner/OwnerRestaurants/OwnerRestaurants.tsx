"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users } from "lucide-react";
import {
  useGetRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
} from "@/lib/store/api/restaurantApi";
import { useToast } from "@/lib/hooks/useToast";
import type { Restaurant } from "@/types/restaurant";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import ImageUpload from "@/components/ui/ImageUpload/ImageUpload";
import AssignManagerModal from "@/components/features/dashboard/owner/AssignManagerModal/AssignManagerModal";
import styles from "./OwnerRestaurants.module.css";

const restaurantSchema = z.object({
  name: z.string().min(1, "Обов'язкове поле"),
  address: z.string().min(1, "Обов'язкове поле"),
  city: z.string().min(1, "Обов'язкове поле"),
  phone: z.string().min(1, "Обов'язкове поле"),
  email: z.string().email("Введіть коректний email"),
  description: z.string().optional(),
  cuisineType: z.string().optional(),
  capacity: z.number().int().min(1),
  images: z.array(z.string()).optional(),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

function isPaginatedResponse(data: unknown): data is { content: Restaurant[] } {
  return typeof data === "object" && data !== null && "content" in data;
}

export default function OwnerRestaurants() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [assignManagerModal, setAssignManagerModal] = useState<{ isOpen: boolean; restaurant: Restaurant | null }>({
    isOpen: false,
    restaurant: null,
  });
  const { showToast } = useToast();

  const { data: restaurantsData, isLoading, isError, refetch } = useGetRestaurantsQuery({});
  const [createRestaurant, { isLoading: isCreating }] = useCreateRestaurantMutation();
  const [updateRestaurant, { isLoading: isUpdating }] = useUpdateRestaurantMutation();
  const [deleteRestaurant] = useDeleteRestaurantMutation();

  const restaurants: Restaurant[] = isPaginatedResponse(restaurantsData)
    ? restaurantsData.content
    : Array.isArray(restaurantsData)
    ? restaurantsData
    : [];

  const { control, handleSubmit, reset, formState: { errors } } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: { name: "", address: "", city: "", phone: "", email: "", description: "", cuisineType: "", capacity: 50, images: [] },
  });

  const openCreate = () => {
    setEditingRestaurant(null);
    reset({ name: "", address: "", city: "", phone: "", email: "", description: "", cuisineType: "", capacity: 50 });
    setModalOpen(true);
  };

  const openEdit = (r: Restaurant) => {
    setEditingRestaurant(r);
    reset({
      name: r.name, address: r.address, city: r.city, phone: r.phone, email: r.email,
      description: r.description ?? "", cuisineType: r.cuisineType ?? "", capacity: r.capacity,
      images: r.images ? (Array.isArray(r.images) ? r.images : JSON.parse(r.images as string)) : [],
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: RestaurantFormData) => {
    try {
      if (editingRestaurant) {
        await updateRestaurant({ id: editingRestaurant.id, data }).unwrap();
        showToast({ type: "success", title: "Успіх", message: "Ресторан оновлено" });
      } else {
        await createRestaurant(data).unwrap();
        showToast({ type: "success", title: "Успіх", message: "Ресторан створено" });
      }
      setModalOpen(false);
      reset();
    } catch {
      showToast({ type: "error", title: "Помилка", message: "Не вдалося зберегти ресторан" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей ресторан?")) return;
    try {
      await deleteRestaurant(id).unwrap();
      showToast({ type: "success", title: "Успіх", message: "Ресторан видалено" });
    } catch {
      showToast({ type: "error", title: "Помилка", message: "Не вдалося видалити ресторан" });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ресторани</h1>
        <Button onClick={openCreate}>Додати ресторан</Button>
      </div>

      {isLoading && <div className={styles.skeleton} />}
      {isError && <ErrorMessage onRetry={refetch} />}

      {!isLoading && !isError && restaurants.length === 0 && (
        <EmptyState title="Ресторанів не знайдено" />
      )}

      {!isLoading && !isError && restaurants.length > 0 && (
        <div className={styles.grid}>
          {restaurants.map((r) => (
            <div key={r.id} className={styles.restaurantCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.restaurantName}>{r.name}</h3>
                <span className={`${styles.statusBadge} ${r.isActive ? styles.active : styles.inactive}`}>
                  {r.isActive ? "Активний" : "Неактивний"}
                </span>
              </div>
              <p className={styles.restaurantAddress}>{r.address}, {r.city}</p>
              <p className={styles.restaurantContact}>{r.phone} · {r.email}</p>
              {r.cuisineType && <p className={styles.restaurantMeta}>{r.cuisineType}</p>}
              <div className={styles.cardActions}>
                <button
                  className={styles.managerBtn}
                  onClick={() => setAssignManagerModal({ isOpen: true, restaurant: r })}
                  title="Призначити менеджера"
                >
                  <Users size={16} />
                  Менеджер
                </button>
                <button className={styles.editBtn} onClick={() => openEdit(r)}>Редагувати</button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(r.id)}>Видалити</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRestaurant ? "Редагувати ресторан" : "Додати ресторан"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.modalContent}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>Назва</label>
                <Controller name="name" control={control} render={({ field }) => (
                  <input type="text" className={styles.nativeInput} {...field} />
                )} />
                {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Адреса</label>
                <Controller name="address" control={control} render={({ field }) => (
                  <input type="text" className={styles.nativeInput} {...field} />
                )} />
                {errors.address && <span className={styles.fieldError}>{errors.address.message}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Місто</label>
                <Controller name="city" control={control} render={({ field }) => (
                  <input type="text" className={styles.nativeInput} {...field} />
                )} />
                {errors.city && <span className={styles.fieldError}>{errors.city.message}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Телефон</label>
                <Controller name="phone" control={control} render={({ field }) => (
                  <input type="tel" className={styles.nativeInput} {...field} />
                )} />
                {errors.phone && <span className={styles.fieldError}>{errors.phone.message}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email</label>
                <Controller name="email" control={control} render={({ field }) => (
                  <input type="email" className={styles.nativeInput} {...field} />
                )} />
                {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Тип кухні</label>
                <Controller name="cuisineType" control={control} render={({ field }) => (
                  <input type="text" className={styles.nativeInput} {...field} />
                )} />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Місткість</label>
                <Controller name="capacity" control={control} render={({ field }) => (
                  <input type="number" className={styles.nativeInput} min={1} value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value, 10))} />
                )} />
              </div>

              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>Опис</label>
                <Controller name="description" control={control} render={({ field }) => (
                  <textarea className={styles.nativeTextarea} rows={3} {...field} />
                )} />
              </div>

              <div className={styles.fieldGroupFull}>
                <Controller
                  name="images"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      label="Фотографії ресторану"
                      value={field.value ?? []}
                      onChange={field.onChange}
                      directory="restaurants"
                      maxFiles={6}
                    />
                  )}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Скасувати</Button>
              <Button type="submit" isLoading={isCreating || isUpdating}>
                {editingRestaurant ? "Зберегти" : "Додати"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {assignManagerModal.restaurant && (
        <AssignManagerModal
          isOpen={assignManagerModal.isOpen}
          onClose={() => setAssignManagerModal({ isOpen: false, restaurant: null })}
          restaurantId={assignManagerModal.restaurant.id}
          restaurantName={assignManagerModal.restaurant.name}
        />
      )}
    </div>
  );
}
