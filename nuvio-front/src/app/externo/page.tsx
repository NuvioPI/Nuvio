import Link from "next/link";
import { ClipboardPlus, MessageCircle, ArrowRight, ShieldCheck, Clock3 } from "lucide-react";

const choices = [
  {
    href: "/externo/chat",
    icon: MessageCircle,
    title: "Conversar agora",
    description: "Fale com nossa equipe pelo chat e acompanhe a solução em tempo real.",
    cta: "Iniciar chat",
    featured: true,
  },
  {
    href: "/externo/email",
    icon: ClipboardPlus,
    title: "Abrir um chamado",
    description: "Descreva sua solicitação e receba atualizações por e-mail.",
    cta: "Criar chamado",
    featured: false,
  },
];

export default function PortalExterno() {
  return (
    <main className="min-h-screen bg-[#f6faf7] px-5 py-8 text-[#173020] sm:px-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-[#0f6b2e]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0f6b2e] text-lg text-white">N</span>
            <span className="text-xl">nuvio</span>
          </Link>
          <span className="hidden items-center gap-2 text-sm text-[#577060] sm:flex"><ShieldCheck size={17} /> Atendimento seguro</span>
        </header>

        <section className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#bfe4ca] bg-[#eaf8ee] px-3 py-1 text-xs font-semibold text-[#18733a]"><span className="h-2 w-2 rounded-full bg-[#35b75b]" /> Suporte online</span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">Como podemos ajudar?</h1>
          <p className="mt-4 text-lg leading-8 text-[#5d7164]">Escolha o canal que funciona melhor para você. Nossa equipe está pronta para resolver sua solicitação.</p>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-2">
          {choices.map(({ href, icon: Icon, title, description, cta, featured }) => (
            <Link key={href} href={href} className={`group rounded-[28px] border p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${featured ? "border-[#15913e] bg-[#116d2f] text-white shadow-lg shadow-[#116d2f]/20" : "border-[#d9e5dc] bg-white hover:border-[#9bceaa]"}`}>
              <span className={`grid h-13 w-13 place-items-center rounded-2xl ${featured ? "bg-white/15" : "bg-[#eaf8ee] text-[#147538]"}`}><Icon size={27} /></span>
              <h2 className="mt-7 text-2xl font-semibold">{title}</h2>
              <p className={`mt-3 min-h-14 leading-6 ${featured ? "text-white/75" : "text-[#64766a]"}`}>{description}</p>
              <span className="mt-8 inline-flex items-center gap-2 font-semibold">{cta} <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </section>

        <footer className="mt-12 flex justify-center gap-2 text-sm text-[#718177]"><Clock3 size={17} /> Retornaremos assim que possível.</footer>
      </div>
    </main>
  );
}
