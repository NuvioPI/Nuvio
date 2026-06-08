// src/app/admin/layout.tsx
"use client";

import { Playfair_Display, DM_Sans } from "next/font/google";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["italic"] });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500"] });

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-7 h-7 rounded-lg border border-(--border)" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Alternar tema"
      className="w-7 h-7 rounded-lg border border-(--border) flex items-center justify-center text-(--muted-foreground) hover:bg-(--muted) transition-colors cursor-pointer"
    >
      {isDark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${dmSans.className} min-h-screen bg-(--background)`}>

      <header className="fixed top-0 left-0 right-0 z-50 bg-(--admin-card) border-b border-(--border) h-[52px] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`${playfair.className} text-[18px] text-(--foreground)`}>Nuvio</span>
          <div className="w-px h-[18px] bg-(--border)" />
          <span className="text-[12px] text-(--muted-foreground)">Painel Admin</span>
        </div>
        <div className="flex items-center gap-2">

          <ThemeToggle />

          <button
            className="relative w-7 h-7 rounded-lg border border-(--border) flex items-center justify-center text-(--muted-foreground) hover:bg-(--muted) transition-colors"
            aria-label="Notificações"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#e5484d]" />
          </button>

          <div className="w-7 h-7 rounded-full bg-[#eaf3de] flex items-center justify-center text-[11px] font-medium text-[#3b6d11]">
            AD
          </div>

        </div>
      </header>

      <div className="pt-[52px]">{children}</div>

    </div>
  );
}