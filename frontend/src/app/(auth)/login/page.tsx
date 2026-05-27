import type { Metadata } from "next";
import LoginForm from "@/components/features/auth/LoginForm/LoginForm";

export const metadata: Metadata = {
  title: "Вхід",
  description: "Увійдіть до свого акаунту RestoOrderHub",
};

export default function LoginPage() {
  return <LoginForm />;
}
