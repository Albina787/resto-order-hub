import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "selected_restaurant_id";

function readStoredRestaurantId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

interface RestaurantState {
  selectedRestaurantId: string | null;
}

const initialState: RestaurantState = {
  selectedRestaurantId: readStoredRestaurantId(),
};

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    setSelectedRestaurant: (state, action: PayloadAction<string>) => {
      state.selectedRestaurantId = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, action.payload);
      }
    },
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurantId = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    resetRestaurant: () => initialState,
  },
});

export const { setSelectedRestaurant, clearSelectedRestaurant, resetRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;
