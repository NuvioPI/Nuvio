"use client";

import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { PanelLeftClose } from "@/components/animate-ui/icons/panel-left-close";
import { PanelLeftOpen } from "@/components/animate-ui/icons/panel-left-open";
import { Layers } from "@/components/animate-ui/icons/layers";
import { ChartSpline } from "@/components/animate-ui/icons/chart-spline";
import { MessageSquareText } from "@/components/animate-ui/icons/message-square-text";
import { Plus } from "@/components/animate-ui/icons/plus";
import { UsersRound } from "@/components/animate-ui/icons/users-round";
import { LayoutDashboard } from "@/components/animate-ui/icons/layout-dashboard";
import { Settings } from "@/components/animate-ui/icons/settings";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: MessageSquareText, label: "Chamados" },
  { icon: Plus, label: "Novo Chamado" },
  { icon: Layers, label: "Base de Conhecimento" },
  { icon: UsersRound, label: "Usuários" },
  { icon: ChartSpline, label: "Relatórios" },
  { icon: Settings, label: "Configurações" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, onMobileClose }: SidebarProps) {
  return (
    <aside className="w-full bg-(--sidebar) border-r border-(--sidebar-border) flex flex-col h-full">

      {/* LOGO */}
      <div className={`flex items-center gap-3 transition-all duration-300 ${collapsed ? "p-4 mb-10 mt-5 justify-center" : "p-10 justify-center"}`}>
        <svg
          width={collapsed ? "32" : "50"}
          height={collapsed ? "32" : "50"}
          viewBox="0 0 212 166"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-300 shrink-0"
        >
          <path
            d="M125.6 151.8L72 54.2C72 54.2 72.1333 53 72.4 50.6C72.6667 48.2 72.9333 45.4667 73.2 42.4C73.4667 39.2 73.7333 36.4 74 34C74.2667 31.6 74.4 30.4 74.4 30.4C75.4667 25.4667 75.8 21.8667 75.4 19.6C75.1333 17.2 73.8 15.6 71.4 14.8C69.1333 13.8667 65.4 13.3333 60.2 13.2L61.2 9.2C63.3333 9.33333 65.9333 9.46667 69 9.6C72.2 9.73333 75.5333 9.79999 79 9.79999C85.2667 9.79999 90.6667 9.6 95.2 9.2L140 96.4C140 96.4 139.733 97.7333 139.2 100.4C138.8 103.067 138.2 106.533 137.4 110.8C136.6 114.933 135.8 119.4 135 124.2C134.2 128.867 133.4 133.333 132.6 137.6C131.8 141.733 131.133 145.133 130.6 147.8C130.2 150.467 130 151.8 130 151.8H125.6ZM187.2 3.39999C183.867 3.39999 180.733 4.46666 177.8 6.6C174.867 8.73333 172.333 11.3333 170.2 14.4C164.067 23.4667 157.8 39.4 151.4 62.2C145 85 137.867 114.867 130 151.8L127.2 146.2C129.2 137.267 131.333 127.667 133.6 117.4C135.867 107 138.267 96.6 140.8 86.2C143.467 75.8 146.133 65.8667 148.8 56.4C151.6 46.9333 154.467 38.4667 157.4 31C160.467 23.4 163.533 17.3333 166.6 12.8C169.133 9.2 172.133 6.2 175.6 3.8C179.067 1.26667 183.267 1.43051e-06 188.2 1.43051e-06C195.267 1.43051e-06 200.933 2.06667 205.2 6.19999C209.467 10.3333 211.6 15.4 211.6 21.4C211.6 27.8 209.4 32.9333 205 36.8C200.733 40.5333 195.467 42.4 189.2 42.4C183.867 42.4 179.533 41.1333 176.2 38.6C173 35.9333 171.4 32.2667 171.4 27.6C171.4 21.6 173.4 16.6 177.4 12.6C181.4 8.46666 186.333 5.93333 192.2 5C191.667 4.46666 190.933 4.06666 190 3.8C189.2 3.53333 188.267 3.39999 187.2 3.39999ZM24.4 162.2C28.1333 162.2 31.4 161.133 34.2 159C37 157 39.4667 154.333 41.6 151C45.4667 144.867 49.3333 135.267 53.2 122.2C57.2 109.133 61.2 93.3333 65.2 74.8C69.3333 56.2667 73.4667 35.9333 77.6 13.8L81 18C78.8667 28.9333 76.6 40.0667 74.2 51.4C71.9333 62.6 69.6 73.6 67.2 84.4C64.8 95.0667 62.3333 105 59.8 114.2C57.2667 123.4 54.7333 131.4 52.2 138.2C49.6667 144.867 47.2 149.8 44.8 153C42.4 156.2 39.5333 159.067 36.2 161.6C33 164.267 28.7333 165.6 23.4 165.6C16.3333 165.6 10.6667 163.533 6.4 159.4C2.13333 155.267 -1.78814e-07 150.2 -1.78814e-07 144.2C-1.78814e-07 137.8 2.2 132.733 6.6 129C11 125.133 16.2667 123.2 22.4 123.2C27.8667 123.2 32.2 124.533 35.4 127.2C38.6 129.733 40.2 133.333 40.2 138C40.2 144 38.2 149 34.2 153C30.2 157 25.2667 159.533 19.4 160.6C19.9333 161.133 20.6 161.533 21.4 161.8C22.3333 162.067 23.3333 162.2 24.4 162.2ZM169.144 140.4C169.144 134.133 171.277 129.067 175.544 125.2C179.81 121.2 185.144 119.2 191.544 119.2C196.61 119.2 200.477 120.333 203.144 122.6C205.944 124.867 207.344 128.267 207.344 132.8C207.344 136.4 206.344 139.8 204.344 143C202.344 146.067 199.61 148.6 196.144 150.6C192.81 152.6 189.01 153.6 184.744 153.6C179.677 153.6 175.81 152.467 173.144 150.2C170.477 147.933 169.144 144.667 169.144 140.4Z"
            fill="currentColor"
          />
        </svg>

      </div>

      {/* NAV */}
      <nav className="flex-1 px-2">
        <div className="flex flex-col gap-1">
          {navItems.map(({ icon: Icon, label }) => (
            <AnimateIcon key={label} animateOnHover>
              <a
                href="#"
                title={collapsed ? label : undefined}
                onClick={onMobileClose}
                className={`
                  flex items-center gap-3 p-3
                  text-(--sidebar-foreground)
                  hover:bg-(--hoverbg) hover:text-(--hovertxt)
                  rounded-lg transition-all duration-200
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <Icon className="shrink-0 w-5 h-5" />
                {!collapsed && (
                  <span className="truncate">{label}</span>
                )}
              </a>
            </AnimateIcon>
          ))}
        </div>
      </nav>

      {/* FOOTER */}
      <div className={`p-4 border-t border-white/10 flex items-center transition-all duration-300 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <p className="text-xs text-zinc-500 italic truncate">Em desenvolvimento</p>
        )}
        <AnimateIcon animateOnHover>
          <button
            onClick={onToggle}
            className="p-2 rounded-full cursor-pointer transition-all duration-300 ease-in-out hover:bg-(--hoverbg) active:scale-95 hidden md:block"
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </AnimateIcon>
      </div>
    </aside>
  );
}