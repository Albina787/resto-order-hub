"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/lib/hooks/useToast";
import { useStaffRestaurant } from "@/lib/hooks/useStaffRestaurant";
import {
  useGetRestaurantQuery,
  useUpdateRestaurantMutation,
  useGetWorkingHoursQuery,
  useUpdateWorkingHoursForDayMutation,
} from "@/lib/store/api/restaurantApi";
import Button from "@/components/ui/Button/Button";
import ImageUpload from "@/components/ui/ImageUpload/ImageUpload";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";
import styles from "./ManagerSettings.module.css";

const restaurantSchema = z.object({
  name: z.string().min(1, "Обов'язкове поле"),
  description: z.string().optional(),
  address: z.string().min(1, "Обов'язкове поле"),
  city: z.string().min(1, "Обов'язкове поле"),
  phone: z.string().min(1, "Обов'язкове поле"),
  email: z.string().email("Невірний email").optional(),
  cuisineType: z.string().optional(),
  priceRange: z.enum(["BUDGET", "MODERATE", "EXPENSIVE", "LUXURY"]).optional(),
  images: z.array(z.string()).optional(),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

const DAYS_OF_WEEK = [
  { value: "MONDAY", label: "Понеділок" },
  { value: "TUESDAY", label: "Вівторок" },
  { value: "WEDNESDAY", label: "Середа" },
  { value: "THURSDAY", label: "Четвер" },
  { value: "FRIDAY", label: "П'ятниця" },
  { value: "SATURDAY", label: "Субота" },
  { value: "SUNDAY", label: "Неділя" },
];

interface WorkingHoursForm {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

export default function ManagerSettings() {
  const { restaurantId, isLoading: isLoadingRestaurant, restaurants, selectRestaurant } = useStaffRestaurant();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"info" | "hours">("info");

  const { data: restaurant, isLoading, isError, refetch } = useGetRestaurantQuery(restaurantId!, {
    skip: !restaurantId,
  });
  const { data: workingHours, isLoading: hoursLoading } = useGetWorkingHoursQuery(restaurantId!, {
    skip: !restaurantId,
  });

  const [updateRestaurant, { isLoading: isUpdating }] = useUpdateRestaurantMutation();
  const [updateWorkingHoursForDay, { isLoading: isUpdatingHours }] = useUpdateWorkingHoursForDayMutation();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
  });

  const [hoursForm, setHoursForm] = useState<WorkingHoursForm>({});

  useEffect(() => {
    if (restaurant) {
      reset({
        name: restaurant.name,
        description: restaurant.description ?? "",
        address: restaurant.address,
        city: restaurant.city ?? "",
        phone: restaurant.phone,
        email: restaurant.email ?? "",
        cuisineType: restaurant.cuisineType ?? "",
        priceRange: restaurant.priceRange ?? undefined,
        images: restaurant.images ? (Array.isArray(restaurant.images) ? restaurant.images : JSON.parse(restaurant.images as string)) : [],
      });
    }
  }, [restaurant, reset]);

  useEffect(() => {
    if (workingHours) {
      const form: WorkingHoursForm = {};
      workingHours.forEach((wh) => {
        form[wh.dayOfWeek] = {
          isOpen: !wh.isClosed,
          openTime: wh.openTime || "09:00",
          closeTime: wh.closeTime || "22:00",
        };
      });
      // Fill missing days
      DAYS_OF_WEEK.forEach((day) => {
        if (!form[day.value]) {
          form[day.value] = { isOpen: true, openTime: "09:00", closeTime: "22:00" };
        }
      });
      setHoursForm(form);
    }
  }, [workingHours]);

  const onSubmitInfo = async (data: RestaurantFormData) => {
    if (!restaurantId) return;
    try {
      await updateRestaurant({ id: restaurantId, data }).unwrap();
      showToast({ type: "success", title: "Успіх", message: "Інформацію оновлено" });
    } catch {
      showToast({ type: "error", title: "Помилка", message: "Не вдалося оновити інформацію" });
    }
  };

  const onSubmitHours = async () => {
    if (!restaurantId) return;
    try {
      await Promise.all(
        DAYS_OF_WEEK.map((day) =>
          updateWorkingHoursForDay({
            restaurantId,
            day: day.value,
            data: {
              isClosed: !hoursForm[day.value]?.isOpen,
              openTime: hoursForm[day.value]?.openTime || "09:00",
              closeTime: hoursForm[day.value]?.closeTime || "22:00",
            },
          }).unwrap()
        )
      );
      showToast({ type: "success", title: "Успіх", message: "Робочий графік оновлено" });
    } catch {
      showToast({ type: "error", title: "Помилка", message: "Не вдалося оновити робочий графік" });
    }
  };

  if (isLoadingRestaurant) {
    return <PageSpinner />;
  }

  if (!restaurantId && restaurants && restaurants.length > 0) {
    return (
      <div className={styles.container}>
        <div className={styles.restaurantPrompt}>
          <p className={styles.promptTitle}>Оберіть ресторан для управління</p>
          <div className={styles.restaurantList}>
            {restaurants.map((r) => (
              <div
                key={r.id}
                className={styles.restaurantCard}
                onClick={() => selectRestaurant(r.id)}
              >
                <h3>{r.name}</h3>
                <p>{r.address}</p>
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

  if (isLoading || hoursLoading) {
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
        <h1 className={styles.title}>Налаштування ресторану</h1>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "info" ? styles.active : ""}`}
          onClick={() => setActiveTab("info")}
        >
          Інформація
        </button>
        <button
          className={`${styles.tab} ${activeTab === "hours" ? styles.active : ""}`}
          onClick={() => setActiveTab("hours")}
        >
          Робочий графік
        </button>
      </div>

      {activeTab === "info" && (
        <form onSubmit={handleSubmit(onSubmitInfo)} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroupFull}>
              <label className={styles.label}>Назва ресторану</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input type="text" className={styles.input} {...field} />
                )}
              />
              {errors.name && <span className={styles.error}>{errors.name.message}</span>}
            </div>

            <div className={styles.fieldGroupFull}>
              <label className={styles.label}>Опис</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea className={styles.textarea} rows={4} {...field} />
                )}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Адреса</label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <input type="text" className={styles.input} {...field} />
                )}
              />
              {errors.address && <span className={styles.error}>{errors.address.message}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Місто</label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <input type="text" className={styles.input} {...field} />
                )}
              />
              {errors.city && <span className={styles.error}>{errors.city.message}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Телефон</label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <input type="tel" className={styles.input} {...field} />
                )}
              />
              {errors.phone && <span className={styles.error}>{errors.phone.message}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input type="email" className={styles.input} {...field} />
                )}
              />
              {errors.email && <span className={styles.error}>{errors.email.message}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Тип кухні</label>
              <Controller
                name="cuisineType"
                control={control}
                render={({ field }) => (
                  <input type="text" className={styles.input} {...field} />
                )}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Ціновий діапазон</label>
              <Controller
                name="priceRange"
                control={control}
                render={({ field }) => (
                  <select className={styles.select} {...field}>
                    <option value="">Не вказано</option>
                    <option value="$">$ - Бюджетно</option>
                    <option value="$$">$$ - Середній</option>
                    <option value="$$$">$$$ - Вище середнього</option>
                    <option value="$$$$">$$$$ - Преміум</option>
                  </select>
                )}
              />
            </div>

            <div className={styles.fieldGroupFull}>
              <label className={styles.label}>Фотографії ресторану</label>
              <Controller
                name="images"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value ?? []}
                    onChange={field.onChange}
                    directory="restaurants"
                    maxFiles={10}
                  />
                )}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="submit" isLoading={isUpdating}>
              Зберегти зміни
            </Button>
          </div>
        </form>
      )}

      {activeTab === "hours" && (
        <div className={styles.hoursForm}>
          <div className={styles.hoursGrid}>
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.value} className={styles.dayRow}>
                <div className={styles.dayHeader}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={hoursForm[day.value]?.isOpen ?? true}
                      onChange={(e) =>
                        setHoursForm({
                          ...hoursForm,
                          [day.value]: {
                            ...hoursForm[day.value],
                            isOpen: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className={styles.dayName}>{day.label}</span>
                  </label>
                </div>

                {hoursForm[day.value]?.isOpen && (
                  <div className={styles.timeInputs}>
                    <div className={styles.timeGroup}>
                      <label className={styles.timeLabel}>Відкриття</label>
                      <input
                        type="time"
                        className={styles.timeInput}
                        value={hoursForm[day.value]?.openTime || "09:00"}
                        onChange={(e) =>
                          setHoursForm({
                            ...hoursForm,
                            [day.value]: {
                              ...hoursForm[day.value],
                              openTime: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <span className={styles.timeSeparator}>—</span>
                    <div className={styles.timeGroup}>
                      <label className={styles.timeLabel}>Закриття</label>
                      <input
                        type="time"
                        className={styles.timeInput}
                        value={hoursForm[day.value]?.closeTime || "22:00"}
                        onChange={(e) =>
                          setHoursForm({
                            ...hoursForm,
                            [day.value]: {
                              ...hoursForm[day.value],
                              closeTime: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {!hoursForm[day.value]?.isOpen && (
                  <div className={styles.closedBadge}>Вихідний</div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.formActions}>
            <Button onClick={onSubmitHours} isLoading={isUpdatingHours}>
              Зберегти графік
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
