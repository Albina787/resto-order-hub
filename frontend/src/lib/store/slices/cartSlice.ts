import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "@/types/order";

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  tableId: string | null;
}

const initialState: CartState = {
  items: [],
  restaurantId: null,
  tableId: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setTable: (state, action: PayloadAction<{ restaurantId: string; tableId: string }>) => {
      state.restaurantId = action.payload.restaurantId;
      state.tableId = action.payload.tableId;
    },
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((i) => i.menuItemId === action.payload.menuItemId);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    updateItemQuantity: (
      state,
      action: PayloadAction<{ menuItemId: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.menuItemId === action.payload.menuItemId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.menuItemId !== action.payload);
    },
    updateItemInstructions: (
      state,
      action: PayloadAction<{ menuItemId: string; instructions: string }>
    ) => {
      const item = state.items.find((i) => i.menuItemId === action.payload.menuItemId);
      if (item) {
        item.specialInstructions = action.payload.instructions;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.tableId = null;
    },
    resetCart: () => initialState,
  },
});

export const {
  setTable,
  addItem,
  updateItemQuantity,
  removeItem,
  updateItemInstructions,
  clearCart,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
