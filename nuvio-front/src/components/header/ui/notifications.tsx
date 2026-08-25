"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "@/components/animate-ui/icons/bell";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { apiFetch } from "@/lib/api";

type Notificacao = {
  idNotificacao: number;
  titulo: string;
  mensagem: string;
  tipo?: string | null;
  lida: boolean | number;
  idTicket?: number | null;
  dataCriacao: string;
};

export function Notifications() {
  const [open, setOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ativo = true;

    const atualizar = async () => {
      try {
        const dados = await apiFetch<{ notificacoes?: Notificacao[]; unreadCount?: number }>("/notificacoes");
        if (!ativo) return;
        setNotificacoes(dados.notificacoes ?? []);
        setUnreadCount(Number(dados.unreadCount ?? 0));
      } catch (erro) {
        if (ativo) console.warn("Erro ao buscar notificações", erro);
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    void atualizar();
    const intervalo = window.setInterval(() => void atualizar(), 15000);

    function atualizarAoVoltar() {
      if (document.visibilityState === "visible") void atualizar();
    }

    function fecharAoClicarFora(evento: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(evento.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("visibilitychange", atualizarAoVoltar);
    document.addEventListener("mousedown", fecharAoClicarFora);

    return () => {
      ativo = false;
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", atualizarAoVoltar);
      document.removeEventListener("mousedown", fecharAoClicarFora);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative z-[100]">
      <AnimateIcon animateOnHover>
        <button
          type="button"
          onClick={() => setOpen((atual) => !atual)}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={unreadCount > 0 ? `${unreadCount} novas notificações` : "Notificações"}
          className="relative flex cursor-pointer items-center gap-2 rounded-full bg-(--notification-bg) px-4 py-2 text-(--notification-text) outline-2 outline-offset-2 outline-(--notification-outline) transition-all duration-300 ease-in-out hover:outline-3"
        >
          <Bell className="h-5 w-5" />
          <span>{unreadCount > 0 ? `Você tem ${unreadCount} novas notificações` : "Sem notificações"}</span>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-(--sidebar)">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </AnimateIcon>

      {open && (
        <div className="absolute left-0 top-full z-[110] mt-3 w-[min(92vw,380px)] max-w-[calc(100vw-1rem)] rounded-lg border border-(--card-border) bg-(--card) shadow-lg" role="dialog" aria-label="Notificações">
          <div className="p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-(--foreground)">Notificações</h3>
              {unreadCount > 0 && <span className="text-xs font-medium text-(--primary)">{unreadCount} nova(s)</span>}
            </div>

            {carregando ? (
              <p className="mt-3 text-sm text-(--muted-foreground)">Carregando notificações...</p>
            ) : notificacoes.length === 0 ? (
              <p className="mt-3 text-sm text-(--muted-foreground)">Sem notificações.</p>
            ) : (
              <ul className="mt-2 max-h-80 space-y-1 overflow-y-auto">
                {notificacoes.map((notificacao) => {
                  const conteudo = (
                    <div className={`rounded-lg p-2 transition hover:bg-(--hoverbg) ${!notificacao.lida ? "border-l-2 border-(--primary) bg-(--primary)/5" : ""}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <strong className="block truncate text-sm text-(--foreground)">{notificacao.titulo}</strong>
                          <p className="mt-0.5 text-sm text-(--muted-foreground)">{notificacao.mensagem}</p>
                        </div>
                        <span className="shrink-0 text-[10px] text-(--muted-foreground)">{new Date(notificacao.dataCriacao).toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                  );

                  return (
                    <li key={notificacao.idNotificacao}>
                      {notificacao.idTicket ? (
                        <Link href={`/tickets/atendimento?ticket=${notificacao.idTicket}`} onClick={() => setOpen(false)}>
                          {conteudo}
                        </Link>
                      ) : conteudo}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
