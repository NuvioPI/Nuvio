import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2, Globe2, Webhook } from "lucide-react";

const integracoes = [
  { nome: "API REST", descricao: "Consulte e envie dados do Nuvio usando os endpoints autenticados.", icone: Code2, status: "Disponível" },
  { nome: "Webhooks", descricao: "Receba eventos do seu sistema e automatize fluxos de atendimento.", icone: Webhook, status: "Disponível" },
  { nome: "Aplicações externas", descricao: "Conectores específicos precisam ser habilitados no ambiente do servidor.", icone: Globe2, status: "Configuração necessária" },
];

export default function IntegracoesPage() {
  return <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
    <div className="mb-8"><p className="text-sm font-medium text-(--primary)">Conectividade</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-(--foreground)">Integrações</h1><p className="mt-2 max-w-2xl text-sm text-(--muted-foreground)">Veja os canais disponíveis para conectar o Nuvio às ferramentas da sua operação.</p></div>
    <div className="grid gap-4 md:grid-cols-3">{integracoes.map(({ nome, descricao, icone: Icon, status }) => <section key={nome} className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-(--shadow)"><div className="flex items-start justify-between gap-3"><span className="rounded-xl bg-(--hoverbg) p-3 text-(--primary)"><Icon className="h-5 w-5" /></span><span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-[11px] font-medium text-green-700"><CheckCircle2 className="h-3.5 w-3.5" />{status}</span></div><h2 className="mt-5 font-semibold text-(--foreground)">{nome}</h2><p className="mt-2 text-sm leading-6 text-(--muted-foreground)">{descricao}</p></section>)}</div>
    <section className="mt-6 rounded-2xl border border-(--border) bg-(--card) p-5 shadow-(--shadow)"><h2 className="font-semibold text-(--foreground)">Próximo passo</h2><p className="mt-2 text-sm leading-6 text-(--muted-foreground)">As credenciais e preferências gerais ficam nas configurações da conta. Não há conexão Freshdesk ativa neste projeto.</p><Link href="/settings" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-(--primary) hover:underline">Abrir configurações <ArrowRight className="h-4 w-4" /></Link></section>
  </div>;
}
