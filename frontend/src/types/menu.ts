export type SpicyLevel = "NONE" | "MILD" | "MEDIUM" | "HOT" | "EXTRA_HOT";

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Matches backend MenuItemResponse DTO
export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spicyLevel: SpicyLevel;
  preparationTime?: number;
  calories?: number;
  isAvailable: boolean;
  isPopular: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuSection {
  category: Category;
  items: MenuItem[];
}
