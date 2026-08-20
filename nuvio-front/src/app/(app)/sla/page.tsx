"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Sla = {
  idSLA: number;
  nomeSLA: string;
  tempoResposta: number;
  tempoResolucao: number;
  descricao: string;
};

type Formulario = Omit<Sla, "idSLA">;

const vazio: Formulario = {
  nomeSLA: "",
  tempoResposta: 60,
  tempoResolucao: 240,
  descricao: "",
};

export default function SlaPage() {
  const [slas, setSlas] = useState<Sla[]>([]);
  const [form, setForm] = useState<Formulario>(vazio);
  const [editando, setEditando] = useState<number | null>(null);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregar() {
    setCarregando(true);
    try {
      const resposta = await apiFetch<{ slas: Sla[] }>("/sla");
      setSlas(resposta.slas);
      setErro("");
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Não foi possível carregar os SLAs.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { void carregar(); }, []);

  function abrirNovo() {
    setEditando(null);
    setForm(vazio);
    setErro("");
    setAberto(true);
  }

  function abrirEdicao(sla: Sla) {
    setEditando(sla.idSLA);
    setForm({ nomeSLA: sla.nomeSLA, tempoResposta: sla.tempoResposta, tempoResolucao: sla.tempoResolucao, descricao: sla.descricao });
    setErro("");
    setAberto(true);
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (form.tempoResposta <= 0 || form.tempoResolucao <= form.tempoResposta) {
      setErro("O tempo de resolução deve ser maior que o tempo de resposta.");
      return;
    }

    setSalvando(true);
    try {
      await apiFetch(editando ? `/sla/${editando}` : "/sla", {
        method: editando ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      setAberto(false);
      setMensagem(editando ? "SLA atualizado com sucesso." : "SLA criado com sucesso.");
      await carregar();
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Não foi possível salvar o SLA.");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: number) {
    if (!window.confirm("Remover este SLA? Tickets vinculados não podem ser removidos.")) return;
    try {
      await apiFetch(`/sla/${id}`, { method: "DELETE" });
      setMensagem("SLA removido com sucesso.");
      await carregar();
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Não foi possível remover o SLA.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-(--primary)">Atendimento</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-(--foreground)">Automações e SLA</h1>
          <p className="mt-2 text-sm text-(--muted-foreground)">Defina os prazos usados para acompanhar e priorizar os chamados.</p>
        </div>
        <button type="button" onClick={abrirNovo} className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-white hover:bg-(--primary-hover)"><Plus className="h-4 w-4" /> Novo SLA</button>
      </div>

      {erro && <div role="alert" className="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-600">{erro}</div>}
      {mensagem && <div role="status" className="mb-5 rounded-xl border border-green-500/25 bg-green-500/10 p-4 text-sm text-green-700">{mensagem}</div>}

      <section className="overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-(--shadow)">
        <div className="border-b border-(--border) px-5 py-4"><h2 className="font-semibold text-(--foreground)">Políticas cadastradas</h2></div>
        {carregando ? <p className="p-8 text-center text-sm text-(--muted-foreground)">Carregando SLAs...</p> : slas.length === 0 ? <p className="p-8 text-center text-sm text-(--muted-foreground)">Nenhum SLA cadastrado.</p> : (
          <div className="divide-y divide-(--border)">
            {slas.map((sla) => <div key={sla.idSLA} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h3 className="font-medium text-(--foreground)">{sla.nomeSLA}</h3><p className="mt-1 text-sm text-(--muted-foreground)">{sla.descricao}</p><p className="mt-2 text-xs text-(--muted-foreground)">Resposta: {formatarMinutos(sla.tempoResposta)} · Resolução: {formatarMinutos(sla.tempoResolucao)}</p></div>
              <div className="flex shrink-0 gap-2"><button type="button" onClick={() => abrirEdicao(sla)} className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) px-3 py-2 text-xs text-(--foreground) hover:bg-(--muted)"><Pencil className="h-3.5 w-3.5" /> Editar</button><button type="button" onClick={() => void remover(sla.idSLA)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 px-3 py-2 text-xs text-red-600 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /> Remover</button></div>
            </div>)}
          </div>
        )}
      </section>

      {aberto && <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true"><form onSubmit={salvar} className="w-full max-w-lg rounded-2xl border border-(--border) bg-(--card) p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold text-(--foreground)">{editando ? "Editar SLA" : "Novo SLA"}</h2><button type="button" onClick={() => setAberto(false)} aria-label="Fechar" className="rounded-lg p-1 text-(--muted-foreground) hover:bg-(--muted)"><X className="h-5 w-5" /></button></div><div className="space-y-4"><Campo label="Nome"><input required value={form.nomeSLA} onChange={(e) => setForm({ ...form, nomeSLA: e.target.value })} /></Campo><div className="grid gap-4 sm:grid-cols-2"><Campo label="Tempo de resposta (minutos)"><input required min={1} type="number" value={form.tempoResposta} onChange={(e) => setForm({ ...form, tempoResposta: Number(e.target.value) })} /></Campo><Campo label="Tempo de resolução (minutos)"><input required min={1} type="number" value={form.tempoResolucao} onChange={(e) => setForm({ ...form, tempoResolucao: Number(e.target.value) })} /></Campo></div><Campo label="Descrição"><textarea required rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></Campo></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setAberto(false)} className="rounded-xl border border-(--border) px-4 py-2.5 text-sm text-(--muted-foreground)">Cancelar</button><button disabled={salvando} className="rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{salvando ? "Salvando..." : "Salvar SLA"}</button></div></form></div>}
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-(--foreground)">{label}<span className="mt-1.5 block [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-(--border) [&>input]:bg-(--background) [&>input]:px-3 [&>input]:py-2.5 [&>input]:outline-none [&>textarea]:w-full [&>textarea]:rounded-xl [&>textarea]:border [&>textarea]:border-(--border) [&>textarea]:bg-(--background) [&>textarea]:px-3 [&>textarea]:py-2.5 [&>textarea]:outline-none">{children}</span></label>; }
function formatarMinutos(minutos: number) { return minutos >= 60 ? `${Math.floor(minutos / 60)}h${minutos % 60 ? ` ${minutos % 60}min` : ""}` : `${minutos}min`; }
