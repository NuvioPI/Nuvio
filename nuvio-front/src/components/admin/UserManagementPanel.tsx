"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Edit3,
  LoaderCircle,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserRound,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";

type Perfil = "Cliente" | "Técnico" | "Gerente" | "Administrador";

type Usuario = {
  idUsuario: number;
  nome: string;
  email: string;
  cargo?: string | null;
  setor?: string | null;
  tipo: string;
  nivelAcesso?: string | null;
  verificado?: boolean | number | string | null;
};

type Formulario = {
  nome: string;
  email: string;
  cargo: string;
  setor: string;
  senha: string;
  perfil: Perfil;
  verificado: boolean;
};

const formularioVazio: Formulario = {
  nome: "",
  email: "",
  cargo: "",
  setor: "",
  senha: "",
  perfil: "Cliente",
  verificado: false,
};

function perfilDoUsuario(usuario: Usuario): Perfil {
  if (usuario.tipo === "Administrador" && usuario.nivelAcesso === "gerente") {
    return "Gerente";
  }

  if (["Cliente", "Técnico", "Administrador"].includes(usuario.tipo)) {
    return usuario.tipo as Perfil;
  }

  return "Cliente";
}

function estaVerificado(usuario: Usuario) {
  return usuario.verificado === true || usuario.verificado === 1 || usuario.verificado === "1";
}

export default function UserManagementPanel() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [removendoId, setRemovendoId] = useState<number | null>(null);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<Usuario | null>(null);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<Formulario>(formularioVazio);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarUsuarios() {
    setCarregando(true);
    try {
      const dados = await apiFetch<{ usuarios: Usuario[] }>("/usuarios");
      setUsuarios(dados.usuarios ?? []);
      setErro("");
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Não foi possível carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    let ativo = true;

    apiFetch<{ usuarios: Usuario[] }>("/usuarios")
      .then((dados) => {
        if (ativo) setUsuarios(dados.usuarios ?? []);
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

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return usuarios;

    return usuarios.filter((usuario) => {
      const texto = `${usuario.nome} ${usuario.email} ${usuario.cargo ?? ""} ${usuario.setor ?? ""} ${perfilDoUsuario(usuario)}`;
      return texto.toLowerCase().includes(termo);
    });
  }, [busca, usuarios]);

  const verificados = usuarios.filter(estaVerificado).length;
  const administradores = usuarios.filter((usuario) => ["Administrador", "Gerente"].includes(perfilDoUsuario(usuario))).length;

  function abrirEdicao(usuario: Usuario) {
    setEditando(usuario);
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo ?? "",
      setor: usuario.setor ?? "",
      senha: "",
      perfil: perfilDoUsuario(usuario),
      verificado: estaVerificado(usuario),
    });
    setErro("");
    setMensagem("");
  }

  function fecharEdicao() {
    if (salvando) return;
    setEditando(null);
    setForm(formularioVazio);
    setErro("");
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!editando) return;

    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      await apiFetch(`/usuarios/${editando.idUsuario}/gerenciamento`, {
        method: "PATCH",
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          cargo: form.cargo,
          setor: form.setor,
          perfil: form.perfil,
          verificado: form.verificado,
          ...(form.senha ? { senha: form.senha } : {}),
        }),
      });

      await carregarUsuarios();
      setEditando(null);
      setMensagem("Usuário atualizado com sucesso.");
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Não foi possível atualizar o usuário.");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarVerificado(usuario: Usuario) {
    setErro("");
    setMensagem("");

    try {
      await apiFetch(`/usuarios/${usuario.idUsuario}/gerenciamento`, {
        method: "PATCH",
        body: JSON.stringify({
          nome: usuario.nome,
          email: usuario.email,
          cargo: usuario.cargo ?? "",
          setor: usuario.setor ?? "",
          perfil: perfilDoUsuario(usuario),
          verificado: !estaVerificado(usuario),
        }),
      });
      await carregarUsuarios();
      setMensagem(estaVerificado(usuario) ? "Usuário marcado como não verificado." : "Usuário verificado com sucesso.");
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Não foi possível alterar a verificação.");
    }
  }

  function excluir(usuario: Usuario) {
    setUsuarioParaExcluir(usuario);
    setErro("");
    setMensagem("");
  }

  async function confirmarExclusao() {
    if (!usuarioParaExcluir) return;

    const usuario = usuarioParaExcluir;
    setRemovendoId(usuario.idUsuario);
    setErro("");
    setMensagem("");

    try {
      await apiFetch(`/usuarios/${usuario.idUsuario}`, { method: "DELETE" });
      setUsuarios((atuais) => atuais.filter((item) => item.idUsuario !== usuario.idUsuario));
      setMensagem("Usuário removido com sucesso.");
      setUsuarioParaExcluir(null);
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Não foi possível remover o usuário.");
    } finally {
      setRemovendoId(null);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-(--border) bg-(--admin-card) p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[.6px] text-(--muted-foreground)">Administração</span>
          <h2 className="mt-1 text-lg font-medium text-(--foreground)">Gerenciar usuários</h2>
          <p className="mt-1 text-xs text-(--muted-foreground)">Edite dados, verifique contas, altere perfis ou remova acessos.</p>
        </div>
        <Link href="/users" className="inline-flex items-center justify-center rounded-lg border border-(--border) px-3 py-2 text-xs font-medium text-(--foreground) transition hover:bg-(--muted)">
          Abrir cadastro completo
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Resumo label="Usuários" value={usuarios.length} icon={<UserRound size={15} />} />
        <Resumo label="Verificados" value={verificados} icon={<UserCheck size={15} />} />
        <Resumo label="Admin / gerente" value={administradores} icon={<Shield size={15} />} />
      </div>

      {mensagem && <div role="status" className="rounded-lg border border-green-500/25 bg-green-500/10 p-3 text-xs text-green-700">{mensagem}</div>}
      {erro && <div role="alert" className="rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-600">{erro}</div>}

      <div className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--muted-foreground)">
        <Search size={15} />
        <input value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Buscar por nome, e-mail ou perfil" className="min-w-0 flex-1 bg-transparent text-xs text-(--foreground) outline-none placeholder:text-(--muted-foreground)" />
      </div>

      <div className="overflow-x-auto rounded-lg border border-(--border)">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="border-b border-(--border) text-(--muted-foreground)">
            <tr>
              <th className="p-3 font-medium">Usuário</th>
              <th className="p-3 font-medium">Perfil</th>
              <th className="p-3 font-medium">Verificação</th>
              <th className="p-3 font-medium">Cadastro</th>
              <th className="p-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando && <tr><td colSpan={5} className="p-6 text-center text-(--muted-foreground)">Carregando usuários...</td></tr>}
            {!carregando && filtrados.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-(--muted-foreground)">Nenhum usuário encontrado.</td></tr>}
            {filtrados.map((usuario) => (
              <tr key={usuario.idUsuario} className="border-b border-(--border) last:border-b-0">
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-(--primary)/10 text-(--primary)"><UserRound size={15} /></span>
                    <div className="min-w-0"><p className="truncate font-medium text-(--foreground)">{usuario.nome}</p><p className="truncate text-[11px] text-(--muted-foreground)">{usuario.email}</p></div>
                  </div>
                </td>
                <td className="p-3"><span className="inline-flex items-center gap-1 rounded-full bg-(--muted) px-2 py-1 text-[11px] text-(--foreground)"><BriefcaseBusiness size={12} />{perfilDoUsuario(usuario)}</span></td>
                <td className="p-3">{estaVerificado(usuario) ? <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 size={14} />Verificado</span> : <span className="text-(--muted-foreground)">Pendente</span>}</td>
                <td className="p-3 text-(--muted-foreground)">{usuario.cargo || usuario.setor || "Sem cargo informado"}</td>
                <td className="p-3"><div className="flex justify-end gap-1">
                  <button type="button" onClick={() => alternarVerificado(usuario)} title={estaVerificado(usuario) ? "Marcar como não verificado" : "Marcar como verificado"} className="rounded-md p-2 text-green-700 transition hover:bg-green-500/10"><Check size={15} /></button>
                  <button type="button" onClick={() => abrirEdicao(usuario)} title="Editar usuário" className="rounded-md p-2 text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"><Edit3 size={15} /></button>
                  <button type="button" onClick={() => excluir(usuario)} disabled={removendoId === usuario.idUsuario} title="Excluir usuário" className="rounded-md p-2 text-red-600 transition hover:bg-red-500/10 disabled:opacity-50"><Trash2 size={15} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
        <form onSubmit={salvar} className="w-full max-w-lg rounded-xl border border-(--border) bg-(--card) p-5 shadow-2xl">
          <div className="mb-5 flex items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-(--foreground)">Editar usuário</h3><p className="mt-1 text-xs text-(--muted-foreground)">Altere o perfil para promover a administrador ou gerente.</p></div><button type="button" onClick={fecharEdicao} aria-label="Fechar" className="rounded-md p-1 text-(--muted-foreground) hover:bg-(--muted)"><X size={17} /></button></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="Nome"><input required value={form.nome} onChange={(evento) => setForm({ ...form, nome: evento.target.value })} /></Campo>
            <Campo label="E-mail"><input required type="email" value={form.email} onChange={(evento) => setForm({ ...form, email: evento.target.value })} /></Campo>
            <Campo label="Cargo"><input value={form.cargo} onChange={(evento) => setForm({ ...form, cargo: evento.target.value })} /></Campo>
            <Campo label="Setor"><input value={form.setor} onChange={(evento) => setForm({ ...form, setor: evento.target.value })} /></Campo>
            <Campo label="Perfil"><select value={form.perfil} onChange={(evento) => setForm({ ...form, perfil: evento.target.value as Perfil })}><option>Cliente</option><option>Técnico</option><option>Gerente</option><option>Administrador</option></select></Campo>
            <Campo label="Nova senha"><input type="password" minLength={8} value={form.senha} onChange={(evento) => setForm({ ...form, senha: evento.target.value })} placeholder="Opcional" /></Campo>
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-(--foreground)"><input type="checkbox" checked={form.verificado} onChange={(evento) => setForm({ ...form, verificado: evento.target.checked })} /> Conta verificada</label>
          <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={fecharEdicao} className="rounded-lg border border-(--border) px-3 py-2 text-xs text-(--muted-foreground)">Cancelar</button><button type="submit" disabled={salvando} className="inline-flex items-center gap-2 rounded-lg bg-(--primary) px-3 py-2 text-xs font-medium text-(--primary-foreground) disabled:opacity-50">{salvando && <LoaderCircle size={14} className="animate-spin" />}{salvando ? "Salvando..." : "Salvar alterações"}</button></div>
        </form>
      </div>}
      <ConfirmModal
        open={usuarioParaExcluir !== null}
        title="Excluir usuário"
        message={usuarioParaExcluir ? `Excluir permanentemente ${usuarioParaExcluir.nome}? Os registros vinculados também serão removidos.` : ""}
        loading={removendoId !== null}
        onCancel={() => { if (removendoId === null) setUsuarioParaExcluir(null); }}
        onConfirm={() => void confirmarExclusao()}
      />
    </section>
  );
}

function Resumo({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div className="flex items-center gap-2 rounded-lg border border-(--border) p-3"><span className="text-(--primary)">{icon}</span><div><p className="text-[11px] text-(--muted-foreground)">{label}</p><p className="text-sm font-semibold text-(--foreground)">{value}</p></div></div>;
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-(--foreground)">{label}<span className="mt-1 block [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-(--border) [&>input]:bg-(--background) [&>input]:px-3 [&>input]:py-2 [&>input]:text-xs [&>input]:outline-none [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-(--border) [&>select]:bg-(--background) [&>select]:px-3 [&>select]:py-2 [&>select]:text-xs [&>select]:outline-none">{children}</span></label>;
}
