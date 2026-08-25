"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { LockKeyhole, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { NuvioLogo } from "@/components/ui/NuvioLogo";

type PortalHeaderProps = {
  usuarioNome?: string;
  onLogout?: () => void;
  showHomeLink?: boolean;
};

const semInscricao = () => () => {};
const sempreMontado = () => true;
const sempreDesmontado = () => false;

export function PortalHeader({ usuarioNome, onLogout, showHomeLink = false }: PortalHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(semInscricao, sempreMontado, sempreDesmontado);

  const escuro = mounted && resolvedTheme === "dark";

  return (
    <header className="flex items-center justify-between border-b border-(--border) pb-5">
      <Link href="/portal" className="flex items-center gap-3 text-(--primary)" aria-label="Nuvio atendimento">
        <NuvioLogo size={42} className="h-10 w-12" />
        <span className="text-xl font-bold tracking-[-0.04em]">nuvio</span>
      </Link>

      <div className="flex items-center gap-2 text-sm text-(--muted-foreground) sm:gap-3">
        {usuarioNome && <span className="hidden max-w-44 truncate text-right font-medium sm:block">{usuarioNome}</span>}
        {showHomeLink && <span className="hidden items-center gap-2 rounded-full border border-(--border) bg-(--card)/70 px-3 py-2 sm:inline-flex"><LockKeyhole size={15} className="text-(--primary)" /> Ambiente seguro</span>}
        <button
          type="button"
          onClick={() => setTheme(escuro ? "light" : "dark")}
          aria-label={escuro ? "Ativar tema claro" : "Ativar tema escuro"}
          title={escuro ? "Tema claro" : "Tema escuro"}
          className="grid h-10 w-10 place-items-center rounded-xl border border-(--border) text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
        >
          {!mounted ? <span className="h-4 w-4" /> : escuro ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        {showHomeLink && <Link href="/" className="hidden rounded-xl px-3 py-2 font-medium transition hover:bg-(--muted) sm:inline-flex">Site principal</Link>}
        {onLogout && <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-3 py-2 font-medium transition hover:bg-(--muted) hover:text-(--foreground)"><LogOut size={16} /><span className="hidden sm:inline">Sair</span></button>}
      </div>
    </header>
  );
}
