"use client";

import { useInitAuth } from "@/lib/hooks/useAuth";

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthInitializer({ children }: AuthProviderProps) {
  useInitAuth();
  return <>{children}</>;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return <AuthInitializer>{children}</AuthInitializer>;
}
