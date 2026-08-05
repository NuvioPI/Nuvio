import { TicketResumo } from "./table";

export default function Recents({ tickets }: { tickets: TicketResumo[] }) {
  return (
    <div className="p-6 bg-(--card) border border-(--card-border) rounded-lg mt-10">
      <h2 className="text-2xl font-semibold text-(--card-foreground) mb-4">Atividades recentes</h2>
      <ul className="space-y-4">
        {tickets.slice(0, 4).map((ticket) => (
          <li key={ticket.idTicket} className="flex items-center gap-4">
            <div className="w-1 h-8 bg-(--primary) rounded-full" />
            <div><p className="text-(--foreground) font-medium"><strong>{ticket.nomeUsuario}</strong> abriu o chamado #{ticket.idTicket}</p>
              <p className="text-sm text-zinc-500">{ticket.titulo}</p></div>
          </li>
        ))}
        {tickets.length === 0 && <li className="text-sm text-zinc-500">Nenhuma atividade recente.</li>}
      </ul>
    </div>
  );
}
