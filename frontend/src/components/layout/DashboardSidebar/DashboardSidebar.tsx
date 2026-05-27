"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Table2,
  UtensilsCrossed,
  ShoppingBag,
  Users,
  BarChart3,
  ChefHat,
  Building2,
  Network,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppDispatch } from "@/lib/store/hooks";
import { logoutAndClearCache } from "@/lib/store/slices/authSlice";
import { formatUserRole } from "@/lib/utils/formatters";
import styles from "./DashboardSidebar.module.css";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export default function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isManager, isOwner, isChef, isWaiter } = useAuth();

  const handleLogout = async () => {
    try {
      // Wait for backend logout to complete before clearing frontend state
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout request failed:", error);
      // Continue with frontend cleanup even if backend fails
    }
    
    // Clear all frontend state and cache
    dispatch(logoutAndClearCache());
    
    // Redirect to home
    router.push("/");
    router.refresh();
  };

  const managerLinks: NavItem[] = [
    { href: "/dashboard/manager/reservations", label: "Бронювання", icon: <Calendar size={18} /> },
    { href: "/dashboard/manager/tables", label: "Столики", icon: <Table2 size={18} /> },
    { href: "/dashboard/manager/menu", label: "Меню", icon: <UtensilsCrossed size={18} /> },
    { href: "/dashboard/manager/orders", label: "Замовлення", icon: <ShoppingBag size={18} /> },
    { href: "/dashboard/manager/staff", label: "Персонал", icon: <Users size={18} /> },
    { href: "/dashboard/manager/analytics", label: "Аналітика", icon: <BarChart3 size={18} /> },
  ];

  const ownerExtraLinks: NavItem[] = [
    { href: "/dashboard/owner/restaurants", label: "Ресторани", icon: <Building2 size={18} /> },
    { href: "/dashboard/owner/analytics", label: "Мережева аналітика", icon: <Network size={18} /> },
  ];

  const chefLinks: NavItem[] = [
    { href: "/dashboard/kitchen/orders", label: "Замовлення кухні", icon: <ChefHat size={18} /> },
  ];

  const waiterLinks: NavItem[] = [
    { href: "/dashboard/waiter/tables", label: "Столики", icon: <Table2 size={18} /> },
    { href: "/dashboard/waiter/orders", label: "Замовлення", icon: <ShoppingBag size={18} /> },
  ];

  const renderLinks = (links: NavItem[]) =>
    links.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className={`${styles.navLink} ${pathname.startsWith(link.href) ? styles.active : ""}`}
        onClick={onNavigate}
      >
        <span className={styles.navIcon}>{link.icon}</span>
        {link.label}
      </Link>
    ));

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <Link href="/" className={styles.logoText}>
          RestoOrderHub
        </Link>
      </div>

      <nav className={styles.nav}>
        {isManager && (
          <div className={styles.navSection}>
            <p className={styles.navSectionTitle}>Управління</p>
            {renderLinks(managerLinks)}
          </div>
        )}

        {isOwner && (
          <div className={styles.navSection}>
            <p className={styles.navSectionTitle}>Власник</p>
            {renderLinks(ownerExtraLinks)}
          </div>
        )}

        {isChef && !isManager && (
          <div className={styles.navSection}>
            <p className={styles.navSectionTitle}>Кухня</p>
            {renderLinks(chefLinks)}
          </div>
        )}

        {isWaiter && !isManager && !isChef && (
          <div className={styles.navSection}>
            <p className={styles.navSectionTitle}>Офіціант</p>
            {renderLinks(waiterLinks)}
          </div>
        )}
      </nav>

      <div className={styles.footer}>
        {user && (
          <div className={styles.userInfo}>
            <p className={styles.userName}>
              {user.firstName} {user.lastName}
            </p>
            <p className={styles.userRole}>{formatUserRole(user.role)}</p>
          </div>
        )}
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={16} />
          Вийти
        </button>
      </div>
    </div>
  );
}
