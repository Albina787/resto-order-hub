"use client";

import { useState } from "react";
import { useGetPublicRestaurantMenuQuery, useGetPublicRestaurantCategoriesQuery } from "@/lib/store/api/publicApi";
import MenuItemCard from "@/components/features/menu/MenuItemCard/MenuItemCard";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";
import { UtensilsCrossed, Search } from "lucide-react";
import styles from "./RestaurantMenu.module.css";

interface RestaurantMenuProps {
  restaurantId: string;
}

export default function RestaurantMenu({ restaurantId }: RestaurantMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState<string>("");

  const { data: menuItems, isLoading: itemsLoading, isError: itemsError, refetch: refetchItems } = 
    useGetPublicRestaurantMenuQuery(restaurantId);
  const { data: categories, isLoading: categoriesLoading } = 
    useGetPublicRestaurantCategoriesQuery(restaurantId);

  const isLoading = itemsLoading || categoriesLoading;

  if (isLoading) {
    return <PageSpinner />;
  }

  if (itemsError) {
    return (
      <div className={styles.container}>
        <ErrorMessage
          title="Не вдалося завантажити меню"
          message="Перевірте підключення до інтернету та спробуйте ще раз."
          onRetry={refetchItems}
        />
      </div>
    );
  }

  // Filter menu items
  const filteredItems = (menuItems || []).filter((item) => {
    // Category filter
    if (selectedCategory && item.categoryId !== selectedCategory) {
      return false;
    }

    // Search filter
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Dietary filter
    if (dietaryFilter === "vegetarian" && !item.isVegetarian) return false;
    if (dietaryFilter === "vegan" && !item.isVegan) return false;
    if (dietaryFilter === "glutenFree" && !item.isGlutenFree) return false;

    // Only show available items
    return item.isAvailable;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Меню</h1>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Пошук страви..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className={styles.select}
          value={dietaryFilter}
          onChange={(e) => setDietaryFilter(e.target.value)}
        >
          <option value="">Всі страви</option>
          <option value="vegetarian">Вегетаріанські</option>
          <option value="vegan">Веганські</option>
          <option value="glutenFree">Без глютену</option>
        </select>
      </div>

      <div className={styles.content}>
        {/* Categories Sidebar */}
        {categories && categories.length > 0 && (
          <div className={styles.sidebar}>
            <button
              className={`${styles.categoryBtn} ${!selectedCategory ? styles.active : ""}`}
              onClick={() => setSelectedCategory("")}
            >
              Всі категорії
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryBtn} ${selectedCategory === category.id ? styles.active : ""}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Menu Items Grid */}
        <div className={styles.main}>
          {filteredItems.length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed size={48} />}
              title="Страв не знайдено"
              description="Спробуйте змінити фільтри або пошуковий запит"
            />
          ) : (
            <div className={styles.grid}>
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
