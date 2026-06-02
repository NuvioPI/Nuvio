// app/admin/dashboard/page.tsx
import Link from "next/link";
import type { Metadata } from "next/metadata";
import { Playfair_Display, DM_Sans } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["italic"] });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500"] });

export const metadata: Metadata = {
  title: "Nuvio | Dashboard Admin",
  description:
    "Visão geral do painel administrativo do Nuvio, com métricas, ações rápidas e atividades recentes.",
};

const metrics = [
  {
    label: "Clientes ativos",
    value: "1.284",
    delta: "+12% este mês",
    up: true,
  },
  { label: "Tickets abertos", value: "47", delta: "+8 hoje", up: false },
  {
    label: "Tickets resolvidos",
    value: "319",
    delta: "+5% esta semana",
    up: true,
  },
  {
    label: "Tempo médio resp.",
    value: "2,4h",
    delta: "−18min vs. anterior",
    up: true,
  },
];

const actions = [
  {
    label: "Cadastrar cliente",
    desc: "Registra novo contato no Freshdesk com dados completos e tags.",
    href: "/admin/clientes/novo",
    icon: "user-plus",
    bg: "#eaf3de",
    ic: "#3b6d11",
    featured: true,
  },
  {
    label: "Editar Freshdesk",
    desc: "Atualiza dados de contatos, grupos, campos e configurações.",
    href: "/admin/freshdesk",
    icon: "edit",
    bg: "#e6f1fb",
    ic: "#185fa5",
  },
  {
    label: "Relatórios",
    desc: "Visualiza métricas, exporta dados e acompanha KPIs do suporte.",
    href: "/admin/relatorios",
    icon: "chart-bar",
    bg: "#faeeda",
    ic: "#854f0b",
  },
  {
    label: "Gerenciar tickets",
    desc: "Triagem, atribuição e resolução de chamados do suporte.",
    href: "/admin/tickets",
    icon: "ticket",
    bg: "#fcebeb",
    ic: "#a32d2d",
  },
  {
    label: "Usuários e permissões",
    desc: "Gerencia agentes, funções e níveis de acesso ao sistema.",
    href: "/admin/usuarios",
    icon: "users",
    bg: "#eeedfe",
    ic: "#534ab7",
  },
  {
    label: "Base de conhecimento",
    desc: "Cria e edita artigos, FAQs e documentação para clientes.",
    href: "/admin/conhecimento",
    icon: "book",
    bg: "#e1f5ee",
    ic: "#0f6e56",
  },
  {
    label: "Automações e SLA",
    desc: "Configura regras automáticas, escalonamento e prazos de SLA.",
    href: "/admin/automacoes",
    icon: "bolt",
    bg: "#fbeaf0",
    ic: "#993556",
  },
  {
    label: "Integrações",
    desc: "Conecta webhooks, APIs externas e apps de terceiros.",
    href: "/admin/integracoes",
    icon: "plug",
    bg: "#f1efe8",
    ic: "#5f5e5a",
  },
  {
    label: "Configurações",
    desc: "Preferências gerais, notificações, domínio e tema do portal.",
    href: "/admin/configuracoes",
    icon: "settings",
    bg: "#f1efe8",
    ic: "#888780",
  },
];

const tickets = [
  {
    title: "Erro ao gerar boleto",
    author: "Maria Souza",
    time: "há 10min",
    status: "Aberto",
    dot: "#378add",
    badgeBg: "#e6f1fb",
    badgeTxt: "#185fa5",
  },
  {
    title: "Não consigo acessar o portal",
    author: "Carlos Lima",
    time: "há 42min",
    status: "Aguardando",
    dot: "#ef9f27",
    badgeBg: "#faeeda",
    badgeTxt: "#854f0b",
  },
  {
    title: "Dúvida sobre plano Pro",
    author: "Ana Ferreira",
    time: "há 1h",
    status: "Em andamento",
    dot: "#2fae5a",
    badgeBg: "#eaf3de",
    badgeTxt: "#3b6d11",
  },
  {
    title: "Solicitação de NF",
    author: "Pedro Alves",
    time: "há 2h",
    status: "Resolvido",
    dot: "#888780",
    badgeBg: "#f1efe8",
    badgeTxt: "#5f5e5a",
  },
  {
    title: "Integração com ERP falhou",
    author: "Tech Corp",
    time: "há 3h",
    status: "Aberto",
    dot: "#378add",
    badgeBg: "#e6f1fb",
    badgeTxt: "#185fa5",
  },
];

const activity = [
  {
    text: "Novo cliente Tech Corp Ltda. cadastrado",
    time: "há 5 min · por você",
    icon: "user-plus",
    bg: "#eaf3de",
    ic: "#3b6d11",
  },
  {
    text: "Contato Maria Souza atualizado no Freshdesk",
    time: "há 18 min · por você",
    icon: "edit",
    bg: "#e6f1fb",
    ic: "#185fa5",
  },
  {
    text: "Relatório mensal maio/2025 exportado",
    time: "há 1h · por Admin",
    icon: "chart-bar",
    bg: "#faeeda",
    ic: "#854f0b",
  },
  {
    text: "Permissão de agente concedida a João Dev",
    time: "há 2h · por Admin",
    icon: "users",
    bg: "#eeedfe",
    ic: "#534ab7",
  },
  {
    text: "Regra de SLA Prioridade Alta atualizada",
    time: "há 3h · por Admin",
    icon: "bolt",
    bg: "#fcebeb",
    ic: "#a32d2d",
  },
];

const iconPaths: Record<string, string> = {
  "user-plus":
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  "chart-bar": "M18 20V10M12 20V4M6 20v-6",
  ticket:
    "M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  bolt: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  plug: "M7 12h10M7 6h10M7 18h10",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
};

function Icon({
  name,
  color,
  size = 18,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name] ?? ""} />
    </svg>
  );
}

const labelCls =
  "text-[11px] font-medium text-(--muted-foreground) uppercase tracking-[.6px] mb-3.5 block";

export default function AdminDashboard() {
  return (
    <div className="p-5 space-y-5">
      {/* MÉTRICAS */}
      <section>
        <span className={labelCls}>Visão geral</span>
        <div className="grid grid-cols-4 gap-2.5">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="bg-(--admin-card) border border-(--border) rounded-xl p-3.5"
            >
              <p className="text-[11px] text-(--muted-foreground) mb-1.5">
                {m.label}
              </p>
              <p className="text-[22px] font-medium text-(--foreground) leading-none">
                {m.value}
              </p>
              <p
                className={`text-[11px] mt-1.5 flex items-center gap-1 ${m.up ? "text-[#3b6d11]" : "text-[#a32d2d]"}`}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {m.up ? (
                    <>
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </>
                  ) : (
                    <>
                      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                      <polyline points="17 18 23 18 23 12" />
                    </>
                  )}
                </svg>
                {m.delta}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AÇÕES */}
      <section>
        <span className={labelCls}>Ações rápidas</span>
        <div className="grid grid-cols-3 gap-2.5">
          {actions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className={[
                "bg-(--admin-card) rounded-xl p-5 flex flex-col gap-2.5 no-underline",
                "transition-transform hover:-translate-y-px",
                a.featured
                  ? "border border-[#2fae5a]"
                  : "border border-(--border) hover:border-(--border)",
              ].join(" ")}
            >
              {a.featured && (
                <span className="self-start text-[10px] font-medium bg-[#eaf3de] text-[#3b6d11] rounded-full px-2 py-0.5">
                  Destaque
                </span>
              )}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: a.bg }}
              >
                <Icon name={a.icon} color={a.ic} size={18} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-(--foreground)">
                  {a.label}
                </p>
                <p className="text-[11px] text-(--muted-foreground) leading-relaxed mt-0.5">
                  {a.desc}
                </p>
              </div>
              <p className="mt-auto text-[11px] text-(--muted-foreground) flex items-center gap-1">
                Abrir
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* PAINÉIS INFERIORES */}
      <section className="grid grid-cols-2 gap-2.5">
        {/* tickets recentes */}
        <div className="bg-(--admin-card) border border-(--border) rounded-xl p-4">
          <span className={labelCls}>Tickets recentes</span>
          <div className="flex flex-col divide-y divide-(--border)">
            {tickets.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: t.dot }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-(--foreground) truncate">
                    {t.title}
                  </p>
                  <p className="text-[11px] text-(--muted-foreground)">
                    {t.author} · {t.time}
                  </p>
                </div>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: t.badgeBg, color: t.badgeTxt }}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* atividade recente */}
        <div className="bg-(--admin-card) border border-(--border) rounded-xl p-4">
          <span className={labelCls}>Atividade recente</span>
          <div className="flex flex-col divide-y divide-(--border)">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-2.5 py-2 first:pt-0 last:pb-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: a.bg }}
                >
                  <Icon name={a.icon} color={a.ic} size={13} />
                </div>
                <div>
                  <p className="text-[12px] text-(--foreground) leading-snug">
                    {a.text}
                  </p>
                  <p className="text-[11px] text-(--muted-foreground) mt-0.5">
                    {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
