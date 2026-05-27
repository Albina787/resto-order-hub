"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, ShoppingCart, UtensilsCrossed } from "lucide-react";

import { useAuth } from "@/lib/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { logoutAndClearCache } from "@/lib/store/slices/authSlice";
import { formatUserRole } from "@/lib/utils/formatters";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/utils/constants";
import Button from "@/components/ui/Button/Button";
import Badge from "@/components/ui/Badge/Badge";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isStaff, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Cart state for clients
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
    
    // Redirect to login
    setMobileOpen(false);
    router.replace("/login");
    router.refresh();
  };

  const closeMobile = () => setMobileOpen(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const dashboardRoute = user ? (ROLE_DASHBOARD_ROUTES[user.role] ?? "/dashboard") : "/dashboard";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} onClick={closeMobile}>
          <UtensilsCrossed size={20} aria-hidden="true" /> RestoOrderHub
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Головна навігація">
          <Link
            href="/restaurants"
            className={`${styles.navLink} ${isActive("/restaurants") ? styles.navLinkActive : ""}`}
          >
            Ресторани
          </Link>

          {isAuthenticated && !isStaff && (
            <>
              <Link
                href="/reservations"
                className={`${styles.navLink} ${isActive("/reservations") ? styles.navLinkActive : ""}`}
              >
                Бронювання
              </Link>
              <Link
                href="/my-orders"
                className={`${styles.navLink} ${isActive("/my-orders") ? styles.navLinkActive : ""}`}
              >
                Мої замовлення
              </Link>
              <Link
                href="/orders"
                className={`${styles.cartLink} ${isActive("/orders") ? styles.cartLinkActive : ""}`}
                title="Кошик"
              >
                <ShoppingCart size={20} />
                {cartItemsCount > 0 && (
                  <span className={styles.cartBadge}>{cartItemsCount}</span>
                )}
              </Link>
            </>
          )}

          {isAuthenticated && isStaff && (
            <Link
              href={dashboardRoute}
              className={`${styles.dashboardLink} ${isActive("/dashboard") ? styles.dashboardLinkActive : ""}`}
            >
              <LayoutDashboard size={16} aria-hidden="true" />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop actions */}
        <div className={styles.actions}>
          {isLoading ? (
            <div className={styles.loadingPlaceholder} aria-hidden="true" />
          ) : isAuthenticated && user ? (
            <div className={styles.userInfo}>
              <Link href="/profile" className={styles.userNameLink}>
                {user.firstName} {user.lastName}
              </Link>
              <Badge variant="info">{formatUserRole(user.role)}</Badge>
              <Button variant="ghost" size="sm" onPress={handleLogout}>
                Вийти
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onPress={() => router.push("/login")}>
                Увійти
              </Button>
              <Button variant="primary" size="sm" onPress={() => router.push("/register")}>
                Реєстрація
              </Button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Закрити меню" : "Відкрити меню"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav} aria-label="Мобільна навігація">
            <Link href="/restaurants" className={styles.mobileNavLink} onClick={closeMobile}>
              Ресторани
            </Link>

            {isAuthenticated && !isStaff && (
              <>
                <Link href="/reservations" className={styles.mobileNavLink} onClick={closeMobile}>
                  Бронювання
                </Link>
                <Link href="/my-orders" className={styles.mobileNavLink} onClick={closeMobile}>
                  Мої замовлення
                </Link>
                <Link href="/orders" className={styles.mobileNavLink} onClick={closeMobile}>
                  <ShoppingCart size={18} style={{ display: "inline", marginRight: "8px" }} />
                  Кошик
                  {cartItemsCount > 0 && (
                    <span className={styles.cartBadge} style={{ marginLeft: "8px" }}>{cartItemsCount}</span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated && isStaff && (
              <Link href={dashboardRoute} className={styles.mobileNavLink} onClick={closeMobile}>
                Dashboard
              </Link>
            )}
          </nav>

          <div className={styles.mobileActions}>
            {isAuthenticated && user ? (
              <>
                <div className={styles.mobileUserInfo}>
                  <Link href="/profile" className={styles.mobileUserName} onClick={closeMobile}>
                    {user.firstName} {user.lastName}
                  </Link>
                  <Badge variant="info">{formatUserRole(user.role)}</Badge>
                </div>
                <Button variant="ghost" fullWidth onPress={handleLogout}>
                  Вийти
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" fullWidth onPress={() => { router.push("/login"); closeMobile(); }}>
                  Увійти
                </Button>
                <Button variant="primary" fullWidth onPress={() => { router.push("/register"); closeMobile(); }}>
                  Реєстрація
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
