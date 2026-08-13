import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardPlus,
  Clock3,
  LifeBuoy,
  LockKeyhole,
  MessageCircle,
  Sparkles,
} from "lucide-react";

const channels = [
  {
    href: "/portal/login?dest=chamado",
    icon: ClipboardPlus,
    eyebrow: "Abertura de chamado",
    title: "Abrir um chamado",
    description: "Registre sua solicitação e acompanhe cada atualização pelo protocolo.",
    action: "Criar chamado",
    featured: true,
  },
  {
    href: "/portal/login?dest=email",
    icon: MessageCircle,
    eyebrow: "Atendimento por e-mail",
    title: "Enviar um e-mail",
    description: "Registre sua solicitação com detalhes e acompanhe tudo pelo protocolo.",
    action: "Enviar e-mail",
    featured: false,
  },
];

const faqs = [
  ["Qual canal devo escolher?", "Use o chat para situações rápidas. Para problemas que exigem análise ou anexos, abra um chamado."],
  ["Quando vou receber uma resposta?", "O chat funciona em horário comercial. Chamados recebem a primeira atualização conforme o SLA da sua organização."],
  ["Preciso ter uma conta?", "Não. Basta informar seu nome e e-mail para iniciar o atendimento e receber o protocolo."],
];

export default function PortalExterno() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f9f6] text-[#173020]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_-10%,#d9f4df_0%,transparent_62%)]" />
      <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-6 sm:px-8 lg:px-10 lg:pt-8">
        <header className="flex items-center justify-between">
          <Link href="/portal" className="flex items-center gap-3 text-[#0f6b2e]" aria-label="Nuvio atendimento">
            <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#0f6b2e] text-lg font-bold text-white shadow-lg shadow-[#0f6b2e]/20">N</span>
            <span className="text-xl font-bold tracking-[-0.04em]">nuvio</span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-[#5b7060]">
            <span className="hidden items-center gap-2 rounded-full border border-[#d8e7db] bg-white/70 px-3 py-2 sm:flex"><LockKeyhole size={15} className="text-[#28834a]" /> Ambiente seguro</span>
            <Link href="/" className="rounded-xl px-3 py-2 font-medium hover:bg-white">Site principal</Link>
          </div>
        </header>

        <section className="relative mt-16 grid items-center gap-12 lg:mt-20 lg:grid-cols-[1.04fr_.96fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#bfe2c8] bg-white/85 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#23743c] shadow-sm"><span className="h-2 w-2 animate-pulse rounded-full bg-[#37b95d]" /> Atendimento online</div>
            <h1 className="max-w-xl text-[clamp(2.8rem,6vw,5rem)] font-semibold leading-[.98] tracking-[-0.065em] text-[#173020]">Estamos aqui para <span className="text-[#218844]">ajudar.</span></h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#5d7164]">Bem-vindo ao portal de atendimento da Nuvio. Encontre a forma mais simples de falar com a nossa equipe.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-[#5d7164]"><span className="inline-flex items-center gap-2"><CheckCircle2 size={18} className="text-[#2ba651]" /> Atendimento humanizado</span><span className="inline-flex items-center gap-2"><Clock3 size={18} className="text-[#2ba651]" /> Seg–Sex, 8h–18h</span></div>
          </div>

          <div className="relative rounded-[30px] bg-[#105f2a] p-6 text-white shadow-[0_24px_70px_rgba(15,107,46,.2)] sm:p-8">
            <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-[#48c86e]/20 blur-2xl" />
            <div className="relative flex items-start justify-between"><div><p className="text-sm font-medium text-white/65">Status do suporte</p><p className="mt-2 flex items-center gap-2 text-2xl font-semibold"><span className="h-3 w-3 rounded-full bg-[#73e891] shadow-[0_0_0_5px_rgba(115,232,145,.12)]" /> Estamos online</p></div><LifeBuoy size={27} className="text-white/80" /></div>
            <div className="relative mt-9 rounded-2xl border border-white/10 bg-white/10 p-4"><div className="flex items-center justify-between text-sm"><span className="text-white/65">Tempo médio de resposta</span><span className="font-semibold">&lt; 5 min</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[88%] rounded-full bg-[#78e798]" /></div></div>
            <p className="relative mt-5 text-sm leading-6 text-white/65">Escolha um canal abaixo e nossa equipe assume o atendimento.</p>
          </div>
        </section>

        <section className="relative mt-16 sm:mt-20"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#2b9050]">Comece por aqui</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Como você quer ser atendido?</h2></div><Sparkles className="hidden text-[#42aa62] sm:block" size={25} /></div><div className="grid gap-5 md:grid-cols-2">{channels.map(({ href, icon: Icon, eyebrow, title, description, action, featured }) => <Link key={href} href={href} className={`group relative overflow-hidden rounded-[25px] border p-6 transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-7 ${featured ? "border-[#0f6b2e] bg-[#0f6b2e] text-white shadow-lg shadow-[#0f6b2e]/15" : "border-[#dce8df] bg-white hover:border-[#a9d4b2]"}`}><div className={`grid h-12 w-12 place-items-center rounded-2xl ${featured ? "bg-white/15 text-white" : "bg-[#eaf7ed] text-[#147538]"}`}><Icon size={23} /></div><p className={`mt-6 text-xs font-semibold uppercase tracking-[0.13em] ${featured ? "text-white/55" : "text-[#5e8c69]"}`}>{eyebrow}</p><h3 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h3><p className={`mt-3 max-w-sm leading-6 ${featured ? "text-white/70" : "text-[#65776b]"}`}>{description}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold">{action}<ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></span>{featured && <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full border-[18px] border-white/5" />}</Link>)}</div></section>

        <section className="mt-16 grid gap-8 border-t border-[#dce8df] pt-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#2b9050]">Antes de abrir</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Perguntas frequentes</h2><p className="mt-3 max-w-sm leading-6 text-[#687a6d]">Talvez sua dúvida já tenha uma resposta rápida.</p></div><div className="divide-y divide-[#e2ebe4] rounded-2xl border border-[#dce8df] bg-white px-5">{faqs.map(([question, answer]) => <details key={question} className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold"><span>{question}</span><ChevronDown size={17} className="shrink-0 text-[#6c8373] transition-transform group-open:rotate-180" /></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-[#6a7b70]">{answer}</p></details>)}</div></section>

        <footer className="mt-14 flex flex-col gap-4 border-t border-[#dce8df] pt-7 text-sm text-[#6b7b70] sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Nuvio. Central de atendimento.</p><p className="inline-flex items-center gap-2"><LockKeyhole size={15} className="text-[#2b9050]" /> Seus dados são tratados com segurança.</p></footer>
      </div>
    </main>
  );
}
