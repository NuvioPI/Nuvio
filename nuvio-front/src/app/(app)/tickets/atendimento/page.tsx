"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MoreHorizontal,
  Search,
  UserRound,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { TicketReplyComposer } from "@/components/ticket/TicketReplyComposer";

type TicketResumoAtendimento = {
  idTicket: number;
  idTecnico?: number;
  idUsuario?: number;
  titulo: string;
  descricao?: string;
  nomeUsuario: string;
  emailUsuario?: string | null;
  prioridade: "Alta" | "Media" | "Baixa";
  statusTicket: string;
  dataAbertura: string;
};

type TicketDetalhe = TicketResumoAtendimento & {
  idCategoria?: number;
  idSLA?: number;
  dataFechamento?: string | null;
  nomeTecnico?: string | null;
  nomeCategoria?: string | null;
  nomeSLA?: string | null;
};

type Resposta = {
  idRespostaTicket: number;
  idUsuario: number;
  idTicket: number;
  msgTicket: string;
  dataResposta: string;
  nomeUsuario?: string;
  tipoUsuario?: string;
};

const statusClasses: Record<string, string> = {
  Aberto: "bg-amber-500/10 text-amber-300",
  "Em atendimento": "bg-blue-500/10 text-blue-300",
  Resolvido: "bg-emerald-500/10 text-emerald-300",
  Fechado: "bg-zinc-500/10 text-zinc-400",
};

const prioridadeClasses: Record<string, string> = {
  Alta: "bg-red-500/10 text-red-300",
  Media: "bg-amber-500/10 text-amber-300",
  Baixa: "bg-emerald-500/10 text-emerald-300",
};

export default function AtendimentoPage() {
  const [tickets, setTickets] = useState<TicketResumoAtendimento[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [ticket, setTicket] = useState<TicketDetalhe | null>(null);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [busca, setBusca] = useState("");
  const [carregandoTickets, setCarregandoTickets] = useState(true);
  const [carregandoConversa, setCarregandoConversa] = useState(false);
  const [erro, setErro] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);
  const [ticketDaUrl, setTicketDaUrl] = useState<number | null>(null);

  useEffect(() => {
    const valor = new URLSearchParams(window.location.search).get("ticket");
    const id = Number(valor);
    setTicketDaUrl(Number.isInteger(id) && id > 0 ? id : null);

    apiFetch<{ tickets: TicketResumoAtendimento[] }>("/tickets")
      .then((dados) => setTickets(dados.tickets ?? []))
      .catch((cause) => setErro(cause instanceof Error ? cause.message : "Não foi possível carregar os chamados."))
      .finally(() => setCarregandoTickets(false));
  }, []);

  useEffect(() => {
    if (tickets.length === 0) return;
    const idValido = ticketDaUrl && tickets.some((item) => item.idTicket === ticketDaUrl)
      ? ticketDaUrl
      : tickets[0].idTicket;
    setSelectedId(idValido);
  }, [tickets, ticketDaUrl]);

  useEffect(() => {
    if (!selectedId) return;

    let cancelado = false;
    setCarregandoConversa(true);
    setErro("");

    Promise.all([
      apiFetch<{ ticket: TicketDetalhe }>(`/tickets/${selectedId}`),
      apiFetch<{ respostas: Resposta[] }>(`/respostas?idTicket=${selectedId}`),
    ])
      .then(([detalhe, historico]) => {
        if (cancelado) return;
        setTicket(detalhe.ticket);
        setRespostas(historico.respostas ?? []);
      })
      .catch((cause) => {
        if (!cancelado) setErro(cause instanceof Error ? cause.message : "Não foi possível carregar o atendimento.");
      })
      .finally(() => {
        if (!cancelado) setCarregandoConversa(false);
      });

    return () => {
      cancelado = true;
    };
  }, [selectedId, atualizacao]);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return tickets;
    return tickets.filter((item) =>
      `${item.idTicket} ${item.titulo} ${item.nomeUsuario}`.toLowerCase().includes(termo)
    );
  }, [busca, tickets]);

  const resumoSelecionado = tickets.find((item) => item.idTicket === selectedId);
  const atendimento = ticket ?? resumoSelecionado;

  function selecionarTicket(id: number) {
    setSelectedId(id);
    setTicket(null);
    setRespostas([]);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-sm">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-(--border) px-5">
        <div className="flex items-center gap-3">
          <Link href="/tickets" className="rounded-lg p-1.5 text-(--muted-foreground) transition hover:bg-(--hoverbg) hover:text-(--foreground)" aria-label="Voltar para chamados">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-(--foreground)">Atendimento</h1>
            <p className="text-xs text-(--muted-foreground)">Respostas por e-mail do helpdesk</p>
          </div>
        </div>
        <span className="hidden text-xs text-(--muted-foreground) sm:block">{tickets.length} chamados</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(220px,280px)_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_260px]">
        <aside className="flex min-h-0 flex-col border-r border-(--border) bg-(--card)">
          <div className="border-b border-(--border) p-3">
            <div className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-(--muted-foreground)">
              <Search size={15} />
              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar chamado..."
                className="min-w-0 flex-1 bg-transparent text-sm text-(--foreground) outline-none placeholder:text-(--muted-foreground)"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {carregandoTickets && <p className="p-5 text-sm text-(--muted-foreground)">Carregando chamados...</p>}
            {!carregandoTickets && filtrados.length === 0 && <p className="p-5 text-sm text-(--muted-foreground)">Nenhum chamado encontrado.</p>}
            {filtrados.map((item) => (
              <button
                key={item.idTicket}
                type="button"
                onClick={() => selecionarTicket(item.idTicket)}
                className={`w-full border-b border-(--border)/70 px-4 py-3 text-left transition ${selectedId === item.idTicket ? "border-l-2 border-l-(--primary) bg-(--primary)/8" : "hover:bg-(--hoverbg)"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`truncate text-sm font-semibold ${selectedId === item.idTicket ? "text-(--primary)" : "text-(--foreground)"}`}>
                    #{item.idTicket} · {item.titulo}
                  </span>
                  <span className="shrink-0 text-[10px] text-(--muted-foreground)">{dataCurta(item.dataAbertura)}</span>
                </div>
                <p className="mt-1 truncate text-xs text-(--muted-foreground)">{item.nomeUsuario}</p>
                <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClasses[item.statusTicket] ?? "bg-zinc-500/10 text-zinc-400"}`}>
                  {item.statusTicket}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col bg-(--background)">
          {!atendimento && !carregandoConversa && (
            <div className="grid h-full place-items-center p-8 text-center text-sm text-(--muted-foreground)">
              Selecione um chamado para iniciar o atendimento.
            </div>
          )}

          {atendimento && (
            <>
              <header className="flex shrink-0 items-center justify-between border-b border-(--border) bg-(--card) px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-base font-semibold text-(--foreground)">{atendimento.titulo}</h2>
                    <span className="shrink-0 text-xs text-(--muted-foreground)">#{atendimento.idTicket}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-(--muted-foreground)">
                    <UserRound size={13} />
                    <span>{atendimento.nomeUsuario}</span>
                    <span>·</span>
                    <Mail size={13} />
                    <span className="truncate">{atendimento.emailUsuario || "sem e-mail"}</span>
                  </div>
                </div>
                <button type="button" className="rounded-lg p-2 text-(--muted-foreground) transition hover:bg-(--hoverbg)" aria-label="Mais opções">
                  <MoreHorizontal size={18} />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <div className="mx-auto max-w-3xl space-y-4">
                  <div className="rounded-2xl border border-(--border) bg-(--card) p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-(--primary)/15 text-xs font-bold text-(--primary)">
                          {atendimento.nomeUsuario.slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-(--foreground)">{atendimento.nomeUsuario}</p>
                          <p className="text-[11px] text-(--muted-foreground)">Descrição inicial · {dataFormatada(atendimento.dataAbertura)}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-(--muted-foreground)">Chamado</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-(--foreground)">{atendimento.descricao || "Sem descrição registrada."}</p>
                  </div>

                  {respostas.map((resposta) => {
                    const cliente = resposta.idUsuario === atendimento.idUsuario || resposta.tipoUsuario === "Cliente";
                    return (
                      <div key={resposta.idRespostaTicket} className={`flex ${cliente ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[min(88%,620px)] rounded-2xl border px-4 py-3 ${cliente ? "border-(--border) bg-(--card)" : "border-(--primary)/20 bg-(--primary)/10"}`}>
                          <div className="mb-1 flex items-center justify-between gap-5">
                            <p className={`text-xs font-semibold ${cliente ? "text-(--foreground)" : "text-(--primary)"}`}>
                              {resposta.nomeUsuario || (cliente ? atendimento.nomeUsuario : "Atendente")}
                            </p>
                            <span className="text-[10px] text-(--muted-foreground)">{dataFormatada(resposta.dataResposta)}</span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-6 text-(--foreground)">{resposta.msgTicket}</p>
                        </div>
                      </div>
                    );
                  })}

                  {carregandoConversa && <p className="text-center text-xs text-(--muted-foreground)">Atualizando conversa...</p>}
                </div>
              </div>

              <TicketReplyComposer
                key={atendimento.idTicket}
                ticket={atendimento}
                onSent={() => setAtualizacao((valor) => valor + 1)}
              />
            </>
          )}
        </section>

        <aside className="hidden min-h-0 overflow-y-auto border-l border-(--border) bg-(--card) p-5 xl:block">
          {atendimento && <TicketDetails ticket={atendimento} />}
        </aside>
      </div>

      {erro && <div className="border-t border-red-500/20 bg-red-500/5 px-5 py-2 text-xs text-red-300">{erro}</div>}
    </div>
  );
}

function TicketDetails({ ticket }: { ticket: TicketDetalhe }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">Detalhes do chamado</p>
        <div className="mt-3 space-y-3">
          <Detail label="Status">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[ticket.statusTicket] ?? "bg-zinc-500/10 text-zinc-400"}`}>{ticket.statusTicket}</span>
          </Detail>
          <Detail label="Prioridade">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${prioridadeClasses[ticket.prioridade] ?? "bg-zinc-500/10 text-zinc-400"}`}>{ticket.prioridade}</span>
          </Detail>
        </div>
      </div>

      <div className="border-t border-(--border) pt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">Solicitante</p>
        <div className="mt-3 flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-(--primary)/15 text-sm font-bold text-(--primary)">
            {ticket.nomeUsuario.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-(--foreground)">{ticket.nomeUsuario}</p>
            <p className="break-all text-xs text-(--muted-foreground)">{ticket.emailUsuario || "Sem e-mail"}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-(--border) pt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">Classificação</p>
        <div className="mt-3 space-y-3">
          <Detail label="Categoria" value={ticket.nomeCategoria || "Não informado"} />
          <Detail label="SLA" value={ticket.nomeSLA || "Não informado"} />
          <Detail label="Aberto em" value={dataFormatada(ticket.dataAbertura)} />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-(--muted-foreground)">{label}</span>
      {children ?? <span className="text-right text-(--foreground)">{value}</span>}
    </div>
  );
}

function dataCurta(data: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(data));
}

function dataFormatada(data: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(data));
}
