"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { resolveImageUrl, PLACEHOLDER_IMAGE } from "@/lib/utils/imageUrl";
import styles from "./RestaurantGallery.module.css";

interface RestaurantGalleryProps {
  images: string[];
  restaurantName: string;
}

export default function RestaurantGallery({ images, restaurantName }: RestaurantGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const imageUrls = images && images.length > 0 
    ? images.map(img => resolveImageUrl(img))
    : [resolveImageUrl(PLACEHOLDER_IMAGE)];

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    document.body.style.overflow = "auto";
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + imageUrls.length) % imageUrls.length);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % imageUrls.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

  return (
    <>
      <div className={styles.gallery}>
        {imageUrls.length === 1 ? (
          <div className={styles.singleImage} onClick={() => openLightbox(0)}>
            <Image
              src={imageUrls[0]}
              alt={`${restaurantName} - фото`}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        ) : (
          <>
            <div className={styles.mainImage} onClick={() => openLightbox(0)}>
              <Image
                src={imageUrls[0]}
                alt={`${restaurantName} - головне фото`}
                fill
                className={styles.image}
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
            </div>
            <div className={styles.thumbnails}>
              {imageUrls.slice(1, 5).map((url, index) => (
                <div
                  key={index}
                  className={styles.thumbnail}
                  onClick={() => openLightbox(index + 1)}
                >
                  <Image
                    src={url}
                    alt={`${restaurantName} - фото ${index + 2}`}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                  {index === 3 && imageUrls.length > 5 && (
                    <div className={styles.moreOverlay}>
                      <span>+{imageUrls.length - 5}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className={styles.lightbox}
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <button
            className={styles.closeBtn}
            onClick={closeLightbox}
            aria-label="Закрити"
          >
            <X size={24} />
          </button>

          <button
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            aria-label="Попереднє фото"
          >
            <ChevronLeft size={32} />
          </button>

          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <Image
              src={imageUrls[selectedIndex]}
              alt={`${restaurantName} - фото ${selectedIndex + 1}`}
              fill
              className={styles.lightboxImage}
              sizes="100vw"
            />
          </div>

          <button
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Наступне фото"
          >
            <ChevronRight size={32} />
          </button>

          <div className={styles.counter}>
            {selectedIndex + 1} / {imageUrls.length}
          </div>
        </div>
      )}
    </>
  );
}
