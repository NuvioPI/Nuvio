"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Gauge,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { apiFetch } from "@/lib/api";
import type { TicketResumo } from "@/components/dashboard/ui/table";
import { NuvioName } from "@/components/ui/NuvioBadge";
import { formatarDataBackend, timestampDoBackend } from "@/lib/date-utils";

const statusOrdem = ["Aberto", "Em atendimento", "Resolvido", "Fechado"] as const;
const prioridadeOrdem = ["Alta", "Media", "Baixa"] as const;

const statusClasses: Record<string, string> = {
  Aberto: "bg-[var(--status-open-bg)] text-[var(--status-open-text)]",
  "Em atendimento": "bg-[var(--status-progress-bg)] text-[var(--status-progress-text)]",
  Resolvido: "bg-[var(--status-closed-bg)] text-[var(--status-closed-text)]",
  Fechado: "bg-[var(--status-closed-bg)] text-[var(--status-closed-text)]",
};

const prioridadeClasses: Record<string, string> = {
  Alta: "bg-[var(--priority-high-bg)] text-[var(--priority-high-text)]",
  Media: "bg-[var(--priority-medium-bg)] text-[var(--priority-medium-text)]",
  Baixa: "bg-[var(--priority-low-bg)] text-[var(--priority-low-text)]",
};

const chartColors = ["#0f6b2e", "#2fae5a", "#7dd3fc", "#f5b700", "#e5484d"];

export default function ReportsPage() {
  const [tickets, setTickets] = useState<TicketResumo[]>([]);
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState("30");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    apiFetch<{ tickets: TicketResumo[] }>("/tickets")
      .then((dados) => setTickets(dados.tickets))
      .catch((causa) => setErro(causa instanceof Error ? causa.message : "Não foi possível carregar os relatórios."))
      .finally(() => setCarregando(false));
  }, []);

  const ticketsPeriodo = useMemo(() => {
    if (periodo === "todos") return tickets;

    const dias = Number(periodo);
    const limite = new Date();
    limite.setDate(limite.getDate() - dias);

    return tickets.filter((ticket) => timestampDoBackend(ticket.dataAbertura) >= limite.getTime());
  }, [tickets, periodo]);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return ticketsPeriodo;

    return ticketsPeriodo.filter((ticket) => {
      const texto = `${ticket.idTicket} ${ticket.titulo} ${ticket.nomeUsuario} ${ticket.statusTicket} ${ticket.prioridade}`.toLowerCase();
      return texto.includes(termo);
    });
  }, [ticketsPeriodo, busca]);

  const total = filtrados.length;
  const abertos = contarPorCampo(filtrados, "statusTicket", "Aberto");
  const emAtendimento = contarPorCampo(filtrados, "statusTicket", "Em atendimento");
  const resolvidos = contarPorCampo(filtrados, "statusTicket", "Resolvido") + contarPorCampo(filtrados, "statusTicket", "Fechado");
  const criticos = contarPorCampo(filtrados, "prioridade", "Alta");
  const taxaResolucao = total > 0 ? Math.round((resolvidos / total) * 100) : 0;
  const maiorStatus = maiorGrupo(filtrados.map((ticket) => ticket.statusTicket));
  const maiorPrioridade = maiorGrupo(filtrados.map((ticket) => ticket.prioridade));
  const statusItens = statusOrdem.map((status, index) => ({
    label: status,
    valor: contarPorCampo(filtrados, "statusTicket", status),
    cor: chartColors[index],
  }));
  const prioridadeItens = prioridadeOrdem.map((prioridade, index) => ({
    label: prioridade,
    valor: contarPorCampo(filtrados, "prioridade", prioridade),
    cor: chartColors[index],
  }));
  const tendenciaDiaria = montarTendenciaDiaria(filtrados);
  const rankingSolicitantes = montarRanking(filtrados.map((ticket) => ticket.nomeUsuario)).slice(0, 5);
  const chamadosRecentes = [...filtrados]
    .sort((a, b) => timestampDoBackend(b.dataAbertura) - timestampDoBackend(a.dataAbertura))
    .slice(0, 6);

  function exportarCsv() {
    const cabecalho = ["ID", "Título", "Solicitante", "Prioridade", "Status", "Aberto em"];
    const linhas = filtrados.map((ticket) => [
      `#${ticket.idTicket}`,
      ticket.titulo,
      ticket.nomeUsuario,
      ticket.prioridade,
      ticket.statusTicket,
      dataFormatada(ticket.dataAbertura),
    ]);
    const csv = [cabecalho, ...linhas]
      .map((linha) => linha.map((valor) => `"${String(valor).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "relatorio-chamados.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-(--background) p-4 md:p-8">
      <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-medium text-(--muted-foreground)">
            <BarChart3 className="h-3.5 w-3.5" />
            Visão operacional
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-(--foreground) md:text-5xl">Relatórios</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground) md:text-base">
            Acompanhe volume, resolução e distribuição dos chamados para entender onde o atendimento precisa de atenção.
          </p>
        </div>

        <button
          type="button"
          onClick={exportarCsv}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 text-sm font-medium text-white transition-colors hover:bg-(--primary-hover)"
        >
          <Download className="h-4 w-4" />
          Exportar
        </button>
      </section>

      <motion.section
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard titulo="Total de chamados" valor={total} detalhe={`${ticketsPeriodo.length} no período`} icone={<FileText size={22} />} />
        <MetricCard titulo="Em aberto" valor={abertos + emAtendimento} detalhe={`${emAtendimento} em atendimento`} icone={<Clock3 size={22} />} />
        <MetricCard titulo="Resolvidos" valor={resolvidos} detalhe={`${taxaResolucao}% de resolução`} icone={<CheckCircle2 size={22} />} />
        <MetricCard titulo="Alta prioridade" valor={criticos} detalhe="Chamados críticos" icone={<AlertCircle size={22} />} />
      </motion.section>

      <section className="mb-6 rounded-[28px] border border-(--border) bg-(--card) p-5 shadow-(--shadow)">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--muted-foreground)" />
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por chamado, solicitante, status ou prioridade..."
              className="h-12 w-full rounded-xl border border-(--border) bg-(--background) pl-12 pr-4 text-sm outline-none transition-colors focus:border-(--primary)"
            />
          </div>

          <select
            value={periodo}
            onChange={(event) => setPeriodo(event.target.value)}
            className="h-12 min-w-[190px] rounded-xl border border-(--border) bg-(--background) px-4 text-sm outline-none transition-colors focus:border-(--primary)"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="todos">Todo o histórico</option>
          </select>
        </div>
      </section>

      {erro && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          {erro}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[28px] border border-(--border) bg-(--card) p-5 shadow-(--shadow)">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">Status geral</h2>
              <p className="mt-1 text-sm text-(--muted-foreground)">Proporção dos chamados filtrados.</p>
            </div>
            <Sparkles className="h-5 w-5 text-(--primary)" />
          </div>
          <DonutChart total={total} itens={statusItens} centro={`${taxaResolucao}%`} detalhe="resolvidos" />
        </section>

        <section className="rounded-[28px] border border-(--border) bg-(--card) p-5 shadow-(--shadow)">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">Tendência diária</h2>
              <p className="mt-1 text-sm text-(--muted-foreground)">Volume de abertura nos últimos dias do filtro.</p>
            </div>
            <TrendingUp className="h-5 w-5 text-(--primary)" />
          </div>
          <DailyTrend dados={tendenciaDiaria} />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-[28px] border border-(--border) bg-(--card) p-5 shadow-(--shadow)">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">Distribuição dos chamados</h2>
              <p className="mt-1 text-sm text-(--muted-foreground)">Comparativo por status e prioridade.</p>
            </div>
            <Gauge className="h-5 w-5 text-(--muted-foreground)" />
          </div>

          <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
            <ReportGroup titulo="Por status" total={total} itens={statusItens} />
            <ReportGroup titulo="Por prioridade" total={total} itens={prioridadeItens} />
          </div>
        </section>

        <section className="rounded-[28px] border border-(--border) bg-(--card) p-5 shadow-(--shadow)">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">Resumo</h2>
              <p className="mt-1 text-sm text-(--muted-foreground)">Leitura rápida do período.</p>
            </div>
            <TrendingUp className="h-5 w-5 text-(--primary)" />
          </div>

          <div className="space-y-4">
            <Insight label="Status mais comum" value={maiorStatus.label} detail={`${maiorStatus.valor} chamados`} />
            <Insight label="Prioridade dominante" value={maiorPrioridade.label} detail={`${maiorPrioridade.valor} chamados`} />
            <Insight label="Taxa de resolução" value={`${taxaResolucao}%`} detail={`${resolvidos} de ${total} chamados`} />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-[28px] border border-(--border) bg-(--card) p-5 shadow-(--shadow)">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-(--foreground)">Solicitantes mais ativos</h2>
            <p className="mt-1 text-sm text-(--muted-foreground)">Quem abriu mais chamados no período selecionado.</p>
          </div>
          <Users className="h-5 w-5 text-(--muted-foreground)" />
        </div>
        <RequesterRanking total={total} itens={rankingSolicitantes} />
      </section>

      <section className="mt-6 rounded-[28px] border border-(--border) bg-(--card) shadow-(--shadow)">
        <div className="border-b border-(--border) p-5">
          <h2 className="text-xl font-semibold text-(--foreground)">Chamados recentes no relatório</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-(--border) text-sm text-(--muted-foreground)">
                <th className="p-5 text-left font-medium">ID</th>
                <th className="p-5 text-left font-medium">Título</th>
                <th className="p-5 text-left font-medium">Solicitante</th>
                <th className="p-5 text-left font-medium">Prioridade</th>
                <th className="p-5 text-left font-medium">Status</th>
                <th className="p-5 text-left font-medium">Aberto em</th>
              </tr>
            </thead>
            <tbody>
              {carregando && <tr><td colSpan={6} className="p-8 text-center text-(--muted-foreground)">Carregando relatórios...</td></tr>}
              {!carregando && chamadosRecentes.length === 0 && !erro && (
                <tr><td colSpan={6} className="p-8 text-center text-(--muted-foreground)">Nenhum chamado encontrado.</td></tr>
              )}
              {chamadosRecentes.map((ticket) => (
                <motion.tr
                  key={ticket.idTicket}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-(--border) transition-colors hover:bg-(--muted)"
                >
                  <td className="p-5 text-(--foreground)">#{ticket.idTicket}</td>
                  <td className="p-5 font-medium text-(--foreground)">{ticket.titulo}</td>
                  <td className="p-5 text-(--foreground)"><NuvioName name={ticket.nomeUsuario} tipo={ticket.tipoUsuario} /></td>
                  <td className="p-5"><Badge classe={prioridadeClasses[ticket.prioridade]}>{ticket.prioridade}</Badge></td>
                  <td className="p-5"><Badge classe={statusClasses[ticket.statusTicket]}>{ticket.statusTicket}</Badge></td>
                  <td className="p-5 text-(--muted-foreground)">{dataFormatada(ticket.dataAbertura)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ titulo, valor, detalhe, icone }: { titulo: string; valor: number; detalhe: string; icone: React.ReactNode }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="rounded-[28px] border border-(--border) bg-(--card) p-6 shadow-(--shadow)"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-(--muted-foreground)">{titulo}</p>
          <h3 className="mt-2 text-4xl font-bold text-(--foreground)">{valor}</h3>
          <p className="mt-2 text-sm text-(--muted-foreground)">{detalhe}</p>
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-green-500/10 text-(--primary)">
          {icone}
        </div>
      </div>
    </motion.div>
  );
}

function DonutChart({ total, itens, centro, detalhe }: { total: number; itens: { label: string; valor: number; cor: string }[]; centro: string; detalhe: string }) {
  const segmentos = montarConicGradient(itens, total);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <motion.div
        initial={{ rotate: -40, opacity: 0, scale: 0.88 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative grid h-52 w-52 shrink-0 place-items-center rounded-full"
        style={{ background: segmentos }}
      >
        <div className="grid h-32 w-32 place-items-center rounded-full border border-(--border) bg-(--card) text-center shadow-(--shadow)">
          <div>
            <p className="text-3xl font-bold text-(--foreground)">{centro}</p>
            <p className="mt-1 text-xs text-(--muted-foreground)">{detalhe}</p>
          </div>
        </div>
      </motion.div>
      <div className="w-full space-y-3">
        {itens.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-(--background) px-3 py-2">
            <span className="flex items-center gap-2 text-sm text-(--foreground)">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.cor }} />
              {item.label}
            </span>
            <span className="text-sm font-semibold text-(--foreground)">{item.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyTrend({ dados }: { dados: { label: string; valor: number }[] }) {
  const maior = Math.max(1, ...dados.map((item) => item.valor));

  return (
    <div className="flex h-64 items-end gap-2 rounded-2xl bg-(--background) p-4">
      {dados.map((item) => {
        const altura = Math.max(8, Math.round((item.valor / maior) * 100));

        return (
          <div key={item.label} className="flex h-full flex-1 flex-col justify-end gap-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${altura}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="min-h-2 rounded-t-lg bg-(--primary)"
              title={`${item.valor} chamados`}
            />
            <span className="text-center text-[11px] text-(--muted-foreground)">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function RequesterRanking({ total, itens }: { total: number; itens: { label: string; valor: number }[] }) {
  if (itens.length === 0) {
    return <p className="rounded-xl bg-(--background) p-5 text-sm text-(--muted-foreground)">Nenhum solicitante no período selecionado.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {itens.map((item, index) => {
        const percentual = total > 0 ? Math.round((item.valor / total) * 100) : 0;

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.24 }}
            className="rounded-2xl border border-(--border) bg-(--background) p-4"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-(--primary) text-sm font-semibold text-white">
                {item.label.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-(--foreground)">{item.label}</p>
                <p className="text-xs text-(--muted-foreground)">{item.valor} chamados</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-(--muted)">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentual}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="h-full rounded-full bg-(--primary)"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ReportGroup({ titulo, total, itens }: { titulo: string; total: number; itens: { label: string; valor: number; cor: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-medium text-(--muted-foreground)">{titulo}</h3>
      <div className="space-y-4">
        {itens.map((item) => {
          const percentual = total > 0 ? Math.round((item.valor / total) * 100) : 0;

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-(--foreground)">{item.label}</span>
                <span className="text-(--muted-foreground)">{item.valor} ({percentual}%)</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-(--muted)">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentual}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.cor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Insight({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--background) p-4">
      <p className="text-sm text-(--muted-foreground)">{label}</p>
      <p className="mt-1 text-lg font-semibold text-(--foreground)">{value}</p>
      <p className="mt-1 text-xs text-(--muted-foreground)">{detail}</p>
    </div>
  );
}

function Badge({ children, classe }: { children: string; classe?: string }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-sm whitespace-nowrap ${classe ?? "bg-(--muted) text-(--foreground)"}`}>{children}</span>;
}

function contarPorCampo<T extends keyof TicketResumo>(tickets: TicketResumo[], campo: T, valor: TicketResumo[T]) {
  return tickets.filter((ticket) => ticket[campo] === valor).length;
}

function maiorGrupo(valores: string[]) {
  if (valores.length === 0) {
    return { label: "Sem dados", valor: 0 };
  }

  const contagem = valores.reduce<Record<string, number>>((acc, valor) => {
    acc[valor] = (acc[valor] ?? 0) + 1;
    return acc;
  }, {});

  const maior = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0];

  return maior
    ? { label: maior[0], valor: maior[1] }
    : { label: "Sem dados", valor: 0 };
}

function montarRanking(valores: string[]) {
  const contagem = valores.reduce<Record<string, number>>((acc, valor) => {
    const label = valor || "Sem solicitante";
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(contagem)
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function montarTendenciaDiaria(tickets: TicketResumo[]) {
  const hoje = new Date();
  const dias = Array.from({ length: 7 }, (_, index) => {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - (6 - index));
    data.setHours(0, 0, 0, 0);
    return data;
  });

  return dias.map((data) => {
    const inicio = data.getTime();
    const fim = inicio + 24 * 60 * 60 * 1000;
    const valor = tickets.filter((ticket) => {
      const abertura = timestampDoBackend(ticket.dataAbertura);
      return abertura >= inicio && abertura < fim;
    }).length;

    return {
      label: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(data),
      valor,
    };
  });
}

function montarConicGradient(itens: { valor: number; cor: string }[], total: number) {
  if (total === 0) {
    return "conic-gradient(var(--muted) 0deg 360deg)";
  }

  let inicio = 0;
  const segmentos = itens.map((item) => {
    const graus = (item.valor / total) * 360;
    const fim = inicio + graus;
    const segmento = `${item.cor} ${inicio}deg ${fim}deg`;
    inicio = fim;
    return segmento;
  });

  return `conic-gradient(${segmentos.join(", ")})`;
}

function dataFormatada(data: string) {
  return formatarDataBackend(data);
}
