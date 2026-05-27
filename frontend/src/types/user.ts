export type UserRole = "GUEST" | "CLIENT" | "WAITER" | "CHEF" | "MANAGER" | "OWNER";
export type AuthProvider = "LOCAL" | "GOOGLE" | "FACEBOOK";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  authProvider: AuthProvider;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAssignment {
  id: string;
  // User info (from StaffAssignmentResponse DTO)
  userId: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userPhone?: string;
  userAvatar?: string;
  // Assignment info
  restaurantId: string;
  position: "WAITER" | "CHEF" | "MANAGER";
  isActive: boolean;
  assignedAt: string;
  // Who assigned
  assignedById?: string;
  assignedByName?: string;
}
