type Prioridade = "Alta" | "Média" | "Baixa";
type Status = "Aberto" | "Em atendimento" | "Aguardando";

type Ticket = {
  id: string;
  titulo: string;
  solicitante: string;
  avatar: string;
  prioridade: Prioridade;
  status: Status;
  atualizado: string;
};

const tickets: Ticket[] = [
  {
    id: "#2458",
    titulo: "Erro no login",
    solicitante: "Gabriel",
    avatar: "https://i.pravatar.cc/40?img=1",
    prioridade: "Alta",
    status: "Em atendimento",
    atualizado: "10 min",
  },
  {
    id: "#2459",
    titulo: "VPN offline",
    solicitante: "Lucas",
    avatar: "https://i.pravatar.cc/40?img=2",
    prioridade: "Média",
    status: "Aberto",
    atualizado: "25 min",
  },
  {
    id: "#2460",
    titulo: "Falha no Outlook",
    solicitante: "Ana",
    avatar: "https://i.pravatar.cc/40?img=1",
    prioridade: "Baixa",
    status: "Aguardando",
    atualizado: "1 h",
  },
];

const prioridadeColors = {
  Alta: "bg-[var(--priority-high-bg)] text-[var(--priority-high-text)]",
  Média: "bg-[var(--priority-medium-bg)] text-[var(--priority-medium-text)]",
  Baixa: "bg-[var(--priority-low-bg)] text-[var(--priority-low-text)]",
};

const statusColors = {
  Aberto: "bg-[var(--status-open-bg)] text-[var(--status-open-text)]",
  "Em atendimento": "bg-[var(--status-progress-bg)] text-[var(--status-progress-text)]",
  Aguardando: "bg-[var(--status-waiting-bg)] text-[var(--status-waiting-text)]",
  Finalizado: "bg-[var(--status-closed-bg)] text-[var(--status-closed-text)]",
};

export default function Table() {
  return (
    <div className="bg-(--card) border border-(--card-border) rounded-(--radius) p-4 md:p-6 mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-(--foreground) font-semibold">Chamados recentes</h2>
        <button className="text-(--primary) mr-4 hover:underline text-sm">Ver todos</button>
      </div>

      {/* TABELA — scroll horizontal no mobile */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <table className="w-full min-w-[560px] px-4 md:px-0">
          <thead className="text-zinc-500">
            <tr>
              <th className="text-left pb-4 font-medium pl-4 md:pl-0">ID</th>
              <th className="text-left pb-4 font-medium">Título</th>
              <th className="text-left pb-4 font-medium">Solicitante</th>
              <th className="text-left pb-4 font-medium">Prioridade</th>
              <th className="text-left pb-4 font-medium">Status</th>
              <th className="text-left pb-4 font-medium pr-4 md:pr-0">Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, index) => (
              <tr
                key={index}
                className="cursor-pointer hover:bg-black/5 border-b border-(--card-border) transition-colors"
              >
                <td className="py-4 text-(--foreground) pl-4 md:pl-0">{ticket.id}</td>
                <td className="py-4 text-(--foreground)">{ticket.titulo}</td>
                <td className="py-4">
                  <div className="flex gap-2 items-center text-(--foreground) hover:text-(--primary) transition-all hover:underline cursor-pointer">
                    <img
                      src={ticket.avatar}
                      alt={ticket.solicitante}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    {ticket.solicitante}
                  </div>
                </td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${prioridadeColors[ticket.prioridade]}`}>
                    {ticket.prioridade}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${statusColors[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="py-4 text-zinc-500 pr-4 md:pr-0">{ticket.atualizado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}