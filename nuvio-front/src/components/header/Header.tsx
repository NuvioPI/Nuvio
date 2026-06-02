import { SearchBar } from "@/components/header/ui/searchBar";
import { Profile } from "@/components/header/ui/profile";
import { Notifications } from "@/components/header/ui/notifications";
import { Toggle } from "@/components/header/ui/toggle";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMobileMenuClick: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  return (
    <header className="
      px-4 md:px-10
      bg-(--sidebar)
      flex items-center p-3 md:p-5 gap-3 md:gap-5 justify-between
      border-b border-(--sidebar-border)
      h-20
    ">
      {/* BOTÃO HAMBURGUER — só mobile */}
      <button
        onClick={onMobileMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-(--hoverbg) transition shrink-0"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5 text-(--sidebar-foreground)" />
      </button>

      {/* NOTIFICAÇÕES — some no mobile */}
      <div className="hidden sm:block">
        <Notifications />
      </div>

      {/* LADO DIREITO */}
      <div className="flex items-center gap-3 md:gap-5 ml-auto">
        <div className="flex items-center gap-3 md:gap-6">
          <Toggle />
          {/* Search só aparece em telas maiores */}
          <div className="hidden md:block">
            <SearchBar />
          </div>
        </div>
        <Profile />
      </div>
    </header>
  );
}