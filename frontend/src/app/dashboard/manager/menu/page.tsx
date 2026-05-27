import type { Metadata } from "next";
import ManagerMenu from "@/components/features/dashboard/manager/ManagerMenu/ManagerMenu";

export const metadata: Metadata = {
  title: "Менеджер — Меню",
  description: "Управління меню ресторану: страви, категорії, ціни.",
};

export default function ManagerMenuPage() {
  return <ManagerMenu />;
}
