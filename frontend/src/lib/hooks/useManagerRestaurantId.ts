"use client";

import { useState, useEffect } from "react";

export const useManagerRestaurantId = () => {
  const [restaurantId, setRestaurantIdState] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("managerRestaurantId");
      setRestaurantIdState(stored);
    }
  }, []);

  const setRestaurantId = (id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("managerRestaurantId", id);
    }
    setRestaurantIdState(id);
  };

  return { restaurantId, setRestaurantId };
};
