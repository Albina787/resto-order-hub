"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/lib/hooks/useToast";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetMenuItemsQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useToggleMenuItemAvailabilityMutation,
} from "@/lib/store/api/menuApi";
import { useStaffRestaurant } from "@/lib/hooks/useStaffRestaurant";
import { formatCurrency } from "@/lib/utils/formatters";
import type { MenuItem } from "@/types/menu";

// CategoryResponse from menuApi
interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  restaurantId: string;
}
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import ImageUpload from "@/components/ui/ImageUpload/ImageUpload";
import RestaurantSelector from "@/components/features/dashboard/RestaurantSelector/RestaurantSelector";
import styles from "./ManagerMenu.module.css";

const categorySchema = z.object({
  name: z.string().min(1, "Обов'язкове поле"),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0),
});

const menuItemSchema = z.object({
  name: z.string().min(1, "Обов'язкове поле"),
  description: z.string().optional(),
  price: z.number().min(0),
  categoryId: z.string().min(1, "Оберіть категорію"),
  isVegetarian: z.boolean(),
  isVegan: z.boolean(),
  isGlutenFree: z.boolean(),
  preparationTime: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type MenuItemFormData = z.infer<typeof menuItemSchema>;

type ActiveTab = "categories" | "items";

export default function ManagerMenu() {
  const { restaurantId, isLoading: isLoadingRestaurant, restaurants, selectRestaurant } = useStaffRestaurant();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>("categories");
  const [categoryModal, setCategoryModal] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const { data: categories, isLoading: catLoading, isError: catError, refetch: refetchCat } = useGetCategoriesQuery(restaurantId!, { skip: !restaurantId });
  const { data: menuItems, isLoading: itemsLoading, isError: itemsError, refetch: refetchItems } = useGetMenuItemsQuery(restaurantId!, { skip: !restaurantId });

  const [createCategory, { isLoading: isCreatingCat }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdatingCat }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [createMenuItem, { isLoading: isCreatingItem }] = useCreateMenuItemMutation();
  const [updateMenuItem, { isLoading: isUpdatingItem }] = useUpdateMenuItemMutation();
  const [deleteMenuItem] = useDeleteMenuItemMutation();
  const [updateAvailability] = useToggleMenuItemAvailabilityMutation();

  const catForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", displayOrder: 0 },
  });

  const itemForm = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "", description: "", price: 0, categoryId: "",
      isVegetarian: false, isVegan: false, isGlutenFree: false, preparationTime: 15,
      images: [],
    },
  });

  const openCategoryCreate = () => {
    setEditingCategory(null);
    catForm.reset({ name: "", description: "", displayOrder: 0 });
    setCategoryModal(true);
  };

  const openCategoryEdit = (cat: CategoryResponse) => {
    setEditingCategory(cat);
    catForm.reset({ name: cat.name, description: cat.description ?? "", displayOrder: cat.displayOrder });
    setCategoryModal(true);
  };

  const onCategorySubmit = async (data: CategoryFormData) => {
    if (!restaurantId) return;
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, data: { ...data, restaurantId } }).unwrap();
        toast.success("Категорію оновлено", "Зміни успішно збережено");
      } else {
        await createCategory({ ...data, restaurantId }).unwrap();
        toast.success("Категорію додано", "Нова категорія успішно створена");
      }
      setCategoryModal(false);
    } catch (error) {
      toast.error("Помилка", "Не вдалося зберегти категорію");
    }
  };

  const openItemCreate = () => {
    setEditingItem(null);
    itemForm.reset({ name: "", description: "", price: 0, categoryId: "", isVegetarian: false, isVegan: false, isGlutenFree: false, preparationTime: 15 });
    setItemModal(true);
  };

  const openItemEdit = (item: MenuItem) => {
    setEditingItem(item);
    itemForm.reset({
      name: item.name, description: item.description ?? "", price: item.price,
      categoryId: item.categoryId, isVegetarian: item.isVegetarian,
      isVegan: item.isVegan, isGlutenFree: item.isGlutenFree,
      preparationTime: item.preparationTime ?? 15,
      images: item.images ? (Array.isArray(item.images) ? item.images : JSON.parse(item.images as string)) : [],
    });
    setItemModal(true);
  };

  const onItemSubmit = async (data: MenuItemFormData) => {
    if (!restaurantId) return;
    try {
      if (editingItem) {
        await updateMenuItem({ id: editingItem.id, data }).unwrap();
        toast.success("Страву оновлено", "Зміни успішно збережено");
      } else {
        await createMenuItem({ restaurantId, categoryId: data.categoryId, data }).unwrap();
        toast.success("Страву додано", "Нова страва успішно створена");
      }
      setItemModal(false);
    } catch (error) {
      toast.error("Помилка", "Не вдалося зберегти страву");
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
        <h1 className={styles.title}>Меню</h1>
        <RestaurantSelector />
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === "categories" ? styles.active : ""}`} onClick={() => setActiveTab("categories")}>
          Категорії
        </button>
        <button className={`${styles.tab} ${activeTab === "items" ? styles.active : ""}`} onClick={() => setActiveTab("items")}>
          Страви
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <>
          <div className={styles.tabHeader}>
            <Button onClick={openCategoryCreate}>Додати категорію</Button>
          </div>
          {catLoading && <div className={styles.skeleton} />}
          {catError && <ErrorMessage onRetry={refetchCat} />}
          {!catLoading && !catError && (!categories || categories.length === 0) && (
            <EmptyState title="Категорій не знайдено" />
          )}
          {!catLoading && !catError && categories && categories.length > 0 && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Назва</th>
                    <th>Опис</th>
                    <th>Порядок</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td>{cat.description ?? "—"}</td>
                      <td>{cat.displayOrder}</td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.editBtn} onClick={() => openCategoryEdit(cat)}>Редагувати</button>
                          <button className={styles.deleteBtn} onClick={async () => {
                            try {
                              await deleteCategory(cat.id).unwrap();
                              toast.success("Категорію видалено", "Категорія успішно видалена");
                            } catch (error) {
                              toast.error("Помилка", "Не вдалося видалити категорію");
                            }
                          }}>Видалити</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Menu Items Tab */}
      {activeTab === "items" && (
        <>
          <div className={styles.tabHeader}>
            <Button onClick={openItemCreate}>Додати страву</Button>
          </div>
          {itemsLoading && <div className={styles.skeleton} />}
          {itemsError && <ErrorMessage onRetry={refetchItems} />}
          {!itemsLoading && !itemsError && (!menuItems || menuItems.length === 0) && (
            <EmptyState title="Страв не знайдено" />
          )}
          {!itemsLoading && !itemsError && menuItems && menuItems.length > 0 && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Назва</th>
                    <th>Ціна</th>
                    <th>Категорія</th>
                    <th>Доступність</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{categories?.find((c) => c.id === item.categoryId)?.name ?? "—"}</td>
                      <td>
                        <span className={`${styles.availableBadge} ${item.isAvailable ? styles.available : styles.unavailable}`}>
                          {item.isAvailable ? "Доступно" : "Недоступно"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.editBtn} onClick={() => openItemEdit(item)}>Редагувати</button>
                          <button
                            className={styles.toggleBtn}
                            onClick={async () => {
                              try {
                                await updateAvailability(item.id).unwrap();
                                toast.success(
                                  item.isAvailable ? "Страву вимкнено" : "Страву увімкнено",
                                  `Страва тепер ${item.isAvailable ? "недоступна" : "доступна"} для замовлення`
                                );
                              } catch (error) {
                                toast.error("Помилка", "Не вдалося змінити доступність");
                              }
                            }}
                          >
                            {item.isAvailable ? "Вимкнути" : "Увімкнути"}
                          </button>
                          <button className={styles.deleteBtn} onClick={async () => {
                            try {
                              await deleteMenuItem(item.id).unwrap();
                              toast.success("Страву видалено", "Страва успішно видалена з меню");
                            } catch (error) {
                              toast.error("Помилка", "Не вдалося видалити страву");
                            }
                          }}>Видалити</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Category Modal */}
      <Modal isOpen={categoryModal} onClose={() => setCategoryModal(false)} title={editingCategory ? "Редагувати категорію" : "Додати категорію"}>
        <form onSubmit={catForm.handleSubmit(onCategorySubmit)}>
          <div className={styles.modalContent}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Назва</label>
              <Controller name="name" control={catForm.control} render={({ field }) => (
                <input type="text" className={styles.nativeInput} {...field} />
              )} />
              {catForm.formState.errors.name && <span className={styles.fieldError}>{catForm.formState.errors.name.message}</span>}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Опис</label>
              <Controller name="description" control={catForm.control} render={({ field }) => (
                <textarea className={styles.nativeTextarea} rows={3} {...field} />
              )} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Порядок відображення</label>
              <Controller name="displayOrder" control={catForm.control} render={({ field }) => (
                <input type="number" className={styles.nativeInput} min={0} value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value, 10))} />
              )} />
            </div>
            <div className={styles.modalActions}>
              <Button type="button" variant="secondary" onClick={() => setCategoryModal(false)}>Скасувати</Button>
              <Button type="submit" isLoading={isCreatingCat || isUpdatingCat}>{editingCategory ? "Зберегти" : "Додати"}</Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Menu Item Modal */}
      <Modal isOpen={itemModal} onClose={() => setItemModal(false)} title={editingItem ? "Редагувати страву" : "Додати страву"} size="lg">
        <form onSubmit={itemForm.handleSubmit(onItemSubmit)}>
          <div className={styles.modalContent}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>Назва</label>
                <Controller name="name" control={itemForm.control} render={({ field }) => (
                  <input type="text" className={styles.nativeInput} {...field} />
                )} />
                {itemForm.formState.errors.name && <span className={styles.fieldError}>{itemForm.formState.errors.name.message}</span>}
              </div>

              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>Опис</label>
                <Controller name="description" control={itemForm.control} render={({ field }) => (
                  <textarea className={styles.nativeTextarea} rows={3} {...field} />
                )} />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Ціна (грн)</label>
                <Controller name="price" control={itemForm.control} render={({ field }) => (
                  <input type="number" className={styles.nativeInput} min={0} step={0.01} value={field.value} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                )} />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Час приготування (хв)</label>
                <Controller name="preparationTime" control={itemForm.control} render={({ field }) => (
                  <input type="number" className={styles.nativeInput} min={0} value={field.value ?? ""} onChange={(e) => field.onChange(parseInt(e.target.value, 10))} />
                )} />
              </div>

              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>Категорія</label>
                <Controller name="categoryId" control={itemForm.control} render={({ field }) => (
                  <select className={styles.nativeSelect} value={field.value} onChange={field.onChange}>
                    <option value="">Оберіть категорію...</option>
                    {(categories ?? []).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                )} />
                {itemForm.formState.errors.categoryId && <span className={styles.fieldError}>{itemForm.formState.errors.categoryId.message}</span>}
              </div>

              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>Дієтичні особливості</label>
                <div className={styles.checkboxGroup}>
                  <Controller name="isVegetarian" control={itemForm.control} render={({ field }) => (
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" checked={field.value} onChange={field.onChange} />
                      Вегетаріанське
                    </label>
                  )} />
                  <Controller name="isVegan" control={itemForm.control} render={({ field }) => (
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" checked={field.value} onChange={field.onChange} />
                      Веганське
                    </label>
                  )} />
                  <Controller name="isGlutenFree" control={itemForm.control} render={({ field }) => (
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" checked={field.value} onChange={field.onChange} />
                      Без глютену
                    </label>
                  )} />
                </div>
              </div>
              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>Фотографії страви</label>
                <Controller
                  name="images"
                  control={itemForm.control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value ?? []}
                      onChange={field.onChange}
                      directory="menu-items"
                      maxFiles={4}
                    />
                  )}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button type="button" variant="secondary" onClick={() => setItemModal(false)}>Скасувати</Button>
              <Button type="submit" isLoading={isCreatingItem || isUpdatingItem}>{editingItem ? "Зберегти" : "Додати"}</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
