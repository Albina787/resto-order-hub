import Link from "next/link";
import Image from "next/image";
import type { Restaurant } from "@/types/restaurant";
import { formatPriceRange } from "@/lib/utils/formatters";
import { getFirstImage, resolveImageUrl, PLACEHOLDER_IMAGE } from "@/lib/utils/imageUrl";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import styles from "./RestaurantCard.module.css";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

function priceRangeVariant(
  range?: string
): "success" | "warning" | "error" | "default" {
  switch (range) {
    case "BUDGET":
      return "success";
    case "MODERATE":
      return "default";
    case "EXPENSIVE":
      return "warning";
    case "LUXURY":
      return "error";
    default:
      return "default";
  }
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const coverImage = getFirstImage(restaurant.images) || resolveImageUrl(PLACEHOLDER_IMAGE);

  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className={styles.card}
      aria-label={`${restaurant.name}, ${restaurant.city}`}
    >
      <Card hoverable padding="none">
        <div className={styles.imageWrapper}>
          <Image
            src={coverImage}
            alt={restaurant.name}
            fill
            className={styles.image}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className={styles.body}>
          <div className={styles.header}>
            <h3 className={styles.name}>{restaurant.name}</h3>
            {restaurant.priceRange && (
              <Badge variant={priceRangeVariant(restaurant.priceRange)}>
                {formatPriceRange(restaurant.priceRange)}
              </Badge>
            )}
          </div>

          <div className={styles.meta}>
            <span className={styles.city}>{restaurant.city}</span>
            {restaurant.cuisineType && (
              <>
                <span className={styles.separator} aria-hidden="true">·</span>
                <span className={styles.cuisine}>{restaurant.cuisineType}</span>
              </>
            )}
          </div>

          <div className={styles.footer}>
            <span className={styles.capacity}>
              Місткість: {restaurant.capacity} осіб
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
