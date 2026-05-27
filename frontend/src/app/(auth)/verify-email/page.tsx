import type { Metadata } from "next";
import { redirect } from "next/navigation";
import VerifyEmail from "@/components/features/auth/VerifyEmail/VerifyEmail";

export const metadata: Metadata = {
  title: "Підтвердження email",
  description: "Підтвердіть вашу email адресу",
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect("/login");
  }

  return <VerifyEmail token={token} />;
}
