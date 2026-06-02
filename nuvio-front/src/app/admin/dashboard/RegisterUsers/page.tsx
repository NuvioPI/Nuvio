// app/admin/clientes/novo/page.tsx
"use client";

import { useState } from "react";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500"] });

export default function NovoClientePage() {
  const [tags, setTags] = useState<string[]>(["VIP"]);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    cargo: "",
    empresa: "",
    site: "",
    idioma: "Português (BR)",
    timezone: "America/Sao_Paulo (UTC -3)",
    observacoes: "",
    emailBoasVindas: true,
    verificado: false,
    inscrito: true,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [target.name]: target.type === "checkbox" ? target.checked : target.value,
    }));
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  }

  function removeTag(index: number) {
    setTags((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    console.log({ ...form, tags });
    // chamar sua action/API aqui
  }

  return (
    <div className={`${dmSans.className} min-h-screen bg-(--background) p-6`}>
      <div className="max-w-2xl mx-auto">

        {/* CARD */}
        <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-(--border)">
            <div className="w-10 h-10 rounded-full bg-[#eaf3de] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b6d11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <div>
              <h1 className="text-[15px] font-medium text-(--foreground) m-0">Novo cliente</h1>
              <p className="text-[12px] text-(--muted-foreground) m-0">Cadastre um contato no Freshdesk</p>
            </div>
            <span className="ml-auto text-[11px] font-medium bg-[#eaf3de] text-[#3b6d11] rounded-full px-2.5 py-0.5">
              Novo
            </span>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-6">

            {/* INFORMAÇÕES PESSOAIS */}
            <section>
              <p className="text-[11px] font-medium text-(--muted-foreground) uppercase tracking-[.6px] mb-3.5">
                Informações pessoais
              </p>
              <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                <Field label="Nome" required>
                  <input name="nome" value={form.nome} onChange={handleChange} placeholder="João" className={inputCls} />
                </Field>
                <Field label="Sobrenome">
                  <input name="sobrenome" value={form.sobrenome} onChange={handleChange} placeholder="Silva" className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                <Field label="E-mail" required>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="joao@empresa.com" className={inputCls} />
                </Field>
                <Field label="Telefone">
                  <input name="telefone" type="tel" value={form.telefone} onChange={handleChange} placeholder="+55 11 90000-0000" className={inputCls} />
                </Field>
              </div>
              <Field label="Cargo / Função">
                <input name="cargo" value={form.cargo} onChange={handleChange} placeholder="Gerente de TI" className={inputCls} />
              </Field>
            </section>

            <div className="h-px bg-(--border)" />

            {/* EMPRESA */}
            <section>
              <p className="text-[11px] font-medium text-(--muted-foreground) uppercase tracking-[.6px] mb-3.5">
                Empresa
              </p>
              <div className="grid grid-cols-2 gap-3.5">
                <Field label="Nome da empresa">
                  <input name="empresa" value={form.empresa} onChange={handleChange} placeholder="Empresa Ltda." className={inputCls} />
                </Field>
                <Field label="Site">
                  <input name="site" type="url" value={form.site} onChange={handleChange} placeholder="https://empresa.com.br" className={inputCls} />
                </Field>
              </div>
            </section>

            <div className="h-px bg-(--border)" />

            {/* CONFIGURAÇÕES */}
            <section>
              <p className="text-[11px] font-medium text-(--muted-foreground) uppercase tracking-[.6px] mb-3.5">
                Configurações do contato
              </p>
              <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                <Field label="Idioma">
                  <select name="idioma" value={form.idioma} onChange={handleChange} className={inputCls}>
                    <option>Português (BR)</option>
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </Field>
                <Field label="Fuso horário">
                  <select name="timezone" value={form.timezone} onChange={handleChange} className={inputCls}>
                    <option>America/Sao_Paulo (UTC -3)</option>
                    <option>America/Manaus (UTC -4)</option>
                    <option>America/Belem (UTC -3)</option>
                    <option>America/Fortaleza (UTC -3)</option>
                  </select>
                </Field>
              </div>

              {/* TAGS */}
              <Field label="Tags" hint="Pressione Enter para adicionar">
                <div
                  className="flex flex-wrap gap-1.5 min-h-[38px] px-2.5 py-2 bg-(--muted) border border-(--input) rounded-xl cursor-text"
                  onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}
                >
                  {tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-[#eaf3de] text-[#3b6d11] rounded-full px-2.5 py-0.5 text-[12px]">
                      {tag}
                      <button type="button" onClick={() => removeTag(i)} className="leading-none hover:opacity-60" aria-label={`Remover ${tag}`}>×</button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder={tags.length === 0 ? "Adicionar tag..." : ""}
                    className="border-none bg-transparent outline-none text-[13px] text-(--foreground) min-w-[80px] flex-1 p-0"
                  />
                </div>
              </Field>

              {/* OBSERVAÇÕES */}
              <Field label="Observações">
                <textarea
                  name="observacoes"
                  value={form.observacoes}
                  onChange={handleChange}
                  placeholder="Informações adicionais sobre o cliente..."
                  rows={3}
                  className={`${inputCls} h-auto py-2.5 resize-none`}
                />
              </Field>

              {/* CHECKBOXES */}
              <div className="flex flex-col gap-2.5 mt-4">
                {[
                  { name: "emailBoasVindas", label: "Enviar e-mail de boas-vindas ao cliente" },
                  { name: "verificado", label: "Marcar como contato verificado" },
                  { name: "inscrito", label: "Inscrever em atualizações de produto" },
                ].map(({ name, label }) => (
                  <label key={name} className="flex items-center gap-2 text-[13px] text-(--foreground) cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name={name}
                      checked={form[name as keyof typeof form] as boolean}
                      onChange={handleChange}
                      className="w-4 h-4 accent-[#0f6b2e] flex-shrink-0"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-(--border)">
            <p className="text-[12px] text-(--muted-foreground)">
              <span className="text-[#e5484d]">*</span> Campos obrigatórios
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="h-[34px] px-4 text-[13px] text-(--muted-foreground) bg-transparent border border-(--border) rounded-xl hover:bg-(--muted) transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="h-[34px] px-5 text-[13px] font-medium text-white bg-[#0f6b2e] rounded-xl hover:bg-[#2fae5a] transition-colors flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Cadastrar cliente
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// helpers
const inputCls =
  "w-full h-[38px] bg-(--muted) border border-(--input) rounded-xl text-[13px] text-(--foreground) px-3 outline-none focus:border-[#2fae5a] transition-colors placeholder:text-(--muted-foreground)";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-(--muted-foreground)">
        {label}
        {required && <span className="text-[#e5484d] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-(--muted-foreground)">{hint}</p>}
    </div>
  );
}