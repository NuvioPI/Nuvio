"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { NuvioName } from "@/components/ui/NuvioBadge";
import { NewTicketBadge } from "@/components/ui/NewTicketBadge";

type Ticket = {
  idTicket: number;
  titulo: string;
  nomeUsuario?: string | null;
  tipoUsuario?: string | null;
  statusTicket: string;
  prioridade: string;
  dataAbertura: string;
};

const statusStyles: Record<string, { dot: string; background: string; color: string }> = {
  Aberto: { dot: "#378add", background: "#e6f1fb", color: "#185fa5" },
  "Em atendimento": { dot: "#2fae5a", background: "#eaf3de", color: "#3b6d11" },
  Resolvido: { dot: "#888780", background: "#f1efe8", color: "#5f5e5a" },
  Fechado: { dot: "#888780", background: "#f1efe8", color: "#5f5e5a" },
};

function dataFormatada(data: string) {
  const valor = data.replace("T", " ");
  return valor.length > 16 ? valor.slice(0, 16) : valor || "data desconhecida";
}

export default function RecentTicketsPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    apiFetch<{ tickets: Ticket[] }>("/tickets")
      .then((dados) => {
        if (ativo) setTickets(dados.tickets.slice(0, 5));
      })
      .catch((causa) => {
        if (ativo) setErro(causa instanceof Error ? causa.message : "Não foi possível carregar os tickets.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className="bg-(--admin-card) border border-(--border) rounded-xl p-4">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium text-(--muted-foreground) uppercase tracking-[.6px]">
          Tickets recentes
        </span>
        <Link href="/tickets" className="text-[11px] text-(--primary) hover:underline">
          Ver todos
        </Link>
      </div>

      {carregando ? (
        <p className="py-5 text-center text-xs text-(--muted-foreground)">Carregando tickets...</p>
      ) : erro ? (
        <p className="py-5 text-center text-xs text-red-600">{erro}</p>
      ) : tickets.length === 0 ? (
        <p className="py-5 text-center text-xs text-(--muted-foreground)">Nenhum ticket cadastrado.</p>
      ) : (
        <div className="flex flex-col divide-y divide-(--border)">
          {tickets.map((ticket) => {
            const estilo = statusStyles[ticket.statusTicket] ?? {
              dot: "#888780",
              background: "#f1efe8",
              color: "#5f5e5a",
            };

            return (
              <Link
                key={ticket.idTicket}
                href={`/tickets/atendimento?ticket=${ticket.idTicket}`}
                className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0"
              >
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: estilo.dot }} />
                <div className="min-w-0 flex-1">
                  <p className="flex min-w-0 items-center gap-2 text-[12px] text-(--foreground)">
                    <span className="truncate">#{ticket.idTicket} · {ticket.titulo}</span>
                    <NewTicketBadge dataAbertura={ticket.dataAbertura} />
                  </p>
                  <p className="text-[11px] text-(--muted-foreground)">
                    {ticket.nomeUsuario ? <NuvioName name={ticket.nomeUsuario} tipo={ticket.tipoUsuario} /> : "Usuário não informado"} · {dataFormatada(ticket.dataAbertura)}
                  </p>
                </div>
                <span
                  className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: estilo.background, color: estilo.color }}
                >
                  {ticket.statusTicket}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
