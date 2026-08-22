"use client";

import {
  Upload,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Usuario = { idUsuario: number; nome: string; email: string };
type Tecnico = { idTecnico: number; nomeUsuario?: string; nome?: string; especialidade?: string };
type Categoria = { idCategoria: number; nomeCategoria: string };
type Sla = { idSLA: number; nomeSLA: string };

type Option = { value: string; label: string };

export default function NovoChamadoPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [slas, setSlas] = useState<Sla[]>([]);
  const [form, setForm] = useState({
    idUsuario: "",
    idTecnico: "",
    idCategoria: "",
    idSLA: "",
    titulo: "",
    prioridade: "Media",
    descricao: "",
  });
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      usuario?.tipo === "Administrador"
        ? apiFetch<{ usuarios: Usuario[] }>("/usuarios")
        : Promise.resolve({ usuarios: usuario ? [{ idUsuario: usuario.id, nome: usuario.nome, email: usuario.email }] : [] }),
      apiFetch<{ tecnicos: Tecnico[] }>("/tecnicos?ativos=1"),
      apiFetch<{ categorias: Categoria[] }>("/categorias"),
      apiFetch<{ slas: Sla[] }>("/sla"),
    ])
      .then(([usuariosRes, tecnicosRes, categoriasRes, slasRes]) => {
        setUsuarios(usuariosRes.usuarios ?? []);
        setTecnicos(tecnicosRes.tecnicos ?? []);
        setCategorias(categoriasRes.categorias ?? []);
        setSlas(slasRes.slas ?? []);
        setForm((atual) => ({
          ...atual,
          idUsuario: String(usuariosRes.usuarios?.[0]?.idUsuario ?? ""),
          idTecnico: String(tecnicosRes.tecnicos?.[0]?.idTecnico ?? ""),
          idCategoria: String(categoriasRes.categorias?.[0]?.idCategoria ?? ""),
          idSLA: String(slasRes.slas?.[0]?.idSLA ?? ""),
        }));
      })
      .catch((cause) => setErro(cause instanceof Error ? cause.message : "Não foi possível carregar os dados do formulário."))
      .finally(() => setCarregando(false));
  }, [usuario]);

  function atualizar(campo: keyof typeof form, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function criarChamado(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso(null);
    setEnviando(true);

    try {
      const resposta = await apiFetch<{ idTicket: number }>("/tickets", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          idUsuario: Number(form.idUsuario),
          idTecnico: Number(form.idTecnico),
          idCategoria: Number(form.idCategoria),
          idSLA: Number(form.idSLA),
        }),
      });
      setSucesso(resposta.idTicket);
    } catch (cause) {
      setErro(cause instanceof Error ? cause.message : "Não foi possível criar o chamado.");
    } finally {
      setEnviando(false);
    }
  }

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
          <form onSubmit={criarChamado} className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8 items-start">
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
                <Select
                  label="Solicitante"
                  value={form.idUsuario}
                  onChange={(value) => atualizar("idUsuario", value)}
                  options={usuarios.map((usuario) => ({ value: String(usuario.idUsuario), label: usuario.nome }))}
                  disabled={carregando || usuarios.length === 0}
                />

                <Input label="E-mail" value={usuarios.find((usuario) => String(usuario.idUsuario) === form.idUsuario)?.email ?? ""} readOnly />

                <Input
                  label="Título do chamado"
                  className="md:col-span-2"
                  value={form.titulo}
                  onChange={(value) => atualizar("titulo", value)}
                  required
                />

                <Select 
                  label="Categoria" 
                  value={form.idCategoria}
                  onChange={(value) => atualizar("idCategoria", value)}
                  options={categorias.map((categoria) => ({ value: String(categoria.idCategoria), label: categoria.nomeCategoria }))}
                  disabled={carregando}
                />

                <Select 
                  label="Prioridade" 
                  value={form.prioridade}
                  onChange={(value) => atualizar("prioridade", value)}
                  options={[{ value: "Baixa", label: "Baixa" }, { value: "Media", label: "Média" }, { value: "Alta", label: "Alta" }]}
                />

                <Select 
                  label="Responsável" 
                  value={form.idTecnico}
                  onChange={(value) => atualizar("idTecnico", value)}
                  options={tecnicos.map((tecnico) => ({ value: String(tecnico.idTecnico), label: tecnico.nomeUsuario || tecnico.nome || `Técnico #${tecnico.idTecnico}` }))}
                  disabled={carregando}
                />

                <Select
                  label="SLA"
                  value={form.idSLA}
                  onChange={(value) => atualizar("idSLA", value)}
                  options={slas.map((sla) => ({ value: String(sla.idSLA), label: sla.nomeSLA }))}
                  disabled={carregando}
                />

                <Select 
                  label="Localização" 
                  options={["Matriz", "Filial SP", "Filial RJ", "Home Office", "Terceiros"].map((localizacao) => ({ value: localizacao, label: localizacao }))}
                />
              </div>

              {/* TEXTAREA */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Descrição
                </label>

                <textarea
                  placeholder="Descreva o problema detalhadamente..."
                  value={form.descricao}
                  onChange={(event) => atualizar("descricao", event.target.value)}
                  required
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

              {erro && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">Não foi possível criar o chamado: {erro}</p>}
              {sucesso && (
                <div role="status" className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-500">
                  <p className="font-semibold">Chamado #{sucesso} criado com sucesso!</p>
                  <p className="mt-1">O chamado foi registrado como aberto.</p>
                  <Link href="/tickets" className="mt-3 inline-block font-semibold underline">
                    Ver meus chamados
                  </Link>
                </div>
              )}

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
                    type="button"
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
                  type="submit"
                  disabled={carregando || enviando || sucesso !== null || !form.idUsuario || !form.idTecnico || !form.idCategoria || !form.idSLA}
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
                  {enviando ? "Criando chamado..." : sucesso ? "Chamado criado" : "Criar chamado"}
                </button>
              </div>
            </aside>
          </form>
        </div>
      </main>
    </div>
  );
}

/* INPUT */

function Input({
  label,
  className,
  value = "",
  onChange,
  readOnly = false,
  required = false,
}: {
  label: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  required?: boolean;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium mb-3 block">
        {label}
      </label>

      <input
        placeholder={`Digite ${label.toLowerCase()}`}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        required={required}
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
  value = "",
  onChange,
  disabled = false,
}: {
  label: string;
  options?: Option[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-3 block">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
        required={Boolean(onChange)}
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
          <option key={option.value} value={option.value}>
            {option.label}
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