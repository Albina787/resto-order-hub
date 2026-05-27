import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/features/auth/ForgotPasswordForm/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Відновлення пароля",
  description: "Відновіть доступ до свого акаунту RestoOrderHub",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
