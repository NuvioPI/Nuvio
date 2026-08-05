"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Shield, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Usuario = { idUsuario: number; nome: string; email: string; cargo: string; setor: string; tipo: string };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    apiFetch<{ usuarios: Usuario[] }>("/usuarios")
      .then((dados) => setUsuarios(dados.usuarios))
      .catch((causa) => setErro(causa instanceof Error ? causa.message : "Não foi possível carregar os usuários."))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = useMemo(() => usuarios.filter((usuario) => `${usuario.nome} ${usuario.email} ${usuario.cargo} ${usuario.tipo}`.toLowerCase().includes(busca.toLowerCase())), [usuarios, busca]);
  const administradores = usuarios.filter((usuario) => usuario.tipo === "Administrador").length;

  return <div className="flex min-h-screen bg-(--background) text-(--foreground)"><main className="flex-1 p-8">
    <div className="flex items-center justify-between mb-10"><div><h1 className="page-title">Usuários</h1><p className="page-subtitle mt-2">Gerencie os usuários cadastrados no sistema.</p></div>
      <button type="button" disabled className="btn-primary px-6 py-3 flex items-center gap-2 opacity-60" title="O cadastro será integrado na próxima etapa"><Plus size={18} />Novo usuário</button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"><StatCard title="Total de usuários" value={usuarios.length} icon={<Users size={22} />} /><StatCard title="Administradores" value={administradores} icon={<Shield size={22} />} /><StatCard title="Exibidos" value={filtrados.length} icon={<Users size={22} />} /></div>
    <div className="bg-(--card) border border-(--border) rounded-[28px] p-6 mb-6 shadow-(--shadow)"><div className="relative"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted-foreground)" /><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar usuário..." className="w-full pl-12 py-4 rounded-xl border border-(--border) bg-(--background) outline-none" /></div></div>
    <div className="bg-(--card) border border-(--border) rounded-[28px] overflow-hidden shadow-(--shadow)"><div className="p-6 border-b border-(--border)"><h2 className="text-xl font-semibold">Lista de usuários</h2></div><div className="overflow-x-auto"><table className="w-full"><thead><tr className="text-left border-b border-(--border)"><th className="p-5">Usuário</th><th className="p-5">E-mail</th><th className="p-5">Cargo</th><th className="p-5">Setor</th><th className="p-5">Perfil</th></tr></thead><tbody>
      {carregando && <tr><td colSpan={5} className="p-8 text-center text-(--muted-foreground)">Carregando usuários...</td></tr>}
      {erro && <tr><td colSpan={5} className="p-8 text-center text-red-500">{erro}</td></tr>}
      {!carregando && !erro && filtrados.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-(--muted-foreground)">Nenhum usuário encontrado.</td></tr>}
      {filtrados.map((usuario) => <tr key={usuario.idUsuario} className="border-b border-(--border) hover:bg-(--muted)"><td className="p-5 font-medium">{usuario.nome}</td><td className="p-5 text-(--muted-foreground)">{usuario.email}</td><td className="p-5">{usuario.cargo || "—"}</td><td className="p-5">{usuario.setor || "—"}</td><td className="p-5"><span className="badge-success">{usuario.tipo}</span></td></tr>)}
    </tbody></table></div></div>
  </main></div>;
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) { return <div className="bg-(--card) border border-(--border) rounded-[28px] p-6 shadow-(--shadow)"><div className="flex justify-between items-center"><div><p className="text-(--muted-foreground) text-sm">{title}</p><h2 className="text-4xl font-bold mt-2">{value}</h2></div><div className="h-14 w-14 rounded-2xl bg-(--primary) text-(--primary-foreground) flex items-center justify-center">{icon}</div></div></div>; }
