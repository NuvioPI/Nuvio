"use client";

import {
  Upload,
  Plus,
} from "lucide-react";

export default function NovoChamadoPage() {
  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* CONTENT */}
      <main className="flex-1">
        {/* PAGE */}
        <div className="p-6 md:p-10">
          {/* TITLE */}
          <div className="mb-10">
            <h1 className="text-4xl font-semibold tracking-tight">
              Novo chamado
            </h1>

            <p className="text-zinc-500 mt-2 text-lg">
              Preencha os dados para abrir um novo ticket.
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8 items-start">
            {/* FORM */}
            <section
              className="
                bg-[var(--card)]
                rounded-[32px]

                border border-[var(--border)]

                p-8 md:p-10

                shadow-[0_10px_40px_rgba(0,0,0,0.04)]

                space-y-8
              "
            >
              {/* HEADER */}
              <div>
                <h2 className="text-3xl font-semibold">
                  Informações do chamado
                </h2>

                <p className="text-[var(--muted-foreground)] mt-2">
                  Dados principais do ticket
                </p>
              </div>

              {/* FORM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Input label="Solicitante" />

                <Input label="E-mail" />

                <Input
                  label="Título do chamado"
                  className="md:col-span-2"
                />

                <Select 
                  label="Categoria" 
                  options={[
                    "Software", 
                    "Hardware", 
                    "Rede", 
                    "Acessos/Permissões", 
                    "Infraestrutura", 
                    "Telefonia", 
                    "Outros"
                  ]} 
                />

                <Select 
                  label="Prioridade" 
                  options={["Baixa", "Média", "Alta", "Urgente", "Crítica"]} 
                />

                <Select 
                  label="Responsável" 
                  options={[
                    "Suporte Nível 1", 
                    "Suporte Nível 2", 
                    "Time de Infraestrutura", 
                    "Time de Desenvolvimento", 
                    "Segurança da Informação"
                  ]} 
                />

                <Select 
                  label="Localização" 
                  options={["Matriz", "Filial SP", "Filial RJ", "Home Office", "Terceiros"]} 
                />
              </div>

              {/* TEXTAREA */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Descrição
                </label>

                <textarea
                  placeholder="Descreva o problema detalhadamente..."
                  className="
                    w-full
                    min-h-[220px]

                    rounded-2xl

                    border border-[var(--border)]

                    bg-[var(--background)]

                    p-5

                    resize-none

                    outline-none

                    transition-all duration-200

                    focus:border-green-500
                    focus:ring-4
                    focus:ring-green-500/10
                  "
                />
              </div>

              {/* UPLOAD */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Anexos
                </label>

                <div
                  className="
                    border
                    border-dashed
                    border-[var(--border)]

                    rounded-[28px]

                    p-10

                    flex
                    flex-col
                    items-center
                    justify-center

                    text-center

                    bg-[var(--muted)]/20
                  "
                >
                  <div
                    className="
                      h-16
                      w-16

                      rounded-2xl

                      bg-gradient-to-br
                      from-green-500
                      to-emerald-600

                      flex
                      items-center
                      justify-center

                      text-white

                      mb-5

                      shadow-lg
                      shadow-green-500/20
                    "
                  >
                    <Upload size={28} />
                  </div>

                  <h3 className="text-lg font-semibold">
                    Arraste arquivos aqui
                  </h3>

                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    PNG, JPG, PDF, DOCX até 10MB
                  </p>

                  <button
                    className="
                      mt-6

                      rounded-2xl

                      bg-[#32B35A]
                      hover:bg-[#2da14f]

                      px-6 py-3

                      text-white
                      font-medium

                      transition-all duration-200

                      hover:scale-[1.02]
                      active:scale-[0.99]
                    "
                  >
                    Selecionar arquivos
                  </button>
                </div>
              </div>
            </section>

            {/* RIGHT */}
            <aside className="space-y-6">
              {/* SUMMARY */}
              <div
                className="
                  bg-[var(--card)]
                  rounded-[28px]

                  border border-[var(--border)]

                  p-7

                  shadow-[0_8px_30px_rgba(0,0,0,0.04)]
                "
              >
                <h2 className="text-2xl font-semibold mb-6">
                  Resumo
                </h2>

                <div className="space-y-5">
                  <SummaryItem
                    label="Prioridade"
                    value="Alta"
                    type="danger"
                  />

                  <SummaryItem
                    label="Categoria"
                    value="Software"
                  />

                  <SummaryItem
                    label="Responsável"
                    value="Não atribuído"
                  />

                  <SummaryItem
                    label="Status"
                    value="Aberto"
                    type="success"
                  />
                </div>
              </div>

              {/* TIPS */}
              <div
                className="
                  bg-[var(--card)]
                  rounded-[28px]

                  border border-[var(--border)]

                  p-7

                  shadow-[0_8px_30px_rgba(0,0,0,0.04)]
                "
              >
                <h2 className="text-2xl font-semibold mb-6">
                  Dicas
                </h2>

                <ul className="space-y-4 text-sm">
                  <li className="text-[var(--muted-foreground)]">
                    • Seja claro e objetivo
                  </li>

                  <li className="text-[var(--muted-foreground)]">
                    • Explique os passos do problema
                  </li>

                  <li className="text-[var(--muted-foreground)]">
                    • Adicione prints quando possível
                  </li>

                  <li className="text-[var(--muted-foreground)]">
                    • Informe o impacto do problema
                  </li>
                </ul>

                {/* BUTTON */}
                <button
                  className="
                    mt-8
                    w-full

                    flex
                    items-center
                    justify-center
                    gap-3

                    rounded-2xl

                    bg-[#32B35A]
                    hover:bg-[#2da14f]

                    px-6 py-4

                    text-white
                    font-medium
                    text-lg

                    transition-all
                    duration-200

                    shadow-lg
                    shadow-green-900/10

                    hover:scale-[1.01]
                    active:scale-[0.99]
                  "
                >
                  <Plus size={24} strokeWidth={2.5} />
                  Criar chamado
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

/* INPUT */

function Input({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium mb-3 block">
        {label}
      </label>

      <input
        placeholder={`Digite ${label.toLowerCase()}`}
        className="
          w-full

          rounded-2xl

          border border-[var(--border)]

          bg-[var(--background)]

          px-5 py-4

          outline-none

          transition-all duration-200

          focus:border-green-500
          focus:ring-4
          focus:ring-green-500/10
        "
      />
    </div>
  );
}

/* SELECT */

function Select({
  label,
  options = [],
}: {
  label: string;
  options?: string[];
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-3 block">
        {label}
      </label>

      <select
        className="
          w-full

          rounded-2xl

          border border-[var(--border)]

          bg-[var(--background)]

          px-5 py-4

          outline-none

          transition-all duration-200

          focus:border-green-500
          focus:ring-4
          focus:ring-green-500/10
        "
      >
        <option value="">Selecionar {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option.toLowerCase()}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

/* SUMMARY */

function SummaryItem({
  label,
  value,
  type,
}: {
  label: string;
  value: string;
  type?: "success" | "danger";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--muted-foreground)]">
        {label}
      </span>

      <span
        className={`
          px-3
          py-1

          rounded-full

          text-sm
          font-medium

          ${
            type === "success"
              ? "bg-green-100 text-green-700"
              : type === "danger"
              ? "bg-red-100 text-red-700"
              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
          }
        `}
      >
        {value}
      </span>
    </div>
  );
}