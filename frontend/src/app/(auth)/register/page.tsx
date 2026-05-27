import type { Metadata } from "next";
import RegisterForm from "@/components/features/auth/RegisterForm/RegisterForm";

export const metadata: Metadata = {
  title: "Реєстрація",
  description: "Створіть новий акаунт RestoOrderHub",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
