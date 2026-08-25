"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Search, Shield, Users, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import UserManagementPanel from "@/components/admin/UserManagementPanel";

type Usuario = {
  idUsuario: number;
  nome: string;
  email: string;
  cargo: string;
  setor: string;
  tipo: string;
};

type TipoUsuario = { idtipoUsuario: number; descricao: string };
type Formulario = { nome: string; email: string; senha: string; cargo: string; setor: string; idtipoUsuario: string };

const formularioInicial: Formulario = { nome: "", email: "", senha: "", cargo: "", setor: "", idtipoUsuario: "" };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tipos, setTipos] = useState<TipoUsuario[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState<Formulario>(formularioInicial);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarUsuarios() {
    const dados = await apiFetch<{ usuarios: Usuario[] }>("/usuarios");
    setUsuarios(dados.usuarios);
  }

  useEffect(() => {
    let ativo = true;

    Promise.all([
      apiFetch<{ usuarios: Usuario[] }>("/usuarios"),
      apiFetch<{ tiposUsuario: TipoUsuario[] }>("/tipos-usuario"),
    ])
      .then(([usuariosDados, tiposDados]) => {
        if (!ativo) return;
        setUsuarios(usuariosDados.usuarios);
        setTipos(tiposDados.tiposUsuario);
        if (tiposDados.tiposUsuario.length > 0) {
          const tecnico = tiposDados.tiposUsuario.find((tipo) => tipo.descricao.toLowerCase().normalize("NFD").includes("tec"));
          setForm((atual) => ({ ...atual, idtipoUsuario: String((tecnico ?? tiposDados.tiposUsuario[0]).idtipoUsuario) }));
        }
      })
      .catch((causa) => {
        if (ativo) setErro(causa instanceof Error ? causa.message : "Não foi possível carregar os usuários.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const filtrados = useMemo(
    () => usuarios.filter((usuario) => `${usuario.nome} ${usuario.email} ${usuario.cargo} ${usuario.tipo}`.toLowerCase().includes(busca.toLowerCase())),
    [usuarios, busca]
  );
  const administradores = usuarios.filter((usuario) => usuario.tipo === "Administrador").length;

  function abrirCadastro() {
    setForm((atual) => ({ ...formularioInicial, idtipoUsuario: atual.idtipoUsuario || (tipos[0] ? String(tipos[0].idtipoUsuario) : "") }));
    setErro("");
    setMensagem("");
    setAberto(true);
  }

  async function cadastrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setMensagem("");

    if (!form.idtipoUsuario) {
      setErro("Selecione o perfil do usuário.");
      return;
    }

    setSalvando(true);
    try {
      await apiFetch("/usuarios", { method: "POST", body: JSON.stringify({ ...form, idtipoUsuario: Number(form.idtipoUsuario) }) });
      await carregarUsuarios();
      setAberto(false);
      setForm((atual) => ({ ...formularioInicial, idtipoUsuario: atual.idtipoUsuario }));
      setMensagem("Usuário cadastrado com sucesso.");
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Não foi possível cadastrar o usuário.");
    } finally {
      setSalvando(false);
    }
  }

  return <div className="flex min-h-screen bg-(--background) text-(--foreground)"><main className="flex-1 p-8">
    <div id="gerenciamento" className="mb-8"><UserManagementPanel /></div>
    <div className="mb-10 flex items-center justify-between gap-4"><div><h1 className="page-title">Usuários</h1><p className="page-subtitle mt-2">Gerencie os usuários cadastrados no sistema.</p></div><button type="button" onClick={abrirCadastro} className="btn-primary flex items-center gap-2 px-6 py-3"><Plus size={18} />Novo usuário</button></div>
    {mensagem && <div role="status" className="mb-5 rounded-xl border border-green-500/25 bg-green-500/10 p-4 text-sm text-green-700">{mensagem}</div>}
    {erro && !aberto && <div role="alert" className="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-600">{erro}</div>}
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"><StatCard title="Total de usuários" value={usuarios.length} icon={<Users size={22} />} /><StatCard title="Administradores" value={administradores} icon={<Shield size={22} />} /><StatCard title="Exibidos" value={filtrados.length} icon={<Users size={22} />} /></div>
    <div className="mb-6 rounded-[28px] border border-(--border) bg-(--card) p-6 shadow-(--shadow)"><div className="relative"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted-foreground)" /><input value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Buscar usuário..." className="w-full rounded-xl border border-(--border) bg-(--background) py-4 pl-12 outline-none" /></div></div>
    <div className="overflow-hidden rounded-[28px] border border-(--border) bg-(--card) shadow-(--shadow)"><div className="border-b border-(--border) p-6"><h2 className="text-xl font-semibold">Lista de usuários</h2></div><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-(--border) text-left"><th className="p-5">Usuário</th><th className="p-5">E-mail</th><th className="p-5">Cargo</th><th className="p-5">Setor</th><th className="p-5">Perfil</th></tr></thead><tbody>
      {carregando && <tr><td colSpan={5} className="p-8 text-center text-(--muted-foreground)">Carregando usuários...</td></tr>}
      {!carregando && !erro && filtrados.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-(--muted-foreground)">Nenhum usuário encontrado.</td></tr>}
      {filtrados.map((usuario) => <tr key={usuario.idUsuario} className="border-b border-(--border) hover:bg-(--muted)"><td className="p-5 font-medium">{usuario.nome}</td><td className="p-5 text-(--muted-foreground)">{usuario.email}</td><td className="p-5">{usuario.cargo || "—"}</td><td className="p-5">{usuario.setor || "—"}</td><td className="p-5"><span className="badge-success">{usuario.tipo}</span></td></tr>)}
    </tbody></table></div></div>

    {aberto && <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true"><form onSubmit={cadastrar} className="w-full max-w-lg rounded-2xl border border-(--border) bg-(--card) p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Novo usuário</h2><p className="mt-1 text-sm text-(--muted-foreground)">Preencha os dados de acesso e o perfil.</p></div><button type="button" onClick={() => setAberto(false)} aria-label="Fechar" className="rounded-lg p-1 text-(--muted-foreground) hover:bg-(--muted)"><X className="h-5 w-5" /></button></div>{erro && <p role="alert" className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-600">{erro}</p>}<div className="space-y-4"><Campo label="Nome completo"><input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></Campo><Campo label="E-mail"><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Campo><Campo label="Senha"><input required minLength={8} type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} /></Campo><div className="grid gap-4 sm:grid-cols-2"><Campo label="Cargo"><input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} /></Campo><Campo label="Setor"><input value={form.setor} onChange={(e) => setForm({ ...form, setor: e.target.value })} /></Campo></div><Campo label="Perfil"><select required value={form.idtipoUsuario} onChange={(e) => setForm({ ...form, idtipoUsuario: e.target.value })}><option value="">Selecione</option>{tipos.map((tipo) => <option key={tipo.idtipoUsuario} value={tipo.idtipoUsuario}>{tipo.descricao}</option>)}</select></Campo></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setAberto(false)} className="rounded-xl border border-(--border) px-4 py-2.5 text-sm text-(--muted-foreground)">Cancelar</button><button disabled={salvando} className="rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{salvando ? "Salvando..." : "Cadastrar"}</button></div></form></div>}
  </main></div>;
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-(--foreground)">{label}<span className="mt-1.5 block [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-(--border) [&>input]:bg-(--background) [&>input]:px-3 [&>input]:py-2.5 [&>input]:outline-none [&>select]:w-full [&>select]:rounded-xl [&>select]:border [&>select]:border-(--border) [&>select]:bg-(--background) [&>select]:px-3 [&>select]:py-2.5 [&>select]:outline-none">{children}</span></label>; }
function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) { return <div className="rounded-[28px] border border-(--border) bg-(--card) p-6 shadow-(--shadow)"><div className="flex items-center justify-between"><div><p className="text-sm text-(--muted-foreground)">{title}</p><h2 className="mt-2 text-4xl font-bold">{value}</h2></div><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--primary) text-(--primary-foreground)">{icon}</div></div></div>; }
