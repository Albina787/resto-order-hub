import type { Metadata } from "next";
import ProfilePage from "@/components/features/profile/ProfilePage/ProfilePage";

export const metadata: Metadata = {
  title: "Мій профіль",
  description: "Керуйте своїм профілем, особистими даними та налаштуваннями акаунту.",
};

export default function ProfileRoute() {
  return <ProfilePage />;
}
