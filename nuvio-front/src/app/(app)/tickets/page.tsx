"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock3, FileText, Search, Trash2 } from "lucide-react";
import { API_URL, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { TicketResumo } from "@/components/dashboard/ui/table";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { NuvioName } from "@/components/ui/NuvioBadge";
import { NewTicketBadge } from "@/components/ui/NewTicketBadge";
import { formatarDataBackend } from "@/lib/date-utils";

export default function HistoricoChamadosPage() {
  const { usuario } = useAuth();
  const [tickets, setTickets] = useState<TicketResumo[]>([]);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("Todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [removendoId, setRemovendoId] = useState<number | null>(null);
  const [ticketParaExcluir, setTicketParaExcluir] = useState<TicketResumo | null>(null);

  const tipoUsuario = typeof usuario?.tipo === "object" && usuario.tipo !== null
    ? usuario.tipo.nome
    : usuario?.tipo;
  const podeExcluir = tipoUsuario === "Administrador" || tipoUsuario === "Técnico";

  useEffect(() => {
    apiFetch<{ tickets: TicketResumo[] }>("/tickets")
      .then((dados) => setTickets(dados.tickets))
      .catch((causa) => setErro(causa instanceof Error ? causa.message : "Não foi possível carregar os chamados."))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = useMemo(() => tickets.filter((ticket) => {
    const texto = `${ticket.titulo} ${ticket.nomeUsuario} #${ticket.idTicket}`.toLowerCase();
    return texto.includes(busca.toLowerCase()) && (status === "Todos" || ticket.statusTicket === status);
  }), [tickets, busca, status]);

  const total = (valor: string) => tickets.filter((ticket) => ticket.statusTicket === valor).length;

  function excluirTicket(ticket: TicketResumo) {
    setTicketParaExcluir(ticket);
    setErro("");
    setMensagem("");
  }

  async function confirmarExclusaoTicket() {
    if (!ticketParaExcluir) return;

    const ticket = ticketParaExcluir;

    setErro("");
    setMensagem("");
    setRemovendoId(ticket.idTicket);

    try {
      await apiFetch(`/tickets/${ticket.idTicket}`, { method: "DELETE" });
      setTickets((atuais) => atuais.filter((item) => item.idTicket !== ticket.idTicket));
      setMensagem(`Ticket #${ticket.idTicket} removido com sucesso.`);
      setTicketParaExcluir(null);
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Não foi possível remover o ticket.");
    } finally {
      setRemovendoId(null);
    }
  }

  return <main className="flex-1 p-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard title="Total" value={tickets.length} icon={<FileText size={22} />} />
      <MetricCard title="Abertos" value={total("Aberto")} icon={<AlertCircle size={22} />} />
      <MetricCard title="Em atendimento" value={total("Em atendimento")} icon={<Clock3 size={22} />} />
      <MetricCard title="Resolvidos" value={total("Resolvido")} icon={<CheckCircle2 size={22} />} />
    </div>
    <div className="bg-(--card) border border-(--border) rounded-[28px] p-6 mb-6 shadow-(--shadow)"><div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 relative"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
        <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar chamado..." className="w-full pl-12 py-4 rounded-xl border border-(--border) bg-(--background) outline-none" />
      </div>
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="px-5 py-4 min-w-[200px] rounded-xl border border-(--border) bg-(--background)">
        <option value="Todos">Todos os status</option><option>Aberto</option><option>Em atendimento</option><option>Resolvido</option><option>Fechado</option>
      </select>
    </div></div>
    {mensagem && <div role="status" className="mb-5 rounded-xl border border-green-500/25 bg-green-500/10 p-4 text-sm text-green-600">{mensagem}</div>}
    {erro && !carregando && <div role="alert" className="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-600">{erro}</div>}
    <div className="bg-(--card) border border-(--border) rounded-[28px] overflow-hidden shadow-(--shadow)"><div className="flex items-center justify-between gap-4 border-b border-(--border) p-6"><div><h2 className="text-xl font-semibold">Chamados</h2><p className="mt-1 text-sm text-(--muted-foreground)">{filtrados.length} {filtrados.length === 1 ? "registro encontrado" : "registros encontrados"}</p></div><span className="hidden rounded-full bg-(--muted) px-3 py-1.5 text-xs font-medium text-(--muted-foreground) sm:inline-flex">Mais recentes primeiro</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] table-fixed"><thead className="bg-(--background)/35"><tr className="border-b border-(--border)">
        <th className="w-[88px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-(--muted-foreground)">ID</th><th className="w-[29%] px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-(--muted-foreground)">Título</th><th className="w-[24%] px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-(--muted-foreground)">Solicitante</th><th className="w-[130px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-(--muted-foreground)">Prioridade</th><th className="w-[170px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-(--muted-foreground)">Status</th><th className="w-[175px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-(--muted-foreground)">Aberto em</th><th className="w-[72px] px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.08em] text-(--muted-foreground)">Ações</th>
      </tr></thead><tbody>
        {carregando && <tr><td colSpan={7} className="p-8 text-center text-(--muted-foreground)">Carregando chamados...</td></tr>}
        {!carregando && !erro && filtrados.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-(--muted-foreground)">Nenhum chamado encontrado.</td></tr>}
        {filtrados.map((ticket) => <tr key={ticket.idTicket} className="group border-b border-(--border) transition-colors last:border-0 hover:bg-(--muted)/45">
          <td className="px-6 py-4 align-middle"><Link href={`/tickets/atendimento?ticket=${ticket.idTicket}`} className="inline-flex rounded-lg bg-(--primary)/10 px-2.5 py-1 text-sm font-semibold text-(--primary) transition hover:bg-(--primary)/15">#{ticket.idTicket}</Link></td>
          <td className="px-6 py-4 align-middle"><Link href={`/tickets/atendimento?ticket=${ticket.idTicket}`} className="flex min-w-0 items-center gap-2 font-medium transition hover:text-(--primary)"><span className="min-w-0 truncate">{ticket.titulo}</span><NewTicketBadge dataAbertura={ticket.dataAbertura} /></Link></td>
          <td className="px-6 py-4 align-middle"><Link href={`/tickets/atendimento?ticket=${ticket.idTicket}`} className="flex min-w-0 items-center gap-3"><AvatarSolicitante nome={ticket.nomeUsuario} foto={ticket.fotoPerfil} /><span className="min-w-0"><span className="block truncate text-sm font-medium"><NuvioName name={ticket.nomeUsuario} tipo={ticket.tipoUsuario} className="max-w-full" /></span>{ticket.emailUsuario && <span className="mt-0.5 block truncate text-xs text-(--muted-foreground)">{ticket.emailUsuario}</span>}</span></Link></td>
          <td className="px-6 py-4 align-middle"><Badge>{ticket.prioridade}</Badge></td><td className="px-6 py-4 align-middle"><Badge>{ticket.statusTicket}</Badge></td>
          <td className="px-6 py-4 align-middle text-sm text-(--muted-foreground)">{formatarDataBackend(ticket.dataAbertura)}</td>
          <td className="px-6 py-4 text-right align-middle">{podeExcluir && <button type="button" onClick={() => excluirTicket(ticket)} disabled={removendoId === ticket.idTicket} aria-label={`Excluir ticket #${ticket.idTicket}`} title="Excluir ticket" className="rounded-lg p-2 text-red-500 opacity-70 transition hover:bg-red-500/10 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={17} /></button>}</td>
        </tr>)}
      </tbody></table></div>
    </div>
    <ConfirmModal
      open={ticketParaExcluir !== null}
      title="Excluir ticket"
      message={ticketParaExcluir ? `A exclusão será permanente e removerá respostas, anexos, avaliações e histórico do ticket #${ticketParaExcluir.idTicket}.` : ""}
      loading={removendoId !== null}
      onCancel={() => { if (removendoId === null) setTicketParaExcluir(null); }}
      onConfirm={() => void confirmarExclusaoTicket()}
    />
  </main>;
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return <div className="bg-(--card) border border-(--border) rounded-[28px] px-6 py-7 shadow-(--shadow)"><div className="flex items-center justify-between"><div><p className="text-sm text-(--muted-foreground)">{title}</p><h3 className="mt-2 text-4xl font-bold">{value}</h3></div><div className="h-14 w-14 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center">{icon}</div></div></div>;
}

function Badge({ children }: { children: string }) {
  const classes = children === "Alta"
    ? "bg-red-500/10 text-red-400"
    : children === "Media"
      ? "bg-amber-500/10 text-amber-300"
      : children === "Baixa"
        ? "bg-sky-500/10 text-sky-300"
        : children === "Aberto"
          ? "bg-emerald-500/10 text-emerald-400"
          : children === "Em atendimento"
            ? "bg-amber-500/10 text-amber-300"
            : "bg-(--muted) text-(--muted-foreground)";

  return <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${classes}`}>{children}</span>;
}

function resolverFoto(foto?: string | null) {
  if (!foto) return null;
  if (foto.startsWith("data:") || foto.startsWith("http")) return foto;
  return `${API_URL}${foto.startsWith("/") ? "" : "/"}${foto}`;
}

function iniciais(nome: string) {
  return nome.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]?.toUpperCase()).join("") || "?";
}

function AvatarSolicitante({ nome, foto }: { nome: string; foto?: string | null }) {
  const [imagemComErro, setImagemComErro] = useState(false);
  const src = resolverFoto(foto);

  if (!src || imagemComErro) {
    return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-(--primary)/15 text-xs font-bold text-(--primary) ring-1 ring-(--primary)/20">{iniciais(nome)}</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={`Foto de ${nome}`} onError={() => setImagemComErro(true)} className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-(--border)" />
  );
}
