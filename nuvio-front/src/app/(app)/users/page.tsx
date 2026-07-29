"use client";
 
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  UserCheck,
  Shield,
  Building,
} from "lucide-react";
 
export default function UsuariosPage() {
  return (
    <div className="flex min-h-screen bg-(--background) text-(--foreground)">
      {/* CONTEÚDO */}
<main className="flex-1 p-8">
        {/* TÍTULO */}
<div className="flex items-center justify-between mb-10">
<div>
<h1 className="page-title">Usuários</h1>
 
<p className="page-subtitle mt-2">
              Gerencie usuários, cargos e permissões.
</p>
</div>
 <button className="btn-primary px-6 py-3 flex items-center gap-2">
<Plus size={18} />
            Novo usuário
</button>
</div>
 
        {/* ESTATÍSTICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
<StatCard
            title="Total de usuários"
            value="128"
            icon={<Users size={22} />}
          />
 
          <StatCard
            title="Ativos"
            value="114"
            icon={<UserCheck size={22} />}
          />
 
          <StatCard
            title="Administradores"
            value="14"
            icon={<Shield size={22} />}
          />

          <StatCard
            title="Empresas"
            value="5"
            icon={<Building size={22} />}
          />

</div>
 
        {/* FILTROS */}
        <div className="bg-(--card) border border-(--border) rounded-[28px] p-6 mb-6 shadow-(--shadow)">
<div className="flex flex-col lg:flex-row gap-4">
<div className="flex-1 relative">
<Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
              />
 
              <input
                placeholder="Buscar usuário..."
                className="w-full pl-12 py-4 rounded-xl border border-(--border) bg-(--background) focus:border-(--ring) outline-none transition-colors"
              />
</div>
 
            <select className="px-5 py-4 min-w-[200px] rounded-xl border border-(--border) bg-(--background) focus:border-(--ring) outline-none cursor-pointer">
<option>Todos os cargos</option>
<option>Administrador</option>
<option>Atendente</option>
<option>Supervisor</option>
</select>
 
            <select className="px-5 py-4 min-w-[200px] rounded-xl border border-(--border) bg-(--background) focus:border-(--ring) outline-none cursor-pointer">
<option>Todos os status</option>
<option>Ativo</option>
<option>Inativo</option>
</select>
</div>
</div>
 
        {/* TABELA */}
        <div className="bg-(--card) border border-(--border) rounded-[28px] overflow-hidden shadow-(--shadow)">
          <div className="p-6 border-b border-(--border)">
<h2 className="text-xl font-semibold">
              Lista de usuários
</h2>
</div>
 
          <div className="overflow-x-auto">
<table className="w-full">
<thead>
                <tr className="text-left border-b border-(--border)">
<th className="p-5">Usuário</th>
<th className="p-5">E-mail</th>
<th className="p-5">Cargo</th>
<th className="p-5">Empresa</th>
<th className="p-5">Status</th>
<th className="p-5">Último acesso</th>
<th className="p-5"></th>
</tr>
</thead>
 
              <tbody>
                <UserRow
                  name="Victor Lima"
                  email="victor@empresa.com"
                  avatar="https://i.pinimg.com/736x/cd/24/05/cd2405c133bb83f3480772c88f666163.jpg"
                  company="Gelog"
                  companyLogo="https://play-lh.googleusercontent.com/9xmzOZwPsGFHY3qjNhOPLvoAGbrFPByMj6OE1gX_k-JC6MWL9GL-maiTX4PQTg4agwtUXTPa49X3vB_vdoYnpw=w240-h480-rw"
                  role="Administrador"
                  status="Ativo"
                  access="5 min atrás"
                />
 
                <UserRow
                  name="Vebeke Hanashiro"
                  email="vebeke@empresa.com"
                  avatar="https://i.pinimg.com/736x/97/02/d9/9702d99e8f121abb9b6fab74a815ed3f.jpg"
                  company="Santos Brasil Ltda"
                  companyLogo="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSvauPQWTqXeWu2sLHU9MiA0rIj9UDCI0KoA&s"
                  role="Atendente"
                  status="Ativo"
                  access="20 min atrás"
                />
 
                <UserRow
                  name="Gabriel Morgado"
                  email="gabriel@empresa.com"
                  avatar="https://i.pinimg.com/736x/85/1c/bf/851cbfbe1c08e46625ca449f8e8bd71b.jpg"
                  company="PierSec"
                  companyLogo="https://lh3.googleusercontent.com/a-/ALV-UjUYR5Wyv52kiSY5Urz0ZHYbxjpnAyK306ZqU29PKWBps-8FzP8"
                  role="Supervisor"
                  status="Ativo"
                  access="1 hora atrás"
                />
 
                <UserRow
                  name="Erick Oliveira"
                  email="erick@empresa.com"
                  avatar="https://i.pinimg.com/736x/f0/a6/a2/f0a6a2bcb052906b2a317c84e2e39711.jpg"
                  company="SGS do Brasil"
                  companyLogo="https://www.issosignifica.com/sgs-2-w400.jpg"
                  role="Atendente"
                  status="Inativo"
                  access="3 dias atrás"
                />
</tbody>
</table>
</div>
</div>
</main>
</div>
  );
}
 
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-(--card) border border-(--border) rounded-[28px] p-6 shadow-(--shadow)">
<div className="flex justify-between items-center">
<div>
          <p className="text-(--muted-foreground) text-sm">
            {title}
</p>
 
          <h2 className="text-4xl font-bold mt-2">
            {value}
</h2>
</div>
 
        <div className="h-14 w-14 rounded-2xl bg-(--primary) text-(--primary-foreground) flex items-center justify-center opacity-90">
          {icon}
</div>
</div>
</div>
  );
}
 
function UserRow({
  name,
  email,
  avatar,
  role,
  status,
  access,
  company,
  companyLogo,
}: {
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: string;
  access: string;
  company: string;
  companyLogo: string;
}) {
  return (
    <tr className="border-b border-(--border) hover:bg-(--muted) transition">
<td className="p-5">
<div className="flex items-center gap-3">
<img
            src={avatar}
            alt={name}
            className="h-10 w-10 rounded-full"
          />
 
          <span className="font-medium">{name}</span>
</div>
</td>
 
      <td className="p-5 text-(--muted-foreground)">
        {email}
</td>
 
      <td className="p-5">{role}</td>

      <td className="p-5">
        <div className="flex items-center gap-2">
          <img
            src={companyLogo}
            alt={company}
            className="h-6 w-6 rounded-md object-contain"
          />
          <span>{company}</span>
        </div>
      </td>

      <td className="p-5">
        <span className={status === "Ativo" ? "badge-success" : "badge-danger"}>
          {status}
        </span>
      </td>

      <td className="p-5 text-(--muted-foreground)">{access}</td>

      <td className="p-5">
        <button>
          <MoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
}