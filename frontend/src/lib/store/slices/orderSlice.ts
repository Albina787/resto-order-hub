import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "@/types/order";

interface OrderState {
  cart: CartItem[];
  restaurantId: string | null;
}

const initialState: OrderState = {
  cart: [],
  restaurantId: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.cart.find(
        (item) => item.menuItemId === action.payload.menuItemId
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter((item) => item.menuItemId !== action.payload);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ menuItemId: string; quantity: number }>
    ) => {
      const item = state.cart.find((i) => i.menuItemId === action.payload.menuItemId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.cart = state.cart.filter((i) => i.menuItemId !== action.payload.menuItemId);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    clearCart: (state) => {
      state.cart = [];
      state.restaurantId = null;
    },
    setCartRestaurant: (state, action: PayloadAction<string>) => {
      if (state.restaurantId && state.restaurantId !== action.payload) {
        state.cart = [];
      }
      state.restaurantId = action.payload;
    },
    resetOrder: () => initialState,
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  setCartRestaurant,
  resetOrder,
} = orderSlice.actions;
export default orderSlice.reducer;
