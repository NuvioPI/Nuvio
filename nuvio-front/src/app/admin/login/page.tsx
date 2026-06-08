// app/admin/login/page.tsx

import type { Metadata } from "next/metadata";

export const metadata: Metadata = {
  title: "Nuvio | Admin",
  description: "Faça login para acessar o painel administrativo do Nuvio.",
};

import { Playfair_Display, DM_Sans } from "next/font/google";
import Link from "next/dist/client/link";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export default function LoginPage() {
  return (
    <div className={`${dmSans.className} min-h-screen flex items-center justify-center bg-(--background) p-6`}>

      {/* CARD PRINCIPAL */}
      <div className="w-full max-w-3xl bg-(--admin-card) rounded-2xl border border-(--admin-card-border) shadow-2xl overflow-hidden flex min-h-[520px]">

        {/* LADO ESQUERDO */}
        <div className="w-[44%] relative hidden md:flex flex-col justify-end p-8 bg-[#0a1a0f] overflow-hidden">
          {/* fundo radial */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,#1a4a2a_0%,#0a1a0f_65%)]" />
          {/* grid de pontos */}
          <div className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle, #2fae5a18 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          {/* círculos decorativos */}
          <div className="absolute -top-15 -right-15 w-50 h-50 rounded-full border border-[#2fae5a20]" />
          <div className="absolute -top-7 -right-7 w-32 h-32 rounded-full border border-[#2fae5a30]" />

          {/* conteúdo */}
          <div className="relative z-10">
            <p className="text-[11px] font-light text-[#5fc97a] tracking-[2px] uppercase mb-1">
              Área restrita
            </p>
            <h1 className={`${playfairDisplay.className} text-[28px] text-[#e8f5ee] tracking-tight mb-4`}>
              Nuvio
            </h1>
            <div className="w-8 h-px bg-[#2fae5a55] mb-4" />
            <p className="text-[13px] text-[#5a7a62] leading-relaxed">
              Painel administrativo seguro para gestão centralizada da plataforma.
            </p>
          </div>
        </div>

        {/* LADO DIREITO */}
        <div className="flex-1 p-10 flex flex-col justify-center bg-(--admin-card)">

          {/* badge status */}
          <div className="inline-flex items-center gap-1.5 self-start bg-(--muted) border border-(--border) rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2fae5a]" />
            <span className="text-[11px] text-(--muted-foreground)">Sistema operacional</span>
          </div>

          {/* cabeçalho */}
          <div className="mb-7">
            <h2 className="text-[22px] font-medium text-(--foreground) mb-1">
              Painel Administrativo
            </h2>
            <p className="text-[13px] text-(--muted-foreground)">
              Faça login para continuar
            </p>
          </div>

          {/* formulário */}
          <div className="space-y-4">

            {/* campo usuário */}
            <div>
              <label className="block text-[11px] font-medium text-(--muted-foreground) uppercase tracking-[0.4px] mb-1.5">
                Usuário
              </label>
              <input
                type="text"
                placeholder="seu@email.com"
                className="w-full h-[42px] rounded-[10px] border border-(--input) bg-(--muted) text-(--foreground) text-sm px-3.5 outline-none focus:border-[#2fae5a] transition-colors placeholder:text-(--muted-foreground)"
              />
            </div>

            {/* campo senha */}
            <div>
              <label className="block text-[11px] font-medium text-(--muted-foreground) uppercase tracking-[0.4px] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-[42px] rounded-[10px] border border-(--input) bg-(--muted) text-(--foreground) text-sm px-3.5 pr-10 outline-none focus:border-[#2fae5a] transition-colors placeholder:text-(--muted-foreground)"
                />
                {/* toggle senha — transforme em client component para funcionar */}
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                  aria-label="Mostrar senha"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* botão */}
            <Link href="/admin/dashboard" passHref>
              <button
                type="button"
                className="w-full h-[44px] bg-[#0f6b2e] hover:bg-[#2fae5a] text-white rounded-[10px] text-sm font-medium transition-colors mt-2"
              >
                Entrar no painel
              </button>
            </Link>

            {/* rodapé */}
            <div className="pt-5 border-t border-(--border) mt-2">
              <p className="text-[11px] text-(--muted-foreground) text-center leading-relaxed">
                Esta é uma área restrita. Se você não tem acesso, entre em contato com o administrador do sistema.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}