import Link from "next/link";
import Image from "next/image";
import { API_URL } from "@/lib/api";
import { VerifiedName } from "@/components/ui/VerifiedBadge";

export type TicketResumo = {
  idTicket: number;
  titulo: string;
  nomeUsuario: string;
  fotoPerfil?: string | null;
  verificado?: boolean | number | string | null;
  prioridade: "Alta" | "Media" | "Baixa";
  statusTicket: string;
  dataAbertura: string;
};

const prioridadeClasses: Record<TicketResumo["prioridade"], string> = {
  Alta: "bg-[var(--priority-high-bg)] text-[var(--priority-high-text)]",
  Media: "bg-[var(--priority-medium-bg)] text-[var(--priority-medium-text)]",
  Baixa: "bg-[var(--priority-low-bg)] text-[var(--priority-low-text)]",
};

const statusClasses: Record<string, string> = {
  Aberto: "bg-[var(--status-open-bg)] text-[var(--status-open-text)]",
  "Em atendimento": "bg-[var(--status-progress-bg)] text-[var(--status-progress-text)]",
  Resolvido: "bg-[var(--status-closed-bg)] text-[var(--status-closed-text)]",
  Fechado: "bg-[var(--status-closed-bg)] text-[var(--status-closed-text)]",
};

function dataFormatada(data: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(data));
}

function resolverFoto(foto?: string | null): string | null {
  if (!foto) return null;
  if (foto.startsWith("data:") || foto.startsWith("http")) return foto;
  return `${API_URL}${foto.startsWith("/") ? "" : "/"}${foto}`;
}

function AvatarUsuario({ nome, foto }: { nome: string; foto?: string | null }) {
  const src = resolverFoto(foto);
  if (src) {
    if (src.startsWith("data:")) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={nome} className="h-6 w-6 rounded-full object-cover flex-shrink-0" />
      );
    }
    return (
      <Image src={src} alt={nome} width={24} height={24} className="rounded-full object-cover flex-shrink-0" />
    );
  }
  return (
    <span className="grid h-6 w-6 place-items-center rounded-full bg-(--primary) text-xs text-white flex-shrink-0">
      {nome?.slice(0, 1).toUpperCase()}
    </span>
  );
}

export default function Table({ tickets, carregando }: { tickets: TicketResumo[]; carregando: boolean }) {
  return (
    <div className="bg-(--card) border border-(--card-border) rounded-(--radius) p-4 md:p-6 mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-(--foreground) font-semibold">Chamados recentes</h2>
        <Link href="/tickets" className="text-(--primary) mr-4 hover:underline text-sm">Ver todos</Link>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <table className="w-full min-w-[560px] px-4 md:px-0">
          <thead className="text-zinc-500"><tr>
            <th className="text-left pb-4 font-medium pl-4 md:pl-0">ID</th>
            <th className="text-left pb-4 font-medium">Título</th>
            <th className="text-left pb-4 font-medium">Solicitante</th>
            <th className="text-left pb-4 font-medium">Prioridade</th>
            <th className="text-left pb-4 font-medium">Status</th>
            <th className="text-left pb-4 font-medium pr-4 md:pr-0">Atualizado</th>
          </tr></thead>
          <tbody>
            {carregando && <tr><td colSpan={6} className="py-8 text-center text-zinc-500">Carregando chamados...</td></tr>}
            {!carregando && tickets.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-zinc-500">Nenhum chamado encontrado.</td></tr>}
            {tickets.map((ticket) => (
              <tr key={ticket.idTicket} className="hover:bg-black/5 border-b border-(--card-border) transition-colors">
                <td className="py-4 text-(--foreground) pl-4 md:pl-0">#{ticket.idTicket}</td>
                <td className="py-4 text-(--foreground)">{ticket.titulo}</td>
                <td className="py-4">
                  <div className="flex gap-2 items-center text-(--foreground)">
                    <AvatarUsuario nome={ticket.nomeUsuario} foto={ticket.fotoPerfil} />
                    <VerifiedName name={ticket.nomeUsuario} verified={ticket.verificado} />
                  </div>
                </td>
                <td className="py-4"><span className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${prioridadeClasses[ticket.prioridade] ?? "bg-zinc-100 text-zinc-700"}`}>{ticket.prioridade}</span></td>
                <td className="py-4"><span className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${statusClasses[ticket.statusTicket] ?? "bg-zinc-100 text-zinc-700"}`}>{ticket.statusTicket}</span></td>
                <td className="py-4 text-zinc-500 pr-4 md:pr-0">{dataFormatada(ticket.dataAbertura)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
