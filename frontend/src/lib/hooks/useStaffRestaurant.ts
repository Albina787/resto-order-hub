"use client";

import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useGetMyRestaurantsQuery } from "../store/api/restaurantApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSelectedRestaurant, clearSelectedRestaurant } from "../store/slices/restaurantSlice";

export function useStaffRestaurant() {
  const dispatch = useAppDispatch();
  const { user, isManager, isOwner, isChef, isWaiter } = useAuth();

  // Global selected restaurant ID from Redux (shared across all components)
  const selectedRestaurantId = useAppSelector((s) => s.restaurant.selectedRestaurantId);

  const { data: restaurants = [], isLoading } = useGetMyRestaurantsQuery(undefined, {
    skip: !user || (!isManager && !isOwner && !isChef && !isWaiter),
  });

  // Auto-select first restaurant for staff (non-owner) once restaurants load
  useEffect(() => {
    if (isLoading || !restaurants.length) return;

    // If stored ID is still valid — keep it
    if (selectedRestaurantId && restaurants.some((r) => r.id === selectedRestaurantId)) {
      return;
    }

    // Auto-select first restaurant for non-owners
    if (!isOwner) {
      dispatch(setSelectedRestaurant(restaurants[0].id));
    }
  }, [restaurants, isLoading, isOwner, selectedRestaurantId, dispatch]);

  const selectRestaurant = (restaurantId: string) => {
    if (restaurants.some((r) => r.id === restaurantId)) {
      dispatch(setSelectedRestaurant(restaurantId));
    }
  };

  const clearRestaurant = () => {
    dispatch(clearSelectedRestaurant());
  };

  const currentRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);

  return {
    restaurantId: selectedRestaurantId,
    restaurant: currentRestaurant,
    restaurants,
    isLoading,
    canSelectRestaurant: isOwner && restaurants.length > 1,
    selectRestaurant,
    clearRestaurant,
  };
}
