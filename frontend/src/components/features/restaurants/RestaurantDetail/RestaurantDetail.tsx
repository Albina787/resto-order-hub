"use client";

import { useGetPublicRestaurantQuery } from "@/lib/store/api/publicApi";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Mail, Clock, ChefHat, DollarSign } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import RestaurantGallery from "@/components/features/restaurants/RestaurantGallery/RestaurantGallery";
import WorkingHoursTable from "@/components/features/restaurants/WorkingHoursTable/WorkingHoursTable";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";
import styles from "./RestaurantDetail.module.css";

interface RestaurantDetailProps {
  restaurantId: string;
}

export default function RestaurantDetail({ restaurantId }: RestaurantDetailProps) {
  const router = useRouter();
  const { data: restaurant, isLoading, isError, refetch } = useGetPublicRestaurantQuery(restaurantId);

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !restaurant) {
    return (
      <div className={styles.container}>
        <ErrorMessage
          title="Не вдалося завантажити ресторан"
          message="Перевірте підключення до інтернету та спробуйте ще раз."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Gallery */}
        <RestaurantGallery 
          images={
            Array.isArray(restaurant.images) 
              ? restaurant.images 
              : restaurant.images 
                ? (typeof restaurant.images === 'string' ? JSON.parse(restaurant.images) : [restaurant.images])
                : []
          } 
          restaurantName={restaurant.name} 
        />

        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>{restaurant.name}</h1>
            <div className={styles.metaInfo}>
              {restaurant.cuisineType && (
                <div className={styles.metaItem}>
                  <ChefHat size={16} />
                  <span>{restaurant.cuisineType}</span>
                </div>
              )}
              {restaurant.priceRange && (
                <div className={styles.metaItem}>
                  <DollarSign size={16} />
                  <span>{restaurant.priceRange}</span>
                </div>
              )}
            </div>
          </div>
          <div className={styles.heroActions}>
            <Button
              size="lg"
              onClick={() => router.push(`/restaurants/${restaurant.id}/reserve`)}
            >
              Забронювати столик
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push(`/restaurants/${restaurant.id}/menu`)}
            >
              Переглянути меню
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.content}>
          {/* Info Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Інформація</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <MapPin className={styles.infoIcon} size={20} />
                <div>
                  <div className={styles.infoLabel}>Адреса</div>
                  <div className={styles.infoValue}>{restaurant.address}</div>
                </div>
              </div>

              {restaurant.phone && (
                <div className={styles.infoItem}>
                  <Phone className={styles.infoIcon} size={20} />
                  <div>
                    <div className={styles.infoLabel}>Телефон</div>
                    <a href={`tel:${restaurant.phone}`} className={styles.infoLink}>
                      {restaurant.phone}
                    </a>
                  </div>
                </div>
              )}

              {restaurant.email && (
                <div className={styles.infoItem}>
                  <Mail className={styles.infoIcon} size={20} />
                  <div>
                    <div className={styles.infoLabel}>Email</div>
                    <a href={`mailto:${restaurant.email}`} className={styles.infoLink}>
                      {restaurant.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {restaurant.description && (
              <div className={styles.description}>
                <h3 className={styles.descriptionTitle}>Про ресторан</h3>
                <p className={styles.descriptionText}>{restaurant.description}</p>
              </div>
            )}
          </div>

          {/* Working Hours */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Clock size={24} />
              Графік роботи
            </h2>
            <WorkingHoursTable restaurantId={restaurant.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
