"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import DashboardSidebar from "@/components/layout/DashboardSidebar/DashboardSidebar";
import styles from "./layout.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <button
        className={styles.menuButton}
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? "Закрити меню" : "Відкрити меню"}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.visible : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}>
        <DashboardSidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
