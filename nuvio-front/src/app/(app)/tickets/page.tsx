"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock3, FileText, Search, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
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
    <div className="bg-(--card) border border-(--border) rounded-[28px] overflow-hidden shadow-(--shadow)"><div className="p-6 border-b border-(--border)"><h2 className="text-xl font-semibold">Chamados</h2></div>
      <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-(--border)">
        <th className="p-5 text-left">ID</th><th className="p-5 text-left">Título</th><th className="p-5 text-left">Solicitante</th><th className="p-5 text-left">Prioridade</th><th className="p-5 text-left">Status</th><th className="p-5 text-left">Aberto em</th>
      </tr></thead><tbody>
        {carregando && <tr><td colSpan={6} className="p-8 text-center text-(--muted-foreground)">Carregando chamados...</td></tr>}
        {!carregando && !erro && filtrados.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-(--muted-foreground)">Nenhum chamado encontrado.</td></tr>}
        {filtrados.map((ticket) => <tr key={ticket.idTicket} className="border-b border-(--border) hover:bg-(--muted)">
          <td className="p-5"><Link href={`/tickets/atendimento?ticket=${ticket.idTicket}`} className="text-(--primary) hover:underline">#{ticket.idTicket}</Link></td><td className="p-5 font-medium"><Link href={`/tickets/atendimento?ticket=${ticket.idTicket}`} className="inline-flex max-w-full items-center gap-2 hover:text-(--primary)"><span className="truncate">{ticket.titulo}</span><NewTicketBadge dataAbertura={ticket.dataAbertura} /></Link></td><td className="p-5"><NuvioName name={ticket.nomeUsuario} tipo={ticket.tipoUsuario} /></td>
          <td className="p-5"><Badge>{ticket.prioridade}</Badge></td><td className="p-5"><Badge>{ticket.statusTicket}</Badge></td>
          <td className="p-5 text-(--muted-foreground)"><div className="flex items-center justify-between gap-3"><span>{formatarDataBackend(ticket.dataAbertura)}</span>{podeExcluir && <button type="button" onClick={() => excluirTicket(ticket)} disabled={removendoId === ticket.idTicket} aria-label={`Excluir ticket #${ticket.idTicket}`} title="Excluir ticket" className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={17} /></button>}</div></td>
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
  return <span className="inline-flex rounded-full bg-(--muted) px-3 py-1 text-sm">{children}</span>;
}
