"use client";

import { useState } from "react";
import { UtensilsCrossed, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetPublicRestaurantsQuery } from "@/lib/store/api/publicApi";
import RestaurantCard from "@/components/features/restaurants/RestaurantCard/RestaurantCard";
import EmptyState from "@/components/shared/EmptyState/EmptyState";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import Button from "@/components/ui/Button/Button";
import styles from "./RestaurantList.module.css";

const CUISINE_TYPES = [
  "Українська",
  "Італійська",
  "Японська",
  "Американська",
  "Французька",
  "Мексиканська",
  "Китайська",
  "Індійська",
];

const PRICE_RANGES = [
  { label: "$", value: "BUDGET" },
  { label: "$$", value: "MODERATE" },
  { label: "$$$", value: "EXPENSIVE" },
  { label: "$$$$", value: "LUXURY" },
];

export default function RestaurantList() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, refetch } = useGetPublicRestaurantsQuery({
    search: search || undefined,
    city: city || undefined,
    cuisineType: cuisineType || undefined,
    priceRange: priceRange || undefined,
    page,
    size: 12,
  });

  const restaurants = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const hasFilters = search || city || cuisineType || priceRange;

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCity("");
    setCuisineType("");
    setPriceRange("");
    setPage(0);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Ресторани</h1>
          <p className={styles.subheading}>
            Знайдіть ідеальне місце для вашого відвідування
          </p>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Пошук ресторану..."
              value={search}
              onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
            />
          </div>

          <select
            className={styles.select}
            value={city}
            onChange={(e) => handleFilterChange(setCity)(e.target.value)}
          >
            <option value="">Всі міста</option>
            <option value="Київ">Київ</option>
            <option value="Львів">Львів</option>
            <option value="Одеса">Одеса</option>
            <option value="Харків">Харків</option>
            <option value="Дніпро">Дніпро</option>
          </select>

          <select
            className={styles.select}
            value={cuisineType}
            onChange={(e) => handleFilterChange(setCuisineType)(e.target.value)}
          >
            <option value="">Всі кухні</option>
            {CUISINE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={priceRange}
            onChange={(e) => handleFilterChange(setPriceRange)(e.target.value)}
          >
            <option value="">Всі ціни</option>
            {PRICE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button className={styles.clearBtn} onClick={handleClearFilters}>
              Очистити
            </button>
          )}
        </div>

        {isLoading && (
          <div className={styles.grid} aria-busy="true" aria-label="Завантаження...">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        )}

        {isError && (
          <div className={styles.centered}>
            <ErrorMessage
              title="Не вдалося завантажити ресторани"
              message="Перевірте підключення до інтернету та спробуйте ще раз."
              onRetry={refetch}
            />
          </div>
        )}

        {!isLoading && !isError && restaurants.length === 0 && (
          <div className={styles.centered}>
            <EmptyState
              icon={<UtensilsCrossed size={48} />}
              title="Ресторани не знайдено"
              description={
                hasFilters
                  ? "Спробуйте змінити фільтри або пошуковий запит"
                  : "Наразі немає доступних ресторанів. Спробуйте пізніше."
              }
            />
          </div>
        )}

        {!isLoading && !isError && restaurants.length > 0 && (
          <>
            <div className={styles.resultsCount}>
              Знайдено {totalElements} {totalElements === 1 ? "ресторан" : "ресторанів"}
            </div>
            <div className={styles.grid}>
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  isDisabled={page === 0}
                >
                  <ChevronLeft size={16} />
                  Попередня
                </Button>

                <div className={styles.pageNumbers}>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (page < 3) {
                      pageNum = i;
                    } else if (page > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`${styles.pageBtn} ${page === pageNum ? styles.active : ""}`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  isDisabled={page >= totalPages - 1}
                >
                  Наступна
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
