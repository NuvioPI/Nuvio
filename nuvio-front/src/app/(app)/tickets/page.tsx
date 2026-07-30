"use client";
 
import {
  Search,
  Filter,
  Clock3,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
 
export default function HistoricoChamadosPage() {
  return (
<main className="flex-1 p-8">
 
 
      {/* CARDS */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
<MetricCard
          title="Total"
          value="1.248"
          icon={<FileText size={22} />}
        />
 
        <MetricCard
          title="Abertos"
          value="342"
          icon={<AlertCircle size={22} />}
        />
 
        <MetricCard
          title="Em atendimento"
          value="189"
          icon={<Clock3 size={22} />}
        />
 
        <MetricCard
          title="Resolvidos"
          value="717"
          icon={<CheckCircle2 size={22} />}
        />
</div>
 
      {/* FILTROS */}
        <div className="bg-(--card) border border-(--border) rounded-[28px] p-6 mb-6 shadow-(--shadow)">
<div className="flex flex-col lg:flex-row gap-4">
<div className="flex-1 relative">
<Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
              />
 
              <input
                placeholder="Buscar chamado..."
                className="w-full pl-12 py-4 rounded-xl border border-(--border) bg-(--background) focus:border-(--ring) outline-none transition-colors"
              />
</div>
 
          <select className="px-5 py-4 min-w-[200px] rounded-xl border border-(--border) bg-(--background) focus:border-(--ring) outline-none cursor-pointer text-sm">
            <option>Todos os status</option>
<option>Aberto</option>
<option>Em atendimento</option>
            <option>Aguardando</option>
<option>Resolvido</option>
<option>Fechado</option>
            <option>Cancelado</option>
</select>
 
          <select className="px-5 py-4 min-w-[200px] rounded-xl border border-(--border) bg-(--background) focus:border-(--ring) outline-none cursor-pointer text-sm">
            <option>Todas as prioridades</option>
            <option>Alta</option>
            <option>Média</option>
            <option>Baixa</option>
          </select>

          <button className="px-5 py-4 flex items-center gap-2 rounded-xl border border-(--border) bg-(--background) hover:bg-(--muted) transition-colors cursor-pointer text-sm font-medium">
<Filter size={18} />
            Mais filtros
</button>
</div>
</div>
 
      {/* GRID */}
<div className="grid xl:grid-cols-[1fr_340px] gap-6">
        {/* TABELA */}
        <div className="bg-(--card) border border-(--border) rounded-[28px] overflow-hidden shadow-(--shadow)">
          <div className="p-6 border-b border-(--border)">
<h2 className="text-xl font-semibold">
              Chamados recentes
</h2>
</div>
 
          <table className="w-full">
<thead>
                <tr className="border-b border-(--border)">
<th className="p-5 text-left">ID</th>
<th className="p-5 text-left">Título</th>
<th className="p-5 text-left">Solicitante</th>
<th className="p-5 text-left">Empresa</th>
<th className="p-5 text-left">Prioridade</th>
<th className="p-5 text-left">Status</th>
<th className="p-5 text-left">Atualizado</th>
</tr>
</thead>
 
            <tbody>
<TicketRow
                id="#2458"
                title="Erro no login"
                requester="Gabriel Morgado"
                requesterAvatar="https://i.pinimg.com/736x/85/1c/bf/851cbfbe1c08e46625ca449f8e8bd71b.jpg"
                company="PierSec"
                companyLogo="https://lh3.googleusercontent.com/a-/ALV-UjUYR5Wyv52kiSY5Urz0ZHYbxjpnAyK306ZqU29PKWBps-8FzP8"
                priority="Alta"
                status="Em atendimento"
                updated="10 min"
              />
 
              <TicketRow
                id="#2459"
                title="VPN offline"
                requester="Victor Lima"
                requesterAvatar="https://i.pinimg.com/736x/cd/24/05/cd2405c133bb83f3480772c88f666163.jpg"
                company="Gelog"
                companyLogo="https://play-lh.googleusercontent.com/9xmzOZwPsGFHY3qjNhOPLvoAGbrFPByMj6OE1gX_k-JC6MWL9GL-maiTX4PQTg4agwtUXTPa49X3vB_vdoYnpw=w240-h480-rw"
                priority="Média"
                status="Aberto"
                updated="25 min"
              />
 
              <TicketRow
                id="#2460"
                title="Falha Outlook"
                requester="Vebeke Hanashiro"
                requesterAvatar="https://i.pinimg.com/736x/97/02/d9/9702d99e8f121abb9b6fab74a815ed3f.jpg"
                company="Santos Brasil Ltda"
                companyLogo="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSvauPQWTqXeWu2sLHU9MiA0rIj9UDCI0KoA&s"
                priority="Baixa"
                status="Aguardando"
                updated="1 hora"
              />
 
              <TicketRow
                id="#2461"
                title="Impressora"
                requester="Erick Oliveira"
                requesterAvatar="https://i.pinimg.com/736x/f0/a6/a2/f0a6a2bcb052906b2a317c84e2e39711.jpg"
                company="SGS do Brasil"
                companyLogo="https://www.issosignifica.com/sgs-2-w400.jpg"
                priority="Alta"
                status="Resolvido"
                updated="Ontem"
              />
</tbody>
</table>
</div>
 
        {/* TIMELINE */}
<aside className="bg-card rounded-[28px] p-6">
<h2 className="text-xl font-semibold mb-6">
            Atividades Recentes
</h2>
 
          <div className="space-y-6">
<Activity
              user="Gabriel"
              text="criou um novo ticket"
              time="Agora mesmo"
            />
 
            <Activity
              user="Erick"
              text="iniciou atendimento"
              time="15 min atrás"
            />
 
            <Activity
              user="Marcela"
              text="fechou o ticket #2451"
              time="Hoje"
            />
 
            <Activity
              user="Lucas"
              text="atualizou o ticket #2438"
              time="Ontem"
            />
</div>
</aside>
</div>
</main>
  );
}
 
function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="
      bg-(--card)
      border
      border-(--border)
      rounded-[28px]
      px-6
      py-7
      shadow-(--shadow)
      hover:border-green-500/20
      transition-all
    ">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-(--muted-foreground)">
            {title}
          </p>

          <h3 className="mt-2 text-4xl font-bold">
            {value}
          </h3>
        </div>

        <div className="
          h-14
          w-14
          rounded-2xl
          bg-green-500/10
          text-green-400
          flex
          items-center
          justify-center
        ">
          {icon}
        </div>
      </div>
    </div>
  );
}
 
function TicketRow({
  id,
  title,
  requester,
  requesterAvatar,
  company,
  companyLogo,
  priority,
  status,
  updated,
}: {
  id: string;
  title: string;
  requester: string;
  requesterAvatar: string;
  company: string;
  companyLogo: string;
  priority: string;
  status: string;
  updated: string;
}) {
  return (
    <tr className="border-b border-(--border) hover:bg-(--muted) transition-colors">
<td className="p-5">{id}</td>
 
      <td className="p-5">{title}</td>
 
      <td className="p-5">
        <div className="flex items-center gap-3">
          <img
            src={requesterAvatar}
            alt={requester}
            className="h-8 w-8 rounded-full object-cover shadow-sm"
          />
          <span className="font-medium whitespace-nowrap">{requester}</span>
        </div>
      </td>

      <td className="p-5">
        <div className="flex items-center gap-2">
          <img
            src={companyLogo}
            alt={company}
            className="h-5 w-5 rounded-md object-contain"
          />
          <span className="text-sm whitespace-nowrap">{company}</span>
        </div>
      </td>
 
      <td className="p-5">
        {priority === "Alta" && (
<span className="badge-danger">
            Alta
</span>
        )}
 
        {priority === "Média" && (
<span className="badge-warning">
            Média
</span>
        )}
 
        {priority === "Baixa" && (
<span className="badge-success">
            Baixa
</span>
        )}
</td>
 
      <td className="p-5">
        <span className={
          status === "Aberto" || status === "Resolvido" ? "badge-success" : 
          status === "Em atendimento" || status === "Aguardando" ? "badge-warning" : "badge-danger"
        }>
          {status}
        </span>
</td>
 
      <td className="p-5 text-muted">
        {updated}
</td>
</tr>
  );
}
 
function Activity({
  user,
  text,
  time,
}: {
  user: string;
  text: string;
  time: string;
}) {
  return (
<div className="flex gap-4">
<div className="w-[2px] bg-green-500 rounded-full" />
 
      <div>
<p>
<span className="font-semibold text-green-400">
            {user}
</span>{" "}
          {text}
</p>
 
        <p className="text-sm text-muted mt-1">
          {time}
</p>
</div>
</div>
  );
}