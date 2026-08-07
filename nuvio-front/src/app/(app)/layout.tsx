"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Header } from "@/components/header/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const sidebarWidth = collapsed ? "w-16" : "w-64";

  return (
    <div className="h-screen overflow-hidden bg-(--background) flex">

      {/* OVERLAY MOBILE */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:relative left-0 top-0 h-screen z-50
          transition-all duration-300 ease-in-out
          ${sidebarWidth}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          onMobileClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">

        {/* HEADER */}
        <header className="h-16 shrink-0 z-30">
          <Header onMobileMenuClick={() => setMobileOpen(true)} />
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
